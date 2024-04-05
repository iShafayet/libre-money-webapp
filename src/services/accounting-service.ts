import { AccDefaultAccounts } from "src/constants/accounting-constants";
import { AccAccount } from "src/models/accounting/acc-account";
import { dataInferenceService } from "./data-inference-service";
import { pouchdbService } from "./pouchdb-service";
import { Collection, RecordType, walletTypeList } from "src/constants/constants";
import { Record as SourceRecord } from "src/models/record";
import { AccDebitOrCredit, AccJournalEntry } from "src/models/accounting/acc-journal-entry";
import { asAmount } from "src/utils/misc-utils";

class AccountingService {
  async initiateAccounting() {
    // Populate all accounting heads
    const accountMap: Record<string, AccAccount> = {};

    Object.keys(AccDefaultAccounts).forEach((code) => {
      const name = AccDefaultAccounts[code].name;
      const type = AccDefaultAccounts[code].type;
      accountMap[code] = {
        name,
        type,
        code,
      };
    });

    const accountList = Object.keys(accountMap).map((code) => accountMap[code]);

    // Populate Opening Balances
    const journalEntryList: AccJournalEntry[] = [];

    // Populate Journal from Records
    const rawRecordList = (await pouchdbService.listByCollection(Collection.RECORD)).docs as SourceRecord[];
    await dataInferenceService.updateCurrencyCache();
    const inferredRecordList = await Promise.all(rawRecordList.map((rawData) => dataInferenceService.inferRecord(rawData)));
    inferredRecordList.sort((a, b) => (a.transactionEpoch || 0) - (b.transactionEpoch || 0));

    let serialSeed = 0;
    for (const record of inferredRecordList) {
      const creditList: AccDebitOrCredit[] = [];
      const debitList: AccDebitOrCredit[] = [];

      let notes = "";

      // ================ EXPENSE
      if (record.type === RecordType.EXPENSE && record.expense) {
        const { expense } = record;
        console.log(record);

        debitList.push({
          account: accountMap[AccDefaultAccounts.EXPENSE__COMBINED_EXPENSE.code],
          amount: asAmount(expense.amount),
        });
        notes += `Spent ${expense.amount} as "${expense.expenseAvenue.name}". `;

        if (expense.amountPaid > 0 && expense.wallet) {
          if (expense.wallet.type === "credit-card") {
            creditList.push({
              account: accountMap[AccDefaultAccounts.LIABILITY__CREDIT_CARD_DEBT.code],
              amount: asAmount(expense.amountPaid),
            });
          } else if (expense.wallet.type === "cash") {
            creditList.push({
              account: accountMap[AccDefaultAccounts.ASSET__CURRENT_ASSET__CASH.code],
              amount: asAmount(expense.amountPaid),
            });
          } else {
            creditList.push({
              account: accountMap[AccDefaultAccounts.ASSET__CURRENT_ASSET__BANK_AND_EQUIVALENT.code],
              amount: asAmount(expense.amountPaid),
            });
          }
          if (expense.amount === expense.amountPaid) {
            notes += `Fully paid from ${expense.wallet.name} (${expense.wallet.type}). `;
          } else {
            creditList.push({
              account: accountMap[AccDefaultAccounts.LIABILITY__ACCOUNTS_PAYABLE.code],
              amount: asAmount(expense.amount) - asAmount(expense.amountPaid),
            });
            notes += `Partially paid from ${expense.wallet.name} (${expense.wallet.type}). `;
          }
        } else {
          creditList.push({
            account: accountMap[AccDefaultAccounts.LIABILITY__ACCOUNTS_PAYABLE.code],
            amount: asAmount(expense.amount),
          });
          notes += "Unpaid. ";
        }
      }

      const sumCredits = creditList.reduce((sum, credit) => sum + credit.amount, 0);
      const sumDebits = debitList.reduce((sum, credit) => sum + credit.amount, 0);

      if (record.notes && record.notes.length > 0) {
        notes += `Notes: ${record.notes}. `;
      }

      const journal: AccJournalEntry = {
        serial: serialSeed++,
        entryEpoch: record.transactionEpoch,
        creditList,
        debitList,
        sumCredits,
        sumDebits,
        notes,
      };
      journalEntryList.push(journal);
    }

    // return as an object
    return {
      accountMap,
      accountList,
      journalEntryList,
    };
  }
}

export const accountingService = new AccountingService();
