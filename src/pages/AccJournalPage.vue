<template>
  <q-page class="row items-start justify-evenly">

    <!-- Journal - Start -->
    <q-card class="std-card" v-if="!isLoading && journalEntryList.length > 0">
      <div class="q-pa-md">
        <table class="overview-table journal-table">
          <tbody>
            <tr>
              <th colspan="1">SL</th>
              <th colspan="1">Debit</th>
              <th colspan="1">Debit Sum</th>
              <th colspan="1">Credit</th>
              <th colspan="1">Credit Sum</th>
              <th colspan="1">Notes</th>
            </tr>
            <template v-for="journalEntry in journalEntryList" v-bind:key="journalEntry.serial">
              <tr>
                <td>{{ journalEntry.serial }}</td>
                <td>
                  <div v-for="debit in journalEntry.debitList" v-bind:key="debit.account">
                    {{ debit.account.name }} ({{ debit.account.type }}) - {{ debit.amount }}
                  </div>
                </td>
                <td>{{ journalEntry.sumDebits }}</td>
                <td>
                  <div v-for="credit in journalEntry.creditList" v-bind:key="credit.account">
                    {{ credit.account.name }} ({{ credit.account.type }}) - {{ credit.amount }}
                  </div>
                </td>
                <td>{{ journalEntry.sumCredits }}</td>
                <td>{{ journalEntry.notes }}</td>
              </tr>
            </template>
          </tbody>
        </table>
      </div>
    </q-card>
    <!-- Journal - End -->
  </q-page>
</template>

<script lang="ts" setup>
import { useQuasar } from "quasar";
import { AccJournalEntry } from "src/models/accounting/acc-journal-entry";
import { Record } from "src/models/record";
import { accountingService } from "src/services/accounting-service";
import { Ref, ref } from "vue";

const $q = useQuasar();

// ----- Refs
const isLoading = ref(false);
const journalEntryList: Ref<AccJournalEntry[]> = ref([]);


// ----- Functions
async function loadData() {
  isLoading.value = true;

  const { accountMap,
    accountList,
    journalEntryList: _journalEntryList,
  } = await accountingService.initiateAccounting();

  console.log({ _journalEntryList });

  journalEntryList.value = _journalEntryList;

  isLoading.value = false;
}

// ----- Event Handlers


// ----- Computed and Embedded

// ----- Watchers


// ----- Execution

loadData();
</script>

<style scoped lang="scss">
@import url(./../css/table.scss);


.amount-in {
  color: rgb(7, 112, 7);
}

.amount-out {
  color: rgb(112, 7, 7);
}

.quick-summary-title {
  font-size: 16px;
  padding-top: 8px;
  padding-bottom: 8px;
  text-align: right;
}

.journal-table {
  font-size: 12px;
  margin-bottom: 0px;
}

.username {
  font-size: 8px;
  text-transform: capitalize;
}
</style>
