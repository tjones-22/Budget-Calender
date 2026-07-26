import { beforeEach, describe, expect, it, vi } from "vitest";

const prismaMock = vi.hoisted(() => ({
  $transaction: vi.fn(),
  bank: {
    findUnique: vi.fn(),
    update: vi.fn(),
    upsert: vi.fn(),
  },
  bills: {
    updateMany: vi.fn(),
  },
}));

const billsDbMock = vi.hoisted(() => ({
  getBillsByDay: vi.fn(),
  getBillsByRange: vi.fn(),
  getUnappliedBillsFromMonthStartThroughDay: vi.fn(),
}));

vi.mock("./prisma", () => ({
  prisma: prismaMock,
}));

vi.mock("./bills-db", () => billsDbMock);

import {
  applyBillSimulation,
  applyBillsForTheDay,
  applyUnappliedBillsFromMonthStartThroughToday,
  getUsersSavingsForTheMonth,
  setupNewOAuthUser,
} from "./bank-db";

describe("bank db helpers", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 6, 25, 12));
    prismaMock.$transaction.mockResolvedValue([]);
    prismaMock.bank.update.mockReturnValue({ kind: "bank-update" });
    prismaMock.bills.updateMany.mockReturnValue({ kind: "bills-update" });
  });

  it("sets up a new OAuth user with a bank row if needed", async () => {
    await setupNewOAuthUser("user-1");

    expect(prismaMock.bank.upsert).toHaveBeenCalledWith({
      where: { userId: "user-1" },
      update: {},
      create: {
        userId: "user-1",
        savings: 0,
        currentBalance: 0,
      },
    });
  });

  it("returns zero for missing monthly savings", async () => {
    prismaMock.bank.findUnique.mockResolvedValue(null);

    await expect(getUsersSavingsForTheMonth("user-1")).resolves.toBe(0);
  });

  it("applies a day's bills to the bank and marks them applied", async () => {
    billsDbMock.getBillsByDay.mockResolvedValue([
      { id: "payday-1", amount: 1000, type: "payday" },
      { id: "bill-1", amount: 200, type: "bill" },
      { id: "savings-1", amount: 100, type: "savings" },
    ]);

    await applyBillsForTheDay("user-1", new Date(2026, 6, 25));

    expect(prismaMock.$transaction).toHaveBeenCalledWith([
      {
        kind: "bank-update",
      },
      {
        kind: "bills-update",
      },
    ]);
    expect(prismaMock.bank.update).toHaveBeenCalledWith({
      where: { userId: "user-1" },
      data: {
        currentBalance: {
          increment: 700,
        },
        savings: {
          increment: 100,
        },
      },
    });
    expect(prismaMock.bills.updateMany).toHaveBeenCalledWith({
      where: {
        userId: "user-1",
        id: {
          in: ["payday-1", "bill-1", "savings-1"],
        },
      },
      data: {
        applied: true,
      },
    });
  });

  it("does not run a transaction when there are no unapplied bills", async () => {
    billsDbMock.getUnappliedBillsFromMonthStartThroughDay.mockResolvedValue([]);

    await expect(
      applyUnappliedBillsFromMonthStartThroughToday("user-1"),
    ).resolves.toEqual({
      appliedCount: 0,
      appliedBills: [],
    });

    expect(prismaMock.$transaction).not.toHaveBeenCalled();
  });

  it("simulates future bills from the current bank state", async () => {
    prismaMock.bank.findUnique.mockResolvedValue({
      currentBalance: 1000,
      savings: 200,
      lastUpdated: new Date(),
    });
    billsDbMock.getBillsByRange.mockResolvedValue([
      { id: "payday-1", amount: 500, type: "payday" },
      { id: "purchase-1", amount: 75, type: "purchase" },
      { id: "savings-1", amount: 50, type: "savings" },
    ]);

    await expect(
      applyBillSimulation("user-1", new Date(2026, 6, 28)),
    ).resolves.toEqual({
      projectedBalance: 1375,
      projectedSavings: 250,
    });
  });
});
