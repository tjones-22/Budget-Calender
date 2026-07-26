import { describe, expect, it } from "vitest";

import {
  getCurrentMonthRange,
  getCurrentWeekRange,
  getDayRange,
  getMonthRange,
  getStartOfDay,
  getStartOfNextDay,
  parseLocalDate,
} from "./dates";

describe("getStartOfDay", () => {
  it("returns the start of the provided local day", () => {
    const date = new Date(2026, 6, 25, 22, 46, 58, 158);
    const startOfDay = getStartOfDay(date);

    expect(startOfDay.getFullYear()).toBe(2026);
    expect(startOfDay.getMonth()).toBe(6);
    expect(startOfDay.getDate()).toBe(25);
    expect(startOfDay.getHours()).toBe(0);
    expect(startOfDay.getMinutes()).toBe(0);
    expect(startOfDay.getSeconds()).toBe(0);
    expect(startOfDay.getMilliseconds()).toBe(0);
  });
});

describe("date range helpers", () => {
  it("returns the start of the next local day", () => {
    const nextDay = getStartOfNextDay(new Date(2026, 6, 25, 22, 46));

    expect(nextDay.getFullYear()).toBe(2026);
    expect(nextDay.getMonth()).toBe(6);
    expect(nextDay.getDate()).toBe(26);
    expect(nextDay.getHours()).toBe(0);
    expect(nextDay.getMinutes()).toBe(0);
  });

  it("returns a specific local day range from human month numbering", () => {
    const { startOfDay, startOfNextDay } = getDayRange(2026, 7, 25);

    expect(startOfDay.getFullYear()).toBe(2026);
    expect(startOfDay.getMonth()).toBe(6);
    expect(startOfDay.getDate()).toBe(25);
    expect(startOfNextDay.getDate()).toBe(26);
  });

  it("returns a Sunday-through-Saturday week range", () => {
    const { startOfWeek, startOfNextWeek } = getCurrentWeekRange(
      new Date(2026, 6, 29),
    );

    expect(startOfWeek.getDay()).toBe(0);
    expect(startOfWeek.getDate()).toBe(26);
    expect(startOfNextWeek.getDate()).toBe(2);
  });

  it("returns month ranges from human month numbering", () => {
    const { startOfMonth, startOfNextMonth } = getMonthRange(2026, 7);

    expect(startOfMonth.getFullYear()).toBe(2026);
    expect(startOfMonth.getMonth()).toBe(6);
    expect(startOfMonth.getDate()).toBe(1);
    expect(startOfNextMonth.getMonth()).toBe(7);
    expect(startOfNextMonth.getDate()).toBe(1);
  });

  it("returns the range for the month containing a provided date", () => {
    const { startOfMonth, startOfNextMonth } = getCurrentMonthRange(
      new Date(2026, 11, 15),
    );

    expect(startOfMonth.getMonth()).toBe(11);
    expect(startOfNextMonth.getFullYear()).toBe(2027);
    expect(startOfNextMonth.getMonth()).toBe(0);
  });
});

describe("parseLocalDate", () => {
  it("parses an HTML date input value as a local date", () => {
    const date = parseLocalDate("2026-07-25");

    expect(date?.getFullYear()).toBe(2026);
    expect(date?.getMonth()).toBe(6);
    expect(date?.getDate()).toBe(25);
  });

  it("rejects invalid dates", () => {
    expect(parseLocalDate("")).toBeNull();
    expect(parseLocalDate("2026-02-31")).toBeNull();
    expect(parseLocalDate("not-a-date")).toBeNull();
  });
});
