import { NUMBER_CONFIG } from "src/constants/number-constants";

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

class NumberService {
  private defaultLocale = NUMBER_CONFIG.DEFAULT_LOCALE;
  private financialPrecision = NUMBER_CONFIG.FINANCIAL_PRECISION;
  private percentagePrecision = NUMBER_CONFIG.PERCENTAGE_PRECISION;
  private defaultUseGrouping = NUMBER_CONFIG.USE_GROUPING;
  private defaultCurrencyPosition = NUMBER_CONFIG.CURRENCY_POSITION;

  // Parsing methods
  parseNumber(value: any, fallback = 0): number {
    if (typeof value === "number") return isNaN(value) ? fallback : value;
    if (value === null || value === undefined || value === "") return fallback;

    const cleaned = String(value).replace(/,/g, "").trim();
    const parsed = parseFloat(cleaned);
    return isNaN(parsed) ? fallback : parsed;
  }

  parseFinancialAmount(value: any, fallback = 0): number {
    const parsed = this.parseNumber(value, fallback);
    return Math.round(parsed * Math.pow(10, this.financialPrecision)) / Math.pow(10, this.financialPrecision);
  }

  parseInteger(value: any, fallback = 0): number {
    const parsed = this.parseNumber(value, fallback);
    return Math.round(parsed);
  }

  // Formatting methods
  formatNumber(value: any, options: NumberFormatOptions = {}): string {
    const { decimals, useGrouping = this.defaultUseGrouping, locale = this.defaultLocale, fallback = 0 } = options;

    const number = this.parseNumber(value, fallback);

    const formatOptions: Intl.NumberFormatOptions = {
      useGrouping,
    };

    if (decimals !== undefined) {
      formatOptions.minimumFractionDigits = decimals;
      formatOptions.maximumFractionDigits = decimals;
    }

    return number.toLocaleString(locale, formatOptions);
  }

  formatFinancialAmount(value: any, options: Omit<NumberFormatOptions, "decimals"> = {}): string {
    return this.formatNumber(value, { ...options, decimals: this.financialPrecision });
  }

  formatCount(value: any, options: Omit<NumberFormatOptions, "decimals"> = {}): string {
    return this.formatNumber(value, { ...options, decimals: 0 });
  }

  formatCurrency(amount: any, currencySign: string, options: CurrencyFormatOptions = {}): string {
    const { currencyPosition = this.defaultCurrencyPosition, currencySpacing = " ", ...numberOptions } = options;

    const formattedAmount = this.formatFinancialAmount(amount, numberOptions);

    return currencyPosition === "before" ? `${currencySign}${currencySpacing}${formattedAmount}` : `${formattedAmount}${currencySpacing}${currencySign}`;
  }

  formatPercentage(value: any, decimals = this.percentagePrecision): string {
    const number = this.parseNumber(value, 0);
    return `${this.formatNumber(number, { decimals })}%`;
  }

  // Special formatting for budget percentages (existing pattern)
  formatBudgetPercentage(usedAmount: any, totalAmount: any): string {
    const used = this.parseNumber(usedAmount, 0);
    const total = this.parseNumber(totalAmount, 0);

    if (total === 0) return "0%";

    const percentage = (used / total) * 100;
    return `${Math.round(percentage * 100) / 100}%`;
  }

  // Validation methods
  isValidNumber(value: any): boolean {
    if (value === null || value === undefined || value === "") return false;
    return !isNaN(this.parseNumber(value));
  }

  isPositiveNumber(value: any): boolean {
    return this.isValidNumber(value) && this.parseNumber(value) > 0;
  }

  isNonNegativeNumber(value: any): boolean {
    return this.isValidNumber(value) && this.parseNumber(value) >= 0;
  }

  isInteger(value: any): boolean {
    if (!this.isValidNumber(value)) return false;
    const parsed = this.parseNumber(value);
    return Number.isInteger(parsed);
  }

  isPositiveInteger(value: any): boolean {
    return this.isInteger(value) && this.parseNumber(value) > 0;
  }

  // Utility methods for backward compatibility
  asAmount(amount: any): number {
    return this.parseNumber(amount, 0);
  }

  asFinancialAmount(amount: any): number {
    return this.parseFinancialAmount(amount, 0);
  }

  prettifyAmount(amount: any): string {
    return this.formatFinancialAmount(amount);
  }

  prettifyCount(amount: any): string {
    return this.formatCount(amount);
  }
}

export const numberService = new NumberService();
