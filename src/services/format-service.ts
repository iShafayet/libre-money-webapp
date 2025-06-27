import { Collection } from "src/constants/constants";
import { pouchdbService } from "./pouchdb-service";
import { Currency } from "src/models/currency";
import { numberService, NumberFormatOptions, CurrencyFormatOptions } from "./number-service";

let currencyCacheList: Currency[] = [];

class FormatService {
  async updateCurrencyCache() {
    currencyCacheList = (await pouchdbService.listByCollection(Collection.CURRENCY)).docs as Currency[];
  }

  async init() {
    pouchdbService.registerChangeListener(this.onUpsert);
    await this.updateCurrencyCache();
  }

  async onUpsert(action: "upsert" | "remove" | "sync", doc: PouchDB.Core.PostDocument<any> | undefined) {
    if (!doc || (doc && doc.type === Collection.CURRENCY)) {
      await this.updateCurrencyCache();
    }
  }

  getPrintableAmount(amount: number, currencyId: string, options?: CurrencyFormatOptions) {
    const currency = currencyCacheList.find((_currency) => _currency._id === currencyId);
    return numberService.formatCurrency(amount, currency?.sign || "", options);
  }

  getFormattedNumber(value: any, options?: NumberFormatOptions) {
    return numberService.formatNumber(value, options);
  }

  getFormattedFinancialAmount(value: any, options?: Omit<NumberFormatOptions, "decimals">) {
    return numberService.formatFinancialAmount(value, options);
  }

  getFormattedPercentage(value: any, decimals?: number) {
    return numberService.formatPercentage(value, decimals);
  }

  getFormattedBudgetPercentage(usedAmount: any, totalAmount: any) {
    return numberService.formatBudgetPercentage(usedAmount, totalAmount);
  }
}

export const formatService = new FormatService();
