import { describe, expect, it } from "vitest";

import { isBillType } from "./bills";
import { mockBillsByDay } from "./mockBills";

describe("mockBillsByDay", () => {
  it("uses valid calendar day numbers and bill types", () => {
    for (const [day, bills] of Object.entries(mockBillsByDay)) {
      const dayNumber = Number(day);

      expect(dayNumber).toBeGreaterThanOrEqual(1);
      expect(dayNumber).toBeLessThanOrEqual(31);

      for (const bill of bills) {
        expect(isBillType(bill.type)).toBe(true);
        expect(bill.name.length).toBeGreaterThan(0);
      }
    }
  });
});
