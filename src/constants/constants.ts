export const rowsPerPageOptions = [10, 20, 50, 100];

export const partyTypeList = [
  { value: "party", label: "Party" },
  { value: "vendor", label: "Vendor" },
];

export const defaultPartyType = "party";

export const walletTypeList = [
  { value: "cash", label: "Cash" },
  { value: "credit-card", label: "Credit Card" },
  { value: "bank", label: "Bank" },
  { value: "app", label: "App" },
  { value: "other", label: "Other" },
];

export const defaultWalletType = "cash";

export const Collection = {
  PARTY: "party",
  TAG: "tag",
  INCOME_SOURCE: "income-source",
  EXPENSE_AVENUE: "expense-avenue",
  CURRENCY: "currency",
  WALLET: "wallet",
  ASSET: "asset",
  RECORD: "record",
};
