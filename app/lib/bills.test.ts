import { describe, expect, it } from "vitest";
import {
  billTypeDotStyles,
  billTypeLabels,
  getBillLabel,
  isBillType,
  isRecurrenceOption,
  suggestBillType,
  suggestBillTypeFromKeywords,
} from "./bills";

describe("bill helpers", () => {
  it("validates bill types", () => {
    expect(isBillType("bill")).toBe(true);
    expect(isBillType("purchase")).toBe(true);
    expect(isBillType("payday")).toBe(true);
    expect(isBillType("savings")).toBe(true);
    expect(isBillType("subscription")).toBe(false);
  });

  it("returns labels and dot styles for every bill type", () => {
    expect(getBillLabel("payday")).toBe("Payday");
    expect(getBillLabel("bill")).toBe("Bill due");
    expect(getBillLabel("purchase")).toBe("Purchase");
    expect(getBillLabel("savings")).toBe("Add to savings");

    expect(Object.keys(billTypeLabels).sort()).toEqual([
      "bill",
      "payday",
      "purchase",
      "savings",
    ]);
    expect(Object.keys(billTypeDotStyles).sort()).toEqual([
      "bill",
      "payday",
      "purchase",
      "savings",
    ]);
  });

  it("validates recurrence options", () => {
    expect(isRecurrenceOption("none")).toBe(true);
    expect(isRecurrenceOption("daily")).toBe(true);
    expect(isRecurrenceOption("weekly")).toBe(true);
    expect(isRecurrenceOption("biweekly")).toBe(true);
    expect(isRecurrenceOption("monthly")).toBe(true);
    expect(isRecurrenceOption("yearly")).toBe(false);
  });

  it("suggests bill for wifi and utilities", () => {
    expect(suggestBillTypeFromKeywords("wifi")).toBe("bill");
    expect(suggestBillTypeFromKeywords("wi-fi")).toBe("bill");
    expect(suggestBillTypeFromKeywords("internet")).toBe("bill");
    expect(suggestBillTypeFromKeywords("electric utility")).toBe("bill");
    expect(suggestBillTypeFromKeywords("credit card")).toBe("bill");
    expect(suggestBillTypeFromKeywords("loan")).toBe("bill");
  });

  it("suggests payday for payroll names", () => {
    expect(suggestBillType("paycheck")).toBe("payday");
    expect(suggestBillType("direct deposit")).toBe("payday");
  });

  it("falls back to purchase when no keyword matches", () => {
    expect(suggestBillType("random store")).toBe("purchase");
  });
});
