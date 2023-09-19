import { Record } from "src/models/record";
import { ExpenseAvenue } from "../expense-avenue";
import { Party } from "../party";
import { Tag } from "../tag";
import { Wallet } from "../wallet";

export type InferredRecord = Record & {
  expense?: {
    expenseAvenue: ExpenseAvenue;
    party: Party;
    wallet: Wallet;
  };
  tagList: Tag[];
};
