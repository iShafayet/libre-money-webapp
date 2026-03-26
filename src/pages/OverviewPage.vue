<template>
  <q-page padding class="page">
    <div class="row justify-center">
      <div class="col-12" style="max-width: 900px">
        <!-- Header -->
        <div class="header-row q-mb-md">
          <div class="month-and-year-input-wrapper" v-if="$q.screen.gt.xs">
            <month-and-year-input v-model:month="filterMonth" v-model:year="filterYear" @selection="monthAndYearSelected" />
          </div>
          <div class="header-actions">
            <q-btn icon="refresh" flat round size="md" @click="reloadClicked" />
            <select-currency v-model="recordCurrencyId" />
          </div>
        </div>
        <div class="month-and-year-input-wrapper q-mb-sm" v-if="$q.screen.lt.sm">
          <month-and-year-input v-model:month="filterMonth" v-model:year="filterYear" @selection="monthAndYearSelected" />
        </div>

        <!-- Quick Actions -->
        <div class="row q-col-gutter-sm q-mb-md">
          <div class="col">
            <q-btn color="primary" class="full-width" icon="add" label="Add Expense" @click="addExpenseClicked" />
          </div>
          <div class="col">
            <q-btn color="secondary" class="full-width" icon="trending_up" label="Add Income" @click="addIncomeClicked" />
          </div>
          <!-- <div class="col"><q-btn flat icon="format_list_bulleted" label="View Records" :to="{ name: 'records' }" /></div> -->
        </div>

        <!-- Loading -->
        <q-card class="std-card q-pa-md" :hidden="!isLoading">
          <loading-indicator :is-loading="isLoading" :phases="2" ref="loadingIndicator" />
        </q-card>

        <!-- Empty State -->
        <q-card class="std-card" v-if="!isLoading && !overview">
          <div class="q-pa-md q-gutter-sm">
            <div>
              Welcome to Libre Money!<br /><br />
              If this is your first time here, please read the <strong>Currently Imaginary</strong> getting started guide.<br /><br />
              If you already have some data on our servers, use the button to the top right to
              <strong>Sync</strong> your data to this device.<br /><br />
              Enjoy!
            </div>
          </div>
        </q-card>

        <!-- Dashboard Content -->
        <template v-if="!isLoading && overview">
          <!-- Budget Highlights -->
          <BudgetHighlights ref="budgetHighlightsRef" :filter-month="filterMonth" :filter-year="filterYear" @reloadRecords="loadData" />

          <!-- Income vs Expense Progress Bar -->
          <q-card class="q-mb-md" flat bordered>
            <q-card-section class="q-pb-xs">
              <div class="row items-center justify-between q-mb-xs">
                <div class="text-caption text-grey-7">Income vs Expense</div>
                <div class="text-caption text-grey-7">
                  Balance:
                  <span :class="profit >= 0 ? 'text-positive' : 'text-negative'" class="text-weight-medium">
                    {{ printAmount(profit) }}
                  </span>
                </div>
              </div>
              <div class="income-expense-bar rounded-borders overflow-hidden" style="height: 10px">
                <div class="income-expense-bar__income" :style="{ width: incomeVsExpenseBarPercent + '%' }" />
                <div class="income-expense-bar__expense" :style="{ width: expenseVsIncomeBarPercent + '%' }" />
              </div>
              <div class="row justify-between q-mt-xs">
                <div class="row items-center gap-xs">
                  <span class="income-expense-bar__dot income-expense-bar__dot--income" />
                  <span class="text-caption text-positive text-weight-medium">{{ printAmount(overview.income.grandSum) }}</span>
                  <span class="text-caption text-grey-6 q-ml-xs">Income</span>
                </div>
                <div class="row items-center gap-xs">
                  <span class="text-caption text-grey-6 q-mr-xs">Expense</span>
                  <span class="text-caption text-negative text-weight-medium">{{ printAmount(overview.expense.grandSum) }}</span>
                  <span class="income-expense-bar__dot income-expense-bar__dot--expense" />
                </div>
              </div>
            </q-card-section>
          </q-card>

          <!-- Top Expense Categories -->
          <div class="row q-col-gutter-md q-mb-md">
            <div class="col-12">
              <q-card class="q-pb-md">
                <q-card-section>
                  <div class="text-h6">Top Expense Categories</div>
                  <div class="text-subtitle2 text-grey-7">Highest spending this period</div>
                </q-card-section>
                <q-list v-if="topExpenseCategories.length > 0" dense>
                  <q-item v-for="row in topExpenseCategories" :key="row.expenseAvenueId">
                    <q-item-section>
                      <div class="row items-center justify-between q-mb-xs">
                        <q-item-label>{{ row.expenseAvenue.name }}</q-item-label>
                        <span class="text-caption text-weight-medium">{{ printAmount(row.sum) }}</span>
                      </div>
                      <q-linear-progress :value="expensePercent(row.sum)" color="indigo-5" size="6px" rounded />
                    </q-item-section>
                  </q-item>
                </q-list>
                <q-card-section v-else class="text-grey-6 text-center">No expenses</q-card-section>
              </q-card>
            </div>
          </div>

          <!-- Top Expenses -->
          <div class="row q-col-gutter-md q-mb-md">
            <div class="col-12">
              <q-card class="q-pb-md">
                <q-card-section>
                  <div class="text-h6">Top Expenses</div>
                  <div class="text-subtitle2 text-grey-7">This period</div>
                </q-card-section>
                <q-list v-if="topExpenses.length > 0" dense>
                  <q-item v-for="row in topExpenses" :key="row.expenseAvenueId">
                    <q-item-section>
                      <div class="row items-center justify-between q-mb-xs">
                        <q-item-label>{{ row.expenseAvenue.name }}</q-item-label>
                        <span class="text-caption text-weight-medium">{{ printAmount(row.sum) }}</span>
                      </div>
                      <q-linear-progress :value="expensePercent(row.sum)" color="indigo-5" size="6px" rounded />
                    </q-item-section>
                  </q-item>
                </q-list>
                <q-card-section v-else class="text-grey-6 text-center">No expenses</q-card-section>
              </q-card>
            </div>
          </div>
          <!-- Top Income Sources -->
          <div class="row q-col-gutter-md q-mb-md">
            <div class="col-12">
              <q-card class="q-pb-md">
                <q-card-section>
                  <div class="text-h6">Top Income Sources</div>
                  <div class="text-subtitle2 text-grey-7">This period</div>
                </q-card-section>
                <q-list v-if="topIncome.length > 0" dense>
                  <q-item v-for="row in topIncome" :key="row.incomeSourceId">
                    <q-item-section>
                      <div class="row items-center justify-between q-mb-xs">
                        <q-item-label>{{ row.incomeSource.name }}</q-item-label>
                        <span class="text-caption text-weight-medium">{{ printAmount(row.sum) }}</span>
                      </div>
                      <q-linear-progress :value="incomePercent(row.sum)" color="teal-5" size="6px" rounded />
                    </q-item-section>
                  </q-item>
                </q-list>
                <q-card-section v-else class="text-grey-6 text-center">No income</q-card-section>
              </q-card>
            </div>
          </div>

          <!-- Main Content Grid -->
          <div class="row q-col-gutter-md">
            <!-- Wallet Balances -->
            <div class="col-12 col-lg-6">
              <q-card class="">
                <q-card-section>
                  <div class="text-h6">Wallet Balances</div>
                  <div class="text-subtitle2 text-grey-7">as of {{ new Date().toLocaleDateString() }}</div>
                </q-card-section>
                <q-list v-if="overview.wallets.list.length > 0" dense>
                  <q-item v-for="row in overview.wallets.list" :key="row.walletId">
                    <q-item-section>
                      <q-item-label>{{ row.wallet.name }}</q-item-label>
                      <q-item-label caption v-if="row.minimumBalanceState !== 'not-set'">
                        <span class="wallet-limit-warning" v-if="row.minimumBalanceState === 'warning'">
                          Approaching limit {{ printAmount(row.wallet.minimumBalance!) }}
                        </span>
                        <span class="wallet-limit-exceeded" v-else-if="row.minimumBalanceState === 'exceeded'">
                          Exceeded limit {{ printAmount(row.wallet.minimumBalance!) }}
                        </span>
                        <span class="wallet-limit-normal" v-else-if="row.minimumBalanceState === 'normal'">
                          Limit {{ printAmount(row.wallet.minimumBalance!) }}
                        </span>
                      </q-item-label>
                    </q-item-section>
                    <q-item-section side>
                      <q-item-label>{{ printAmount(row.balance) }}</q-item-label>
                    </q-item-section>
                  </q-item>
                  <q-separator />
                  <q-item>
                    <q-item-section>
                      <q-item-label class="text-weight-bold">Grand Total</q-item-label>
                    </q-item-section>
                    <q-item-section side>
                      <q-item-label class="text-weight-bold">{{ printAmount(overview.wallets.sumOfBalances) }}</q-item-label>
                    </q-item-section>
                  </q-item>
                </q-list>
                <q-card-section v-else class="text-grey-6 text-center">No wallets</q-card-section>
              </q-card>
            </div>
          </div>

          <!-- Assets and Loans Summary -->
          <div class="row q-col-gutter-md q-mt-sm">
            <div class="col-12 col-md-6">
              <q-card class="">
                <q-card-section>
                  <div class="text-h6">Assets by Liquidity</div>
                </q-card-section>
                <q-list v-if="assetsByLiquidity.length > 0" dense>
                  <q-item v-for="item in assetsByLiquidity" :key="item.liquidity">
                    <q-item-section>
                      <q-item-label>{{ item.liquidity }} Liquidity</q-item-label>
                    </q-item-section>
                    <q-item-section side>
                      <q-item-label>{{ printAmount(item.sum) }}</q-item-label>
                    </q-item-section>
                  </q-item>
                  <q-separator />
                  <q-item>
                    <q-item-section>
                      <q-item-label class="text-weight-bold">Total Assets</q-item-label>
                    </q-item-section>
                    <q-item-section side>
                      <q-item-label class="text-weight-bold">{{ printAmount(overview.assets.sumOfBalances) }}</q-item-label>
                    </q-item-section>
                  </q-item>
                </q-list>
                <q-card-section v-else class="text-grey-6 text-center">No assets</q-card-section>
              </q-card>
            </div>
            <div class="col-12 col-md-6">
              <q-card>
                <q-card-section>
                  <div class="text-h6">Loans & Debts</div>
                  <q-btn v-if="hasLoansOrDebts" flat dense size="sm" label="View all" :to="{ name: 'payables-receivables-consolidated' }" class="q-ml-sm" />
                </q-card-section>
                <q-list v-if="hasLoansOrDebts" dense>
                  <q-item>
                    <q-item-section>
                      <q-item-label>You are owed</q-item-label>
                    </q-item-section>
                    <q-item-section side>
                      <q-item-label class="text-positive">{{ printAmount(overview.loanAndDebts.userIsOwedTotalAmount) }}</q-item-label>
                    </q-item-section>
                  </q-item>
                  <q-item>
                    <q-item-section>
                      <q-item-label>You owe</q-item-label>
                    </q-item-section>
                    <q-item-section side>
                      <q-item-label class="text-negative">{{ printAmount(overview.loanAndDebts.userOwesTotalAmount) }}</q-item-label>
                    </q-item-section>
                  </q-item>
                </q-list>
                <q-card-section v-else class="text-grey-6 text-center">No outstanding loans or debts</q-card-section>
              </q-card>
            </div>
          </div>
        </template>
      </div>
    </div>
  </q-page>
</template>

<script lang="ts" setup>
import { useQuasar } from "quasar";
import BudgetHighlights from "src/components/BudgetHighlights.vue";
import LoadingIndicator from "src/components/LoadingIndicator.vue";
import MonthAndYearInput from "src/components/lib/MonthAndYearInput.vue";
import SelectCurrency from "src/components/SelectCurrency.vue";
import AddExpenseRecord from "src/components/AddExpenseRecord.vue";
import AddIncomeRecord from "src/components/AddIncomeRecord.vue";

import { Overview } from "src/models/inferred/overview";
import { computationService } from "src/services/computation-service";
import { dialogService } from "src/services/dialog-service";
import { errorService } from "src/services/error-service";
import { lockService } from "src/services/lock-service";
import { useSettingsStore } from "src/stores/settings";
import { normalizeEpochRange } from "src/utils/date-utils";
import { printAmount as printAmountUtil } from "src/utils/de-facto-utils";
import { CodedError } from "src/utils/error-utils";
import { Ref, computed, onMounted, ref, watch } from "vue";

const $q = useQuasar();
const settingsStore = useSettingsStore();

// ----- Refs
const isMounted = ref(false);
const isLoading = ref(true);
const loadingIndicator = ref<InstanceType<typeof LoadingIndicator>>();
const budgetHighlightsRef = ref<InstanceType<typeof BudgetHighlights>>();

const recordCurrencyId: Ref<string | null> = ref(settingsStore.defaultCurrencyId);
const filterMonth = ref(new Date().getMonth());
const filterYear = ref(new Date().getFullYear());
const overview: Ref<Overview | null> = ref(null);

// ----- Derived epoch range
function getEpochRange(): [number, number] {
  const rangeStart = new Date(filterYear.value, filterMonth.value, 1);
  const rangeEnd = new Date(filterYear.value, filterMonth.value, 1);
  rangeEnd.setMonth(rangeEnd.getMonth() + 1);
  rangeEnd.setDate(rangeEnd.getDate() - 1);
  const [start, end] = normalizeEpochRange(rangeStart.getTime(), rangeEnd.getTime());
  return [start, end];
}

// ----- Computed
const netWorth = computed(() => {
  if (!overview.value) return 0;
  return overview.value.finalBalance.totalAsset - overview.value.finalBalance.totalLiability;
});

const liquidCash = computed(() => {
  if (!overview.value) return 0;
  const { wallets, finalCurrentBalanceWithHighLiquidity } = overview.value;
  return wallets.sumOfBalances + (finalCurrentBalanceWithHighLiquidity?.highLiquidiyAssetValue ?? 0);
});

const profit = computed(() => {
  if (!overview.value) return 0;
  return overview.value.income.grandSum - overview.value.expense.grandSum;
});

const topExpenseCategories = computed(() => {
  if (!overview.value) return [];
  return overview.value.expense.list.slice(0, 5);
});

const topExpenses = computed(() => {
  if (!overview.value) return [];
  return overview.value.expense.list.slice(0, 7);
});

const topIncome = computed(() => {
  if (!overview.value) return [];
  return overview.value.income.list.slice(0, 7);
});

const assetsByLiquidity = computed(() => {
  if (!overview.value) return [];
  return overview.value.assets.sumByLiquidity.filter((item) => item.sum > 0);
});

const incomeExpenseTotal = computed(() => {
  if (!overview.value) return 0;
  return overview.value.income.grandSum + overview.value.expense.grandSum;
});

const incomeVsExpenseBarPercent = computed(() => {
  if (!incomeExpenseTotal.value) return 50;
  return (overview.value!.income.grandSum / incomeExpenseTotal.value) * 100;
});

const expenseVsIncomeBarPercent = computed(() => {
  if (!incomeExpenseTotal.value) return 50;
  return (overview.value!.expense.grandSum / incomeExpenseTotal.value) * 100;
});

const hasLoansOrDebts = computed(() => {
  if (!overview.value) return false;
  const { userIsOwedTotalAmount, userOwesTotalAmount } = overview.value.loanAndDebts;
  return userIsOwedTotalAmount > 0 || userOwesTotalAmount > 0;
});

// ----- Functions
function printAmount(amount: number) {
  return printAmountUtil(amount, overview.value?.currency._id ?? recordCurrencyId.value ?? undefined);
}

function expensePercent(sum: number) {
  if (!overview.value || overview.value.expense.grandSum <= 0) return 0;
  return Math.min(1, sum / overview.value.expense.grandSum);
}

function incomePercent(sum: number) {
  if (!overview.value || overview.value.income.grandSum <= 0) return 0;
  return Math.min(1, sum / overview.value.income.grandSum);
}

async function loadOverview() {
  const [start, end] = getEpochRange();
  const newOverview = await computationService.computeOverview(start, end, recordCurrencyId.value!);
  overview.value = newOverview;
}

async function loadData() {
  return await errorService.handleUnexpectedError(async () => {
    if (!lockService.acquireLock("OverviewPage/loadData", 2_000)) return;

    isLoading.value = true;

    try {
      await lockService.awaitTillTruthy(1000, () => recordCurrencyId.value);
    } catch (error) {
      console.error("Error while waiting for record currency id", error);
      if (error instanceof CodedError && error.code === "TIMED_OUT" && !recordCurrencyId.value) {
        await dialogService.alert("Error", "Please set a default currency in settings.");
      }
    }

    loadingIndicator.value?.startPhase({ phase: 2, weight: 60, label: "Preparing overview" });
    await loadOverview();

    await loadingIndicator.value?.waitMinimalDuration(400);

    isLoading.value = false;
    lockService.releaseLock("OverviewPage/loadData");

    budgetHighlightsRef.value?.loadFeaturedRollingBudgets();
  });
}

function monthAndYearSelected() {
  loadData();
}

async function reloadClicked() {
  loadData();
}

function addExpenseClicked() {
  $q.dialog({ component: AddExpenseRecord }).onOk(() => {
    loadData();
  });
}

function addIncomeClicked() {
  $q.dialog({ component: AddIncomeRecord }).onOk(() => {
    loadData();
  });
}

// ----- Watchers
watch(recordCurrencyId, (newValue) => {
  if (newValue && isMounted.value) {
    loadData();
  }
});

// ----- Execution
onMounted(() => {
  isMounted.value = true;
  loadData();
});
</script>

<style scoped lang="scss">
@import url(./../css/table.scss);

.page {
  display: flex;
  flex-direction: column;
}

.header-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 8px;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 4px;
}

.summary-cards-row .col-6 {
  display: flex;
}

.summary-cards-row .summary-card {
  flex: 1;
  min-height: 72px;
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

.income-expense-bar {
  display: flex;
  width: 100%;
  background: var(--q-grey-3, #e0e0e0);

  &__income {
    background: var(--q-positive, #21ba45);
    transition: width 0.4s ease;
  }

  &__expense {
    background: var(--q-negative, #c10015);
    transition: width 0.4s ease;
    margin-left: auto;
  }

  &__dot {
    display: inline-block;
    width: 8px;
    height: 8px;
    border-radius: 50%;
    margin-right: 4px;

    &--income {
      background: var(--q-positive, #21ba45);
    }

    &--expense {
      background: var(--q-negative, #c10015);
      margin-right: 0;
      margin-left: 4px;
    }
  }
}

@media (max-width: $breakpoint-xs-max) {
  .wallet-limit {
    display: block;
  }
}
</style>
