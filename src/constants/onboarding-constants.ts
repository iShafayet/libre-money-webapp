export interface CurrencyOption {
  label: string;
  value: string;
}

export interface CurrencyInfo {
  name: string;
  sign: string;
}

export const CURRENCY_OPTIONS: CurrencyOption[] = [
  { label: "US Dollar (USD)", value: "USD" },
  { label: "Euro (EUR)", value: "EUR" },
  { label: "British Pound (GBP)", value: "GBP" },
  { label: "Japanese Yen (JPY)", value: "JPY" },
  { label: "Canadian Dollar (CAD)", value: "CAD" },
  { label: "Australian Dollar (AUD)", value: "AUD" },
  { label: "Swiss Franc (CHF)", value: "CHF" },
  { label: "Chinese Yuan (CNY)", value: "CNY" },
  { label: "Bangladeshi Taka (BDT)", value: "BDT" },
  { label: "Custom Currency", value: "custom" },
];

export const CURRENCY_MAP: Record<string, CurrencyInfo> = {
  USD: { name: "US Dollar", sign: "USD" },
  EUR: { name: "Euro", sign: "EUR" },
  GBP: { name: "British Pound", sign: "GBP" },
  JPY: { name: "Japanese Yen", sign: "JPY" },
  CAD: { name: "Canadian Dollar", sign: "CAD" },
  AUD: { name: "Australian Dollar", sign: "AUD" },
  CHF: { name: "Swiss Franc", sign: "CHF" },
  CNY: { name: "Chinese Yuan", sign: "CNY" },
  BDT: { name: "Bangladeshi Taka", sign: "BDT" },
};
