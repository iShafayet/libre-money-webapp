import { NUMBER_CONFIG } from "src/constants/number-constants";

export type NumberValue = number | string | null | undefined;

export interface NumberFormatOptions {
  decimals?: number;
  useGrouping?: boolean;
  locale?: string;
  fallback?: number;
}

export interface CurrencyFormatOptions extends NumberFormatOptions {
  currencyPosition?: "before" | "after";
  currencySpacing?: string;
}

// Default configurations
const defaultLocale = NUMBER_CONFIG.DEFAULT_LOCALE;
const defaultUseGrouping = NUMBER_CONFIG.USE_GROUPING;
const defaultCurrencyPosition = NUMBER_CONFIG.CURRENCY_POSITION;
const defaultCurrencySpacing = NUMBER_CONFIG.CURRENCY_SPACING;
const financialPrecision = NUMBER_CONFIG.FINANCIAL_PRECISION;
const percentagePrecision = NUMBER_CONFIG.PERCENTAGE_PRECISION;

// Use to parse any number value. Will throw an error if the value is not a number.
export function parseNumber(value: NumberValue): number {
  if (typeof value === "number") {
    if (isNaN(value)) throw new Error(`Invalid number value: ${value}`);
    return value;
  }
  if (value === null || value === undefined || value === "") {
    throw new Error(`Cannot parse null, undefined, or empty value: ${value}`);
  }

  const cleaned = String(value).replace(/,/g, "").trim();
  const parsed = parseFloat(cleaned);
  if (isNaN(parsed)) {
    throw new Error(`Cannot parse value as number: ${value}`);
  }
  return parsed;
}

// Use to parse financial amounts. Will round the value to the given precision.
export function parseFinancialAmount(value: NumberValue, precision: number): number {
  const parsed = parseNumber(value);
  return Math.round(parsed * Math.pow(10, precision)) / Math.pow(10, precision);
}

// Formatting functions
export function formatNumber(value: any, options: NumberFormatOptions = {}): string {
  const { decimals, useGrouping = defaultUseGrouping, locale = defaultLocale, fallback = 0 } = options;

  const number = parseNumber(value);

  const formatOptions: Intl.NumberFormatOptions = {
    useGrouping,
  };

  if (decimals !== undefined) {
    formatOptions.minimumFractionDigits = decimals;
    formatOptions.maximumFractionDigits = decimals;
  }

  return number.toLocaleString(locale, formatOptions);
}

export function formatFinancialAmount(value: NumberValue, options: Omit<NumberFormatOptions, "decimals"> = {}): string {
  return formatNumber(value, { ...options, decimals: financialPrecision });
}

export function formatCount(value: NumberValue, options: Omit<NumberFormatOptions, "decimals"> = {}): string {
  return formatNumber(value, { ...options, decimals: 0 });
}

export function formatCurrency(amount: NumberValue, currencySign: string, options: CurrencyFormatOptions = {}): string {
  const { currencyPosition = defaultCurrencyPosition, currencySpacing = defaultCurrencySpacing, ...numberOptions } = options;

  const formattedAmount = formatFinancialAmount(amount, numberOptions);

  return currencyPosition === "before" ? `${currencySign}${currencySpacing}${formattedAmount}` : `${formattedAmount}${currencySpacing}${currencySign}`;
}

export function formatPercentage(value: NumberValue, decimals = percentagePrecision): string {
  const number = parseNumber(value);
  return `${formatNumber(number, { decimals })}%`;
}

// Special formatting for budget percentages (existing pattern)
export function formatBudgetPercentage(usedAmount: NumberValue, totalAmount: NumberValue): string {
  const used = parseNumber(usedAmount);
  const total = parseNumber(totalAmount);

  if (total === 0) return "0%";

  const percentage = (used / total) * 100;
  return `${Math.round(percentage * 100) / 100}%`;
}

// Validation functions
export function isValidNumber(value: NumberValue): boolean {
  if (value === null || value === undefined || value === "") return false;
  try {
    parseNumber(value);
    return true;
  } catch {
    return false;
  }
}

export function isPositiveNumber(value: NumberValue): boolean {
  return isValidNumber(value) && parseNumber(value) > 0;
}

export function isNonNegativeNumber(value: NumberValue): boolean {
  return isValidNumber(value) && parseNumber(value) >= 0;
}

export function isInteger(value: NumberValue): boolean {
  if (!isValidNumber(value)) return false;
  const parsed = parseNumber(value);
  return Number.isInteger(parsed);
}

export function isPositiveInteger(value: NumberValue): boolean {
  return isInteger(value) && parseNumber(value) > 0;
}
