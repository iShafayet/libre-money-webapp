import { Collection, RecordType } from "src/constants/constants";
import { Currency } from "src/models/currency";
import { InferredRecord } from "src/models/inferred/inferred-record";
import { Record } from "src/models/record";
import { deepClone, prettifyAmount } from "src/utils/misc-utils";
import { dataInferenceService } from "./data-inference-service";
import { pouchdbService } from "./pouchdb-service";

let currencyCacheList: Currency[] = [];

class RecordService {
  async updateCurrencyCache() {
    currencyCacheList = (await pouchdbService.listByCollection(Collection.CURRENCY)).docs as Currency[];
  }

  getPrintableAmount(amount: number, currencyId: string) {
    const currency = currencyCacheList.find((_currency) => _currency._id === currencyId);
    return `${prettifyAmount(amount)} ${currency!.sign}`;
  }

  async inferRecord(record: Record): Promise<InferredRecord> {
    const inferredRecord = deepClone(record) as InferredRecord;

    (await this.inferExpense(inferredRecord)) ||
      (await this.inferIncome(inferredRecord)) ||
      (await this.inferMoneyTransfer(inferredRecord)) ||
      (await this.inferLending(inferredRecord)) ||
      (await this.inferBorrowing(inferredRecord)) ||
      (await this.inferRepaymentGiven(inferredRecord)) ||
      (await this.inferRepaymentReceived(inferredRecord)) ||
      (await this.inferAssetPurchase(inferredRecord)) ||
      (await this.inferAssetSale(inferredRecord)) ||
      (await this.inferAssetAppreciationDepreciation(inferredRecord));

    inferredRecord.typePrettified = inferredRecord.type.replace(/\-/g, " ");
    inferredRecord.tagList = await dataInferenceService.getTagList(inferredRecord.tagIdList);

    return inferredRecord;
  }

  private async inferExpense(inferredRecord: InferredRecord) {
    if (!(inferredRecord.type === RecordType.EXPENSE && inferredRecord.expense)) return false;

    inferredRecord.expense.expenseAvenue = await dataInferenceService.getExpenseAvenue(inferredRecord.expense.expenseAvenueId);

    if (inferredRecord.expense.partyId) {
      inferredRecord.expense.party = await dataInferenceService.getParty(inferredRecord.expense.partyId);
    }

    if (inferredRecord.expense.walletId) {
      inferredRecord.expense.wallet = await dataInferenceService.getWallet(inferredRecord.expense.walletId);
    }
    return true;
  }

  private async inferIncome(inferredRecord: InferredRecord) {
    if (!(inferredRecord.type === RecordType.INCOME && inferredRecord.income)) return false;

    inferredRecord.income.incomeSource = await dataInferenceService.getExpenseAvenue(inferredRecord.income.incomeSourceId);

    if (inferredRecord.income.partyId) {
      inferredRecord.income.party = await dataInferenceService.getParty(inferredRecord.income.partyId);
    }

    if (inferredRecord.income.walletId) {
      inferredRecord.income.wallet = await dataInferenceService.getWallet(inferredRecord.income.walletId);
    }

    return true;
  }

  private async inferMoneyTransfer(inferredRecord: InferredRecord) {
    if (!(inferredRecord.type === RecordType.MONEY_TRANSFER && inferredRecord.moneyTransfer)) return false;

    if (inferredRecord.moneyTransfer.fromWalletId) {
      inferredRecord.moneyTransfer.fromWallet = await dataInferenceService.getWallet(inferredRecord.moneyTransfer.fromWalletId);
    }
    if (inferredRecord.moneyTransfer.toWalletId) {
      inferredRecord.moneyTransfer.toWallet = await dataInferenceService.getWallet(inferredRecord.moneyTransfer.toWalletId);
    }

    return true;
  }

  private async inferLending(inferredRecord: InferredRecord) {
    if (!(inferredRecord.type === RecordType.LENDING && inferredRecord.lending)) return false;

    if (inferredRecord.lending.partyId) {
      inferredRecord.lending.party = await dataInferenceService.getParty(inferredRecord.lending.partyId);
    }

    if (inferredRecord.lending.walletId) {
      inferredRecord.lending.wallet = await dataInferenceService.getWallet(inferredRecord.lending.walletId);
    }

    return true;
  }

  private async inferBorrowing(inferredRecord: InferredRecord) {
    if (!(inferredRecord.type === RecordType.BORROWING && inferredRecord.borrowing)) return false;

    if (inferredRecord.borrowing.partyId) {
      inferredRecord.borrowing.party = await dataInferenceService.getParty(inferredRecord.borrowing.partyId);
    }

    if (inferredRecord.borrowing.walletId) {
      inferredRecord.borrowing.wallet = await dataInferenceService.getWallet(inferredRecord.borrowing.walletId);
    }

    return true;
  }

  private async inferRepaymentGiven(inferredRecord: InferredRecord) {
    if (!(inferredRecord.type === RecordType.REPAYMENT_GIVEN && inferredRecord.repaymentGiven)) return false;

    if (inferredRecord.repaymentGiven.partyId) {
      inferredRecord.repaymentGiven.party = await dataInferenceService.getParty(inferredRecord.repaymentGiven.partyId);
    }

    if (inferredRecord.repaymentGiven.walletId) {
      inferredRecord.repaymentGiven.wallet = await dataInferenceService.getWallet(inferredRecord.repaymentGiven.walletId);
    }

    return true;
  }

  private async inferRepaymentReceived(inferredRecord: InferredRecord) {
    if (!(inferredRecord.type === RecordType.REPAYMENT_RECEIVED && inferredRecord.repaymentReceived)) return false;

    if (inferredRecord.repaymentReceived.partyId) {
      inferredRecord.repaymentReceived.party = await dataInferenceService.getParty(inferredRecord.repaymentReceived.partyId);
    }

    if (inferredRecord.repaymentReceived.walletId) {
      inferredRecord.repaymentReceived.wallet = await dataInferenceService.getWallet(inferredRecord.repaymentReceived.walletId);
    }

    return true;
  }

  private async inferAssetPurchase(inferredRecord: InferredRecord) {
    if (!(inferredRecord.type === RecordType.ASSET_PURCHASE && inferredRecord.assetPurchase)) return false;

    if (inferredRecord.assetPurchase.partyId) {
      inferredRecord.assetPurchase.party = await dataInferenceService.getParty(inferredRecord.assetPurchase.partyId);
    }

    if (inferredRecord.assetPurchase.walletId) {
      inferredRecord.assetPurchase.wallet = await dataInferenceService.getWallet(inferredRecord.assetPurchase.walletId);
    }

    if (inferredRecord.assetPurchase.assetId) {
      inferredRecord.assetPurchase.asset = await dataInferenceService.getAsset(inferredRecord.assetPurchase.assetId);
    }

    return true;
  }

  private async inferAssetSale(inferredRecord: InferredRecord) {
    if (!(inferredRecord.type === RecordType.ASSET_SALE && inferredRecord.assetSale)) return false;

    if (inferredRecord.assetSale.partyId) {
      inferredRecord.assetSale.party = await dataInferenceService.getParty(inferredRecord.assetSale.partyId);
    }

    if (inferredRecord.assetSale.walletId) {
      inferredRecord.assetSale.wallet = await dataInferenceService.getWallet(inferredRecord.assetSale.walletId);
    }

    if (inferredRecord.assetSale.assetId) {
      inferredRecord.assetSale.asset = await dataInferenceService.getAsset(inferredRecord.assetSale.assetId);
    }

    return true;
  }

  private async inferAssetAppreciationDepreciation(inferredRecord: InferredRecord) {
    if (!(inferredRecord.type === RecordType.ASSET_APPRECIATION_DEPRECIATION && inferredRecord.assetAppreciationDepreciation)) return false;

    if (inferredRecord.assetAppreciationDepreciation.assetId) {
      inferredRecord.assetAppreciationDepreciation.asset = await dataInferenceService.getAsset(inferredRecord.assetAppreciationDepreciation.assetId);
    }

    return true;
  }
}

export const recordService = new RecordService();
