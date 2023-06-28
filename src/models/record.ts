export type Record = {
  _id?: string;
  _rev?: string;
  $collection: string;
  notes: string;
  type: string; // enum RecordType
  tagIdList: string[];
  expense?: {
    // essential
    expenseAvenueId: string;
    amount: number;
    currencyId: string;
    partyId: string | null;
    // payment
    walletId: string;
    amountPaid: number;
    // due
    amountUnpaid: number;
    // cache
    _currencySign?: string;
    _expenseAvenueName?: string;
  };
  income?: {
    // essential
    incomeSourceId: string;
    amount: number;
    currencyId: string;
    partyId: string | null;
    // payment
    walletId?: string;
    amountPaid: number;
    // due
    amountUnpaid: number;
    // cache
    _currencySign?: string;
    _incomeSourceName?: string;
  };
  assetPurchase?: {
    // essential
    assetId: string;
  };
  assetSales?: {
    // essential
    assetId: string;
  };
  assetAppreciationDepreciation?: {
    // essential
    assetId: string;
  };
  lending?: {
    // essential
  };
  borrowing?: {
    // essential
  };
  repaymentGiven?: {
    // essential
  };
  repaymentReceived?: {
    // essential
  };
  moneyTransfer?: {
    fromWalletId: string;
    fromCurrencyId: string;
    fromAmount: number;
    _fromCurrencySign?: string;

    toWalletId: string;
    toCurrencyId: string;
    toAmount: number;
    _toCurrencySign?: string;
  };
};
