import { Currency } from "../currency";

export type QuickExpenseSummary = {
  currency: Currency;
  type: "Expense" | "Purchase";
  description: string;
  amount: number;
  count: number;
};
