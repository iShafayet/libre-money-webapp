import { AccAccount } from "./acc-account";
import { AccJournalEntry } from "./acc-journal-entry";

export type AccLedgerEntry = {
  serial: number;
  account: AccAccount;
  entryEpoch: number;
  isBalanceDebit: boolean;
  currencyId: string;
  debitAmount: number;
  creditAmount: number;
  balance: number;
  description: string;
  notes: string;
  journalEntryRef: AccJournalEntry | null;
  _currencySign?: string;
};
