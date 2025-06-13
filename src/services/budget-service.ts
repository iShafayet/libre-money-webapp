import { Collection, RecordType } from "src/constants/constants";
import { Budget } from "src/models/budget";
import { RecordFilters } from "src/models/inferred/record-filters";
import { pouchdbService } from "src/services/pouchdb-service";

export class BudgetService {
  public async listAll(): Promise<Budget[]> {
    return (await pouchdbService.listByCollection(Collection.BUDGET)).docs as Budget[];
  }

  public createRecordFiltersForBudget(budget: Budget): RecordFilters {
    const recordTypeList: string[] = [];
    if (budget.includeExpenses) {
      recordTypeList.push(RecordType.EXPENSE);
    }
    if (budget.includeAssetPurchases) {
      recordTypeList.push(RecordType.ASSET_PURCHASE);
    }

    const recordFilter: RecordFilters = {
      startEpoch: budget.startEpoch,
      endEpoch: budget.endEpoch,
      recordTypeList,
      tagIdWhiteList: budget.tagIdWhiteList,
      tagIdBlackList: budget.tagIdBlackList,
      searchString: "",
      deepSearchString: "",
      sortBy: "transactionEpochDesc",
      type: "budget",
      _budgetName: budget.name,
      _preset: "custom",
    };

    return recordFilter;
  }
}

export const budgetService = new BudgetService();
