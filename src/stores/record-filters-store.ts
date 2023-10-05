import { defineStore } from "pinia";
import { RecordFilters } from "src/models/inferred/record-filters";

const initialRecordFilters: RecordFilters | null = ((): RecordFilters | null => {
  return null;
})();

export const useRecordFiltersStore = defineStore("recordFilters", {
  state: () => ({
    recordFilters: initialRecordFilters,
  }),

  getters: {
    currentRecordFilters(state): RecordFilters | null {
      return state.recordFilters;
    },
  },

  actions: {
    setRecordFilters(recordFilters: RecordFilters | null) {
      this.recordFilters = recordFilters;
    },
  },
});
