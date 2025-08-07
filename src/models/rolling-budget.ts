export type BudgetedPeriod = {
  startEpoch: number;
  endEpoch: number;
  title: string;
  allocatedAmount: number;
  rolledOverAmount: number;
  totalAllocatedAmount: number;
  heldAmount: number;
  usedAmount: number;
  remainingAmount: number;
  calculatedEpoch: number;
};

export type RollingBudget = {
  _id?: string;
  _rev?: string;
  $collection: string;
  name: string;

  includeExpenses: boolean;
  includeAssetPurchases: boolean;
  tagIdWhiteList: string[];
  tagIdBlackList: string[];

  frequency: "monthly" | "irregular";
  budgetedPeriodList: BudgetedPeriod[];

  rollOverRule: "always" | "never" | "positive-only" | "negative-only";

  isFeatured: boolean;

  currencyId: string;
  _currencySign?: string;

  _budgetedPeriodIndexInRange?: number;

  // Monthly frequency specific properties
  monthlyStartDate?: number | null;
  monthlyEndDate?: number | null;
};
