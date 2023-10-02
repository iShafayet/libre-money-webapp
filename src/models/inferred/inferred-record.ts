import { Record } from "src/models/record";
import { ExpenseAvenue } from "../expense-avenue";
import { Party } from "../party";
import { Tag } from "../tag";
import { Wallet } from "../wallet";
import { IncomeSource } from "../income-source";
import { Asset } from "../asset";

export type InferredRecord = Record & {
  expense?: {
    expenseAvenue: ExpenseAvenue;
    party: Party;
    wallet: Wallet;
  };
  income?: {
    incomeSource: IncomeSource;
    party: Party;
    wallet: Wallet;
  };
  moneyTransfer?: {
    fromWallet: Wallet;
    toWallet: Wallet;
  };

  lending?: {
    party: Party;
    wallet: Wallet;
  };
  borrowing?: {
    party: Party;
    wallet: Wallet;
  };
  repaymentGiven?: {
    party: Party;
    wallet: Wallet;
  };
  repaymentReceived?: {
    party: Party;
    wallet: Wallet;
  };

  assetPurchase?: {
    asset: Asset;
    party: Party;
    wallet: Wallet;
  };
  assetSale?: {
    asset: Asset;
    party: Party;
    wallet: Wallet;
  };
  assetAppreciationDepreciation?: {
    asset: Asset;
  };

  tagList: Tag[];
  typePrettified: string;
};
