<template>
  <q-page class="column items-center justify-start">
    <!-- Filter - Start -->
    <q-card class="std-card" v-if="ledger">
      <div class="title-row q-pa-md q-gutter-sm">
        <q-btn color="secondary" icon="filter_list" flat round @click="setFiltersClicked" />
        <div class="title">
          {{ ledger.account.name }} Ledger
          <div class="subtitle" v-if="filters">
            <span v-if="filters.startEpoch === 0">
              <span v-if="ledger.ledgerEntryList.length > 0">
                {{ prettifyDate(ledger.ledgerEntryList[0].entryEpoch) }} to {{ prettifyDate(filters.endEpoch) }}
              </span>
              <span v-else>
                Up to {{ prettifyDate(filters.endEpoch) }}
              </span>
            </span>
            <span v-else>
              {{ prettifyDate(filters.startEpoch) }} to {{ prettifyDate(filters.endEpoch) }}
            </span>
          </div>
        </div>
      </div>

    </q-card>
    <!-- Filter - End -->

    <!-- Ledger - Start -->
    <q-card class="std-card" v-if="!isLoading && ledger && ledger.ledgerEntryList.length > 0">
      <div class="q-pa-md ledger-presentation">
        <div class="ledger-head row">
          <div class="date-head">Date</div>
          <div class="particulars-container-head row">
            <div class="particulars-head">Particulars</div>
            <div class="debit-head">Debit</div>
            <div class="credit-head">Credit</div>
            <div class="balance-head">Balance ({{ ledger.isBalanceDebit ? "Debit" : "Credit" }})</div>
          </div>
        </div>
        <template v-for="ledgerEntry in ledger.ledgerEntryList" v-bind:key="ledgerEntry.serial">
          <div class="ledger-entry row">
            <div class="date">
              {{ prettifyDate(ledgerEntry.entryEpoch) }}
            </div>
            <div class="particulars-text">
              {{ ledgerEntry.description }}
              <div v-if="ledgerEntry.notes">{{ ledgerEntry.notes }}</div>
            </div>
            <div class="debit-sum">{{ ledgerEntry.debitAmount }}&nbsp;{{ ledgerEntry._currencySign }}</div>
            <div class="credit-sum">{{ ledgerEntry.creditAmount }}&nbsp;{{ ledgerEntry._currencySign }}</div>
            <div class="balance-sum">{{ ledgerEntry.balance }}&nbsp;{{ ledgerEntry._currencySign }}</div>
          </div>
        </template>
      </div>
    </q-card>
    <!-- Ledger - End -->

    <!-- Summary - Start -->
    <q-card class="std-card" v-if="!isLoading && ledger && ledger.balanceList.length > 0">
      <div class="q-pa-md balance-presentation">
        <div class="balance-head row">
          <div class="currency-head">Currency</div>
          <div class="balance-head">Total Balance</div>
        </div>
        <template v-for="balanceEntry in ledger.balanceList" v-bind:key="balanceEntry.currencyId">
          <div class="balance-entry row">
            <div class="currency">
              {{ balanceEntry._currency!.name }}
            </div>
            <div class="balance">
              {{ balanceEntry.balance }}&nbsp;{{ balanceEntry._currency?.sign }}
            </div>
          </div>
        </template>
      </div>
    </q-card>
    <!-- Summary - End -->

  </q-page>
</template>

<script lang="ts" setup>
import { useQuasar } from "quasar";
import { AccLedgerEntry } from "src/models/accounting/acc-ledger-entry";
import { Record } from "src/models/record";
import { accountingService } from "src/services/accounting-service";
import { Ref, ref, watch } from "vue";
import { deepClone, prettifyDate, prettifyDateTime, sleep } from "src/utils/misc-utils";
import { Collection, dateRangePresetList, defaultPartyType, partyTypeList } from "src/constants/constants";
import DateInput from "src/components/lib/DateInput.vue";
import { getStartAndEndEpochFromPreset } from "src/utils/date-range-preset-utils";
import { AccLedgerFilters } from "src/models/accounting/acc-ledger-filters";
import FilterAccLedgerDialog from "src/components/FilterAccLedgerDialog.vue";
import { useRoute, useRouter } from "vue-router";
import { AccJournalFilters } from "src/models/accounting/acc-journal-filters";
import { dialogService } from "src/services/dialog-service";
import { AccAccount } from "src/models/accounting/acc-account";
import { AccLedger } from "src/models/accounting/acc-ledger";

const getDefaultFilters = () => {
  return {
    startEpoch: 0,
    endEpoch: Date.now()
  };
};

const $q = useQuasar();
const route = useRoute();
const router = useRouter();

const ledger: Ref<AccLedger | null> = ref(null);

// ----- Refs
const isLoading = ref(false);

const filters: Ref<AccLedgerFilters> = ref(getDefaultFilters());

// ----- Functions
async function loadData() {
  isLoading.value = true;

  const {
    accountMap,
    accountList,
    journalEntryList,
  } = await accountingService.initiateAccounting();

  const { startEpoch, endEpoch } = filters.value;
  const journalFilters: AccJournalFilters = {
    startEpoch,
    endEpoch
  };
  const filteredJournalEntryList = await accountingService.applyJournalFilters(journalEntryList, journalFilters);

  const accountCode = route.params.accountCode || null;
  if (!accountCode || Array.isArray(accountCode)) {
    dialogService.alert("Error", "Routing error");
    router.push({ name: "acc-accounts" });
    return;
  }
  if (!(accountCode in accountMap)) {
    dialogService.alert("Error", "Routing error");
    router.push({ name: "acc-accounts" });
    return;
  }

  const _ledger = await accountingService.generateLedgerFromJournal(filteredJournalEntryList, accountMap, accountCode);

  console.debug({ ..._ledger });

  ledger.value = _ledger;

  isLoading.value = false;
}


// ----- Event Handlers


async function setFiltersClicked() {
  $q.dialog({ component: FilterAccLedgerDialog, componentProps: { inputFilters: deepClone(filters.value) } }).onOk((res: AccLedgerFilters) => {
    filters.value = res;
    loadData();
  });
}



// ----- Computed and Embedded

// ----- Watchers


// ----- Execution

loadData();
</script>

<style scoped lang="scss">
.subtitle {
  font-size: 12px;
}

.ledger-presentation {
  width: 100%;

  .ledger-head {
    width: 100%;
    align-items: stretch;
    background-color: #37474f;
    color: white;
    margin-bottom: 12px;
    flex-wrap: nowrap;

    .date-head {
      width: 100px;
      padding: 4px;
      border: 1px solid rgb(220, 220, 220);
      border-collapse: collapse;
    }

    .particulars-container-head {
      flex: 1;
      flex-wrap: nowrap;

      .particulars-head {
        flex: 1;
        flex-wrap: nowrap;
        padding: 4px;
        border: 1px solid rgb(220, 220, 220);
        border-collapse: collapse;
      }

      .debit-head {
        width: 100px;
        padding: 4px;
        border: 1px solid rgb(220, 220, 220);
        border-collapse: collapse;
      }

      .credit-head {
        width: 100px;
        padding: 4px;
        border: 1px solid rgb(220, 220, 220);
        border-collapse: collapse;
      }

      .balance-head {
        width: 100px;
        padding: 4px;
        border: 1px solid rgb(220, 220, 220);
        border-collapse: collapse;
      }
    }
  }

  .ledger-entry {
    width: 100%;
    align-items: stretch;
    margin-bottom: 12px;
    flex-wrap: nowrap;

    .date {
      width: 100px;
      border: 1px solid rgb(220, 220, 220);
      border-collapse: collapse;
      padding: 4px;
    }

    .particulars-text {
      flex: 1;
      flex-wrap: nowrap;
      border: 1px solid rgb(220, 220, 220);
      border-collapse: collapse;
      padding: 4px;
    }

    .debit-sum,
    .credit-sum,
    .balance-sum {
      width: 100px;
      text-align: right;
      border: 1px solid rgb(220, 220, 220);
      border-collapse: collapse;
      padding: 4px;
    }

    .warning {
      color: #f4511e;
    }

    .multi-currency-note {
      color: #1976d2;
    }
  }
}

.balance-presentation {
  .balance-head {
    width: 100%;
    align-items: stretch;
    background-color: #37474f;
    color: white;
    flex-wrap: nowrap;

    .currency-head {
      flex: 1;
      padding: 4px;
      border: 1px solid rgb(220, 220, 220);
      border-collapse: collapse;
    }

    .balance-head {
      width: 100px;
      padding: 4px;
      border: 1px solid rgb(220, 220, 220);
      border-collapse: collapse;
    }
  }

  .balance-entry {
    width: 100%;
    align-items: stretch;
    flex-wrap: nowrap;

    .currency {
      flex: 1;
      padding: 4px;
      border: 1px solid rgb(220, 220, 220);
      border-collapse: collapse;
    }

    .balance {
      width: 100px;
      padding: 4px;
      border: 1px solid rgb(220, 220, 220);
      border-collapse: collapse;
    }
  }
}
</style>
