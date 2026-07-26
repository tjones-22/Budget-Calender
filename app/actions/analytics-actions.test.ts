import { beforeEach, describe, expect, it, vi } from "vitest";

const requireUserMock = vi.hoisted(() => vi.fn());
const applyBillSimulationMock = vi.hoisted(() => vi.fn());
const applyUnappliedBillsMock = vi.hoisted(() => vi.fn());

vi.mock("../lib/auth/session", () => ({
  requireUser: requireUserMock,
}));

vi.mock("../lib/db/bank-db", () => ({
  applyBillSimulation: applyBillSimulationMock,
  applyUnappliedBillsFromMonthStartThroughToday: applyUnappliedBillsMock,
}));

import { applyBillsForToday, applyBillsSimulation } from "./analytics-actions";

describe("analytics actions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    requireUserMock.mockResolvedValue({ id: "user-1" });
  });

  it("applies today's pending bills for the signed-in user", async () => {
    await applyBillsForToday();

    expect(applyUnappliedBillsMock).toHaveBeenCalledWith("user-1");
  });

  it("runs a bill simulation for a selected local date", async () => {
    applyBillSimulationMock.mockResolvedValue({
      projectedBalance: 1200,
      projectedSavings: 300,
    });
    const formData = new FormData();
    formData.set("date", "2026-07-25");

    await expect(applyBillsSimulation(formData)).resolves.toEqual({
      projectedBalance: 1200,
      projectedSavings: 300,
    });
    expect(applyBillSimulationMock).toHaveBeenCalledWith(
      "user-1",
      new Date(2026, 6, 25),
    );
  });

  it("rejects invalid simulation dates", async () => {
    const formData = new FormData();
    formData.set("date", "not-a-date");

    await expect(applyBillsSimulation(formData)).rejects.toThrow(
      "Invalid Date",
    );
  });
});
