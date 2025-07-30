import { date } from "quasar";
import { formatFinancialAmount, formatCount, parseNumber, parseFinancialAmount } from "./number-utils";
import { NUMBER_CONFIG } from "src/constants/number-constants";

// eslint-disable-next-line @typescript-eslint/ban-types
export async function suppress(fn: Function | (() => Promise<any>)) {
  try {
    await fn();
    return false;
  } catch (ex) {
    return true;
  }
}

export async function sleep(duration: number) {
  return new Promise((accept) => {
    setTimeout(accept, duration);
  });
}

export function deepClone(object: any) {
  return JSON.parse(JSON.stringify(object));
}

function hexToRgb(hex: any) {
  // Expand shorthand form (e.g. "03F") to full form (e.g. "0033FF")
  const shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
  // @ts-ignore
  hex = hex.replace(shorthandRegex, function (m, r, g, b) {
    return r + r + g + g + b + b;
  });

  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null;
}

export function guessFontColorCode(colorCode: string) {
  try {
    colorCode = colorCode.replace("#", "");
    const color = hexToRgb(colorCode)!;
    const luminance = (0.299 * color.r + 0.587 * color.g + 0.114 * color.b) / 255;
    if (luminance > 0.5) {
      return "#000000";
    } else {
      return "#ffffff";
    }
  } catch (ex) {
    return "#ffffff";
  }
}

export function prettifyDate(timestamp: number) {
  return date.formatDate(timestamp, "YYYY MMM DD");
}

export function prettifyDateTime(timestamp: number) {
  return date.formatDate(timestamp, "YYYY MMM DD hh:mm:ss a");
}

export function getCurrentYear() {
  return new Date().getFullYear();
}

export function isNullOrUndefined(value: any) {
  return value == null;
}

export function tryOrElse<T, U>(fn: () => T, fallback: U): T | U {
  try {
    return fn();
  } catch (ex) {
    return fallback;
  }
}

/** @deprecated Use printAmount() from de-facto-utils.ts instead */
export function prettifyAmount(amount: number | string | null | undefined) {
  if (amount === null || amount === undefined) return "0";
  try {
    return formatFinancialAmount(amount);
  } catch {
    return "0";
  }
}

/** @deprecated Use printCount() from de-facto-utils.ts instead */
export function prettifyCount(amount: number | string | null | undefined) {
  if (amount === null || amount === undefined) return "0";
  try {
    return formatCount(amount);
  } catch {
    return "0";
  }
}

/** @deprecated Use asAmount() or asRawAmount() from de-facto-utils.ts instead */
export function asAmount(amount: number | string | null | undefined) {
  if (amount === null || amount === undefined) return 0;
  try {
    return parseNumber(amount);
  } catch {
    return 0;
  }
}

/** @deprecated Use asAmount() or asRawAmount() from de-facto-utils.ts instead */
export function asFinancialAmount(amount: number | string | null | undefined) {
  if (amount === null || amount === undefined) return 0;
  try {
    return parseFinancialAmount(amount, NUMBER_CONFIG.FINANCIAL_PRECISION);
  } catch {
    return 0;
  }
}
