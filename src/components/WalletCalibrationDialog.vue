<template>
  <q-dialog ref="dialogRef" @hide="onDialogHide" no-backdrop-dismiss>
    <q-card class="q-dialog-plugin">
      <q-card-section>
        <div class="std-dialog-title" style="margin-bottom: 12px">Calibrate Wallet</div>

        <div class="wallet-calibration-content">
          <div class="wallet-name">Wallet: {{ wallet.name }}</div>

          <div class="balance-section">
            <div class="balance-row">
              <span class="balance-label">Current Balance:</span>
              <span class="balance-value">{{ prettifyAmount(calibration?.currentBalance) }} {{ calibration?.currencySign }}</span>
            </div>

            <div class="balance-row">
              <span class="balance-label">New Balance:</span>
              <div class="balance-controls">
                <q-btn flat dense icon="add" @click="incrementBalance" />
                <q-input v-model.number="newBalance" type="number" dense outlined :step="stepSize" class="balance-input" />
                <q-btn flat dense icon="remove" @click="decrementBalance" />
              </div>
            </div>

            <div class="balance-row" v-if="balanceDifference !== 0">
              <span class="balance-label">Total {{ balanceDifference > 0 ? "Increase" : "Decrease" }}:</span>
              <span class="balance-value">{{ prettifyAmount(Math.abs(balanceDifference)) }} {{ calibration?.currencySign }}</span>
            </div>
          </div>

          <div class="breakdown-section">
            <div class="breakdown-header">
              <span class="section-title">Breakdown</span>
              <q-btn flat dense icon="add" label="Add Breakdown" @click="addBreakdownRow" class="add-breakdown-btn" />
            </div>

            <div v-for="(row, index) in breakdownRows" :key="index" class="breakdown-row">
              <q-select v-model="row.type" :options="breakdownTypes" dense outlined class="breakdown-type" emit-value map-options />
              <q-input v-model.number="row.amount" type="number" dense outlined class="breakdown-amount" :prefix="calibration?.currencySign" />
              <q-btn flat dense icon="delete" @click="removeBreakdownRow(index)" class="delete-btn" />
            </div>

            <div class="breakdown-row" v-if="remainingAmount !== 0">
              <span class="auto-adjusted">
                Auto-adjusted {{ remainingAmount > 0 ? "Income" : "Expense" }}: {{ prettifyAmount(Math.abs(remainingAmount)) }} {{ calibration?.currencySign }}
              </span>
            </div>
          </div>
        </div>
      </q-card-section>

      <q-card-actions class="row justify-start std-bottom-action-row">
        <q-btn color="blue-grey" label="Cancel" @click="cancelClicked" />
        <div class="spacer"></div>
        <q-btn color="primary" label="Save" @click="saveClicked" />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script lang="ts">
import { useDialogPluginComponent } from "quasar";
import { ref, Ref, watch, computed, onMounted } from "vue";
import { entityService } from "src/services/entity-service";
import { useSettingsStore } from "src/stores/settings";
import { prettifyAmount } from "src/utils/misc-utils";

type WalletCalibration = {
  walletId: string;
  currencyId: string;
  currencySign: string;
  currentBalance: number;
};

type BreakdownRow = {
  type: "expense" | "income";
  expenseAvenueId: string;
  incomeSourceId: string;
  amount: number;
};

export default {
  props: {
    wallet: {
      type: Object,
      required: true,
    },
    balance: {
      type: Number,
      required: true,
    },
  },

  emits: [...useDialogPluginComponent.emits],

  setup(props) {
    const { dialogRef, onDialogHide, onDialogOK, onDialogCancel } = useDialogPluginComponent();
    const settingsStore = useSettingsStore();

    const calibration: Ref<WalletCalibration | null> = ref(null);
    const newBalance = ref(0);
    const breakdownRows = ref<BreakdownRow[]>([]);

    const stepSize = computed(() => settingsStore.walletCalibrationStepSize);
    const breakdownTypes = [
      { label: "Expense Avenue", value: "expense" },
      { label: "Income Source", value: "income" },
    ];

    const balanceDifference = computed(() => {
      if (!calibration.value) return 0;
      return newBalance.value - calibration.value.currentBalance;
    });

    const totalBreakdownAmount = computed(() => {
      return breakdownRows.value.reduce((sum, row) => {
        return sum + (row.type === "income" ? row.amount : -row.amount);
      }, 0);
    });

    const remainingAmount = computed(() => {
      return balanceDifference.value - totalBreakdownAmount.value;
    });

    function incrementBalance() {
      newBalance.value += stepSize.value;
    }

    function decrementBalance() {
      newBalance.value -= stepSize.value;
    }

    function addBreakdownRow() {
      breakdownRows.value.push({
        type: "expense",
        expenseAvenueId: "",
        incomeSourceId: "",
        amount: 0,
      });
    }

    function removeBreakdownRow(index: number) {
      breakdownRows.value.splice(index, 1);
    }

    async function loadCalibration() {
      let currency = await entityService.getCurrency(props.wallet.currencyId!);

      calibration.value = {
        walletId: props.wallet._id!,
        currencyId: props.wallet.currencyId!,
        currencySign: currency.sign,
        currentBalance: props.balance,
      };

      newBalance.value = props.balance;
    }

    function saveClicked() {
      // TODO: Implement save logic
      onDialogOK();
    }

    onMounted(() => {
      loadCalibration();
    });

    return {
      dialogRef,
      onDialogHide,
      saveClicked,
      cancelClicked: onDialogCancel,
      calibration,
      newBalance,
      breakdownRows,
      stepSize,
      breakdownTypes,
      balanceDifference,
      remainingAmount,
      incrementBalance,
      decrementBalance,
      addBreakdownRow,
      removeBreakdownRow,
      prettifyAmount,
    };
  },
};
</script>

<style scoped lang="scss">
.wallet-calibration-content {
  padding: 16px 0;
}

.wallet-name {
  font-size: 1.1em;
  margin-bottom: 16px;
}

.balance-section {
  margin-bottom: 24px;
}

.balance-row {
  display: flex;
  align-items: center;
  margin-bottom: 12px;
}

.balance-label {
  width: 140px;
  font-weight: 500;
}

.balance-controls {
  display: flex;
  align-items: center;
  gap: 8px;
}

.balance-input {
  width: 120px;
}

.breakdown-section {
  margin-top: 24px;
}

.breakdown-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.section-title {
  font-weight: 500;
}

.breakdown-row {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}

.breakdown-type {
  width: 200px;
}

.breakdown-amount {
  width: 120px;
}

.auto-adjusted {
  color: #546e7a;
  font-style: italic;
}

.spacer {
  flex: 1;
}
</style>
