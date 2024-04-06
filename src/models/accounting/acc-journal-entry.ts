import { AccAccount } from "./acc-account";

export type AccDebitOrCredit = {
  account: AccAccount;
  amount: number;
  currencyId: string;
  _currencySign?: string;
};

export type AccJournalEntry = {
  serial: number;
  entryEpoch: number;
  creditList: AccDebitOrCredit[];
  debitList: AccDebitOrCredit[];
  sumCredits: number;
  sumDebits: number;
  description: string;
  notes: string;
};
