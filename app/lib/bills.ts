import type { BillType } from "../../types/types";

export const billTypes = ["payday", "bill", "purchase", "savings"] as const;

export const billTypeLabels: Record<BillType, string> = {
  payday: "Payday",
  bill: "Bill due",
  purchase: "Purchase",
  savings: "Add to savings",
};

export const billTypeDotStyles: Record<BillType, string> = {
  payday: "bg-green-500",
  bill: "bg-red-500",
  purchase: "bg-purple-500",
  savings: "bg-blue-500",
};

export function isBillType(type: string): type is BillType {
  return billTypes.includes(type as BillType);
}

export function getBillLabel(type: BillType) {
  return billTypeLabels[type];
}

const recurrenceOptions = ["none", "daily", "weekly", "biweekly", "monthly"] as const;

export function isRecurrenceOption(value: string) {
  return recurrenceOptions.includes(value as (typeof recurrenceOptions)[number]);
}

export function suggestBillTypeFromKeywords(name: string): BillType | null {
  const normalizedName = name.toLowerCase();

  if (["paycheck", "payroll", "salary", "direct deposit", "payday"].some((word) => normalizedName.includes(word))) {
    return "payday";
  }

  if (["savings", "save"].some((word) => normalizedName.includes(word))) {
    return "savings";
  }

  if (
    [
      "rent",
      "mortgage",
      "electric",
      "utility",
      "utilities",
      "internet",
      "wi-fi",
      "wifi",
      "phone",
      "insurance",
      "netflix",
      "spotify",
      "credit card",
      "loan",
    ].some((word) => normalizedName.includes(word))
  ) {
    return "bill";
  }

  return null;
}

export function suggestBillType(name: string): BillType {
  const keywordSuggestion = suggestBillTypeFromKeywords(name);

  if (keywordSuggestion) {
    return keywordSuggestion;
  }

  return "purchase";
}
