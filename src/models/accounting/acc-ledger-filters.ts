import { Currency } from "../currency";

export type AccLedgerFilters = {
  startEpoch: number;
  endEpoch: number;
  filterByCurrencyId: string | null;
  _currency?: Currency;
};
