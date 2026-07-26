import { beforeEach, describe, expect, it, vi } from "vitest";

const requireUserMock = vi.hoisted(() => vi.fn());
const applyUnappliedBillsMock = vi.hoisted(() => vi.fn());
const getUserBankInfoMock = vi.hoisted(() => vi.fn());
const getUserOnboardingStatusMock = vi.hoisted(() => vi.fn());
const updateBankStartingBalanceMock = vi.hoisted(() => vi.fn());
const getUnappliedBillsByRangeMock = vi.hoisted(() => vi.fn());
const redirectMock = vi.hoisted(() => vi.fn());

vi.mock("../lib/auth/session", () => ({
  requireUser: requireUserMock,
}));

vi.mock("../lib/db/bank-db", () => ({
  applyUnappliedBillsFromMonthStartThroughToday: applyUnappliedBillsMock,
  getUserBankInfo: getUserBankInfoMock,
  getUserOnboardingStatus: getUserOnboardingStatusMock,
  updateBankStartingBalanceByUserId: updateBankStartingBalanceMock,
}));

vi.mock("../lib/db/bills-db", () => ({
  getUnappliedBillsByRange: getUnappliedBillsByRangeMock,
}));

vi.mock("next/navigation", () => ({
  redirect: redirectMock,
}));

import {
  getUserBankAnalyticsAction,
  getUserBankInfoAction,
  updateBankStartingBalanceFormAction,
} from "./bank-actions";

describe("bank actions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 6, 25, 12));
    requireUserMock.mockResolvedValue({ id: "user-1" });
    getUserBankInfoMock.mockResolvedValue({
      currentBalance: 1000,
      savings: 200,
      lastUpdated: new Date(2026, 6, 25),
    });
  });

  it("applies pending bills before returning bank info", async () => {
    await expect(getUserBankInfoAction()).resolves.toEqual({
      savings: 200,
      currentBalance: 1000,
      lastUpdate: new Date(2026, 6, 25),
    });

    expect(applyUnappliedBillsMock).toHaveBeenCalledWith("user-1");
    expect(getUserBankInfoMock).toHaveBeenCalledWith("user-1");
  });

  it("projects end-of-week and end-of-month balances from future unapplied bills", async () => {
    getUnappliedBillsByRangeMock
      .mockResolvedValueOnce([
        { type: "payday", amount: 500 },
        { type: "bill", amount: 100 },
        { type: "savings", amount: 50 },
      ])
      .mockResolvedValueOnce([
        { type: "payday", amount: 500 },
        { type: "purchase", amount: 25 },
        { type: "savings", amount: 75 },
      ]);

    await expect(getUserBankAnalyticsAction()).resolves.toMatchObject({
      currentBalance: 1000,
      savings: 200,
      endOfWeekBalance: 1350,
      endOfWeekSavings: 250,
      endOfMonthBalance: 1400,
      endOfMonthSavings: 275,
    });
  });

  it("updates starting bank balances for users who have not completed onboarding", async () => {
    getUserOnboardingStatusMock.mockResolvedValue({
      onboardingComplete: false,
    });
    const formData = new FormData();
    formData.set("startingBalance", "1000");
    formData.set("startingSavings", "250");

    await updateBankStartingBalanceFormAction(formData);

    expect(updateBankStartingBalanceMock).toHaveBeenCalledWith({
      userId: "user-1",
      startingBalance: 1000,
      startingSavings: 250,
    });
    expect(redirectMock).toHaveBeenCalledWith("/dashboard");
  });

  it("redirects to dashboard when onboarding is already complete", async () => {
    getUserOnboardingStatusMock.mockResolvedValue({
      onboardingComplete: true,
    });
    const formData = new FormData();
    formData.set("startingBalance", "1000");
    formData.set("startingSavings", "250");

    await updateBankStartingBalanceFormAction(formData);

    expect(redirectMock).toHaveBeenCalledWith("/dashboard");
  });
});
