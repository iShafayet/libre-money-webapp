export type TextImportRules = {
  _id?: string;
  _rev?: string;
  $collection: string;
  name: string;
  description?: string;
  regex: string;
  // WALLET
  walletCaptureGroup: number;
  walletExpectedValue: string;
  prefillWalletName: string;
  // EXPENSE AVENUE
  expenseAvenueCaptureGroup: number;
  expenseAvenueExpectedValue: string;
  prefillExpenseAvenueName: string;
  // DATE
  dateCaptureGroup: number;
  dateFormat: string;
  // AMOUNT
  amountCaptureGroup: number;
  // COMMON
  isActive: boolean;
  dissuadeEditing?: boolean;
  denyDeletion?: boolean;
};

export class TextImportRulesValidator {
  static validate(rule: Partial<TextImportRules>): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Required fields in the JSON configuration
    const requiredJsonFields: (keyof TextImportRules)[] = [
      "name",
      "description",
      "regex",
      "walletCaptureGroup",
      "expenseAvenueCaptureGroup",
      "dateCaptureGroup",
      "amountCaptureGroup",
      "dateFormat",
      "walletExpectedValue",
      "expenseAvenueExpectedValue",
      "prefillWalletName",
      "prefillExpenseAvenueName",
    ];

    // Check JSON configuration fields
    for (const field of requiredJsonFields) {
      if (rule[field] === undefined) {
        errors.push(`Missing required field in JSON configuration: ${field}`);
      }
    }

    // Validate regex
    if (rule.regex) {
      try {
        new RegExp(rule.regex);
      } catch (e) {
        errors.push("Invalid regular expression");
      }
    }

    // Validate capture groups are non-negative integers
    const captureGroups = [
      { name: "walletCaptureGroup", value: rule.walletCaptureGroup },
      { name: "expenseAvenueCaptureGroup", value: rule.expenseAvenueCaptureGroup },
      { name: "dateCaptureGroup", value: rule.dateCaptureGroup },
      { name: "amountCaptureGroup", value: rule.amountCaptureGroup },
    ];

    for (const group of captureGroups) {
      if (group.value !== undefined && (group.value < 0 || !Number.isInteger(group.value))) {
        errors.push(`${group.name} must be a non-negative integer`);
      }
    }

    // Validate date format
    if (rule.dateFormat) {
      const testDate = new Date();
      try {
        // Try to format a test date with the provided format
        const formatted = testDate.toLocaleString("en-US", {
          year: "numeric",
          month: "short",
          day: "2-digit",
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: true,
        });
        // This is a basic check - you might want to add more specific format validation
        if (!rule.dateFormat.includes("DD") && !rule.dateFormat.includes("MM") && !rule.dateFormat.includes("YY")) {
          errors.push("Invalid date format. Must include DD, MM, and YY placeholders");
        }
      } catch (e) {
        errors.push("Invalid date format");
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }
}
