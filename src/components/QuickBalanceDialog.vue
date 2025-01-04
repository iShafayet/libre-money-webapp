<template>
  <q-dialog ref="dialogRef" @hide="onDialogHide" no-backdrop-dismiss>
    <q-card class="q-dialog-plugin">
      <q-card-section>
        <div class="std-dialog-title" style="margin-bottom: 12px">Balances</div>

        <loading-indicator :is-loading="isLoading" :phases="4" ref="loadingIndicator"></loading-indicator>

        <div class="quick-balance-table-container">
          <table class="overview-table" v-for="overviewAndCurrency in overviewAndCurrencyList" v-bind:key="overviewAndCurrency.currency._id">
            <tbody>
              <tr>
                <th style="width: 140px">Wallet</th>
                <th>Balance</th>
              </tr>
              <tr v-for="row in overviewAndCurrency.overview!.wallets.list" v-bind:key="row.walletId">
                <td>{{ row.wallet.name }}</td>
                <td>
                  {{ prettifyAmount(row.balance) }} {{ overviewAndCurrency.currency.sign }}
                  <span class="wallet-limit" v-if="row.minimumBalanceState !== 'not-set'">
                    <span class="wallet-limit-warning" v-if="row.minimumBalanceState === 'warning'">
                      (Approaching limit {{ prettifyAmount(row.wallet.minimumBalance!) }} {{ overviewAndCurrency.currency.sign }})
                    </span>
                    <span class="wallet-limit-exceeded" v-else-if="row.minimumBalanceState === 'exceeded'">
                      (Exceeded limit {{ prettifyAmount(row.wallet.minimumBalance!) }} {{ overviewAndCurrency.currency.sign }})
                    </span>
                    <span class="wallet-limit-normal" v-else-if="row.minimumBalanceState === 'normal'">
                      (Limit {{ prettifyAmount(row.wallet.minimumBalance!) }} {{ overviewAndCurrency.currency.sign }})
                    </span>
                  </span>
                </td>
              </tr>
              <tr>
                <th>Grand Total</th>
                <th>{{ prettifyAmount(overviewAndCurrency.overview!.wallets.sumOfBalances) }} {{ overviewAndCurrency.currency.sign }}</th>
              </tr>
            </tbody>
          </table>
        </div>
      </q-card-section>

      <q-card-actions class="row justify-end" style="margin-right: 8px; margin-bottom: 8px">
        <q-btn color="primary" label="Close" @click="okClicked" />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script lang="ts">
import { useDialogPluginComponent, useQuasar } from "quasar";
import { prettifyAmount } from "src/utils/misc-utils";
import { Ref, onMounted, ref } from "vue";
import LoadingIndicator from "src/components/LoadingIndicator.vue";
import { computationService } from "src/services/computation-service";
import { useSettingsStore } from "src/stores/settings";
import { setDateToTheFirstDateOfMonth } from "src/utils/date-utils";
import { Overview } from "src/models/inferred/overview";
import { lockService } from "src/services/lock-service";
import { dialogService } from "src/services/dialog-service";
import { CodedError } from "src/utils/error-utils";
import { Collection } from "src/constants/constants";
import { pouchdbService } from "src/services/pouchdb-service";
import { Currency } from "src/models/currency";

export default {
  props: {},

  components: { LoadingIndicator },

  emits: [...useDialogPluginComponent.emits],

  setup(props) {
    const { dialogRef, onDialogHide, onDialogOK, onDialogCancel } = useDialogPluginComponent();

    const $q = useQuasar();
    const settingsStore = useSettingsStore();

    const isLoading = ref(true);
    const loadingIndicator = ref<InstanceType<typeof LoadingIndicator>>();

    const startEpoch: Ref<number> = ref(setDateToTheFirstDateOfMonth(Date.now()));
    const endEpoch: Ref<number> = ref(Date.now());

    const overviewAndCurrencyList: Ref<{ overview: Overview | null; currency: Currency }[]> = ref([]);

    async function loadOverview() {
      isLoading.value = true;

      const currencyList = (await pouchdbService.listByCollection(Collection.CURRENCY)).docs as Currency[];
      overviewAndCurrencyList.value = await Promise.all(
        currencyList.map(async (currency) => {
          let newOverview = await computationService.computeOverview(startEpoch.value, endEpoch.value, currency._id!);
          if (newOverview) {
            newOverview.wallets.list.sort((a, b) => a.wallet.name.localeCompare(b.wallet.name));
          }
          return { overview: newOverview, currency };
        })
      );

      isLoading.value = false;
    }

    async function okClicked() {
      onDialogOK();
    }

    onMounted(() => {
      loadOverview();
    });

    return {
      dialogRef,
      onDialogHide,
      okClicked,
      cancelClicked: onDialogCancel,
      isLoading,
      prettifyAmount,
      overviewAndCurrencyList,
    };
  },
};
</script>
<style scoped lang="scss">
@import url(./../css/table.scss);

.quick-balance-table-container {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.wallet-limit-normal {
  color: #546e7a;
}

.wallet-limit-warning {
  color: #546e7a;
  border-bottom: 4px solid #ffd740;
}

.wallet-limit-exceeded {
  color: #bf360c;
}

@media (max-width: $breakpoint-xs-max) {
  .wallet-limit {
    display: block;
  }
}
</style>
