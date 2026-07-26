import { describe, expect, it } from "vitest";

import { capitalizeName, formatCurrency } from "./format";

describe("capitalizeName", () => {
  it("trims extra spaces and title-cases each word", () => {
    expect(capitalizeName("  john   doe  ")).toBe("John Doe");
  });

  it("returns an empty string for whitespace-only names", () => {
    expect(capitalizeName("   ")).toBe("");
  });
});

describe("formatCurrency", () => {
  it("formats numbers as US dollars", () => {
    expect(formatCurrency(1234.5)).toBe("$1,234.50");
  });

  it("formats nullish values as zero dollars", () => {
    expect(formatCurrency(null)).toBe("$0.00");
    expect(formatCurrency(undefined)).toBe("$0.00");
  });
});
