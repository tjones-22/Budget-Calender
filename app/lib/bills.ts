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
  purchase: "bg-orange-500",
  savings: "bg-blue-500",
};

export function isBillType(type: string): type is BillType {
  return billTypes.includes(type as BillType);
}

export function getBillLabel(type: BillType) {
  return billTypeLabels[type];
}
