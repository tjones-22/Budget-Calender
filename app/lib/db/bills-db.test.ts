import { beforeEach, describe, expect, it, vi } from "vitest";

const prismaMock = vi.hoisted(() => ({
  bills: {
    create: vi.fn(),
    deleteMany: vi.fn(),
    findMany: vi.fn(),
  },
  recurringBill: {
    create: vi.fn(),
    deleteMany: vi.fn(),
    findMany: vi.fn(),
  },
}));

vi.mock("./prisma", () => ({
  prisma: prismaMock,
}));

import {
  AddBill,
  addRecurringBill,
  deleteBillById,
  deleteRecurringBillById,
  getBillsByDay,
  getBillsByRange,
  getBillsByUserForMonth,
  getUnappliedBillsByRange,
} from "./bills-db";

describe("bills db helpers", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    prismaMock.recurringBill.findMany.mockResolvedValue([]);
  });

  it("creates a bill and returns the selected fields", async () => {
    prismaMock.bills.create.mockResolvedValue({
      id: "bill-1",
      name: "Internet",
      type: "bill",
      amount: 79.99,
      date: new Date(2026, 6, 25),
    });

    await expect(
      AddBill({
        name: "Internet",
        type: "bill",
        amount: 79.99,
        date: new Date(2026, 6, 25),
        userId: "user-1",
      }),
    ).resolves.toMatchObject({
      id: "bill-1",
      amount: 79.99,
    });

    expect(prismaMock.bills.create).toHaveBeenCalledWith({
      data: {
        name: "Internet",
        type: "bill",
        amount: 79.99,
        date: expect.any(Date),
        userId: "user-1",
      },
      select: {
        id: true,
        name: true,
        type: true,
        date: true,
        amount: true,
      },
    });
  });

  it("queries a user's bills for a specific month", async () => {
    prismaMock.bills.findMany.mockResolvedValue([]);

    await getBillsByUserForMonth("user-1", 2026, 7);

    expect(prismaMock.bills.findMany).toHaveBeenCalledWith({
      where: {
        userId: "user-1",
        date: {
          gte: new Date(2026, 6, 1),
          lt: new Date(2026, 7, 1),
        },
      },
      select: {
        id: true,
        name: true,
        type: true,
        date: true,
        amount: true,
      },
    });
    expect(prismaMock.recurringBill.findMany).toHaveBeenCalledWith({
      where: {
        userId: "user-1",
        active: true,
        startDate: {
          lt: new Date(2026, 7, 1),
        },
      },
      select: {
        id: true,
        name: true,
        type: true,
        amount: true,
        frequency: true,
        startDate: true,
      },
    });
  });

  it("adds monthly recurring bills to future calendar months", async () => {
    prismaMock.bills.findMany.mockResolvedValue([]);
    prismaMock.recurringBill.findMany.mockResolvedValue([
      {
        id: "recurring-1",
        name: "Rent",
        type: "bill",
        amount: 1500,
        frequency: "monthly",
        startDate: new Date(2026, 6, 5),
      },
    ]);

    await expect(getBillsByUserForMonth("user-1", 2026, 8)).resolves.toEqual([
      {
        recurringBillId: "recurring-1",
        isRecurring: true,
        name: "Rent",
        type: "bill",
        amount: 1500,
        date: new Date(2026, 7, 5),
      },
    ]);
  });

  it("adds weekly and biweekly recurring bills inside the selected month", async () => {
    prismaMock.bills.findMany.mockResolvedValue([]);
    prismaMock.recurringBill.findMany.mockResolvedValue([
      {
        id: "recurring-1",
        name: "Allowance",
        type: "payday",
        amount: 100,
        frequency: "weekly",
        startDate: new Date(2026, 6, 25),
      },
      {
        id: "recurring-2",
        name: "Biweekly Bill",
        type: "bill",
        amount: 50,
        frequency: "biweekly",
        startDate: new Date(2026, 6, 18),
      },
    ]);

    await expect(getBillsByUserForMonth("user-1", 2026, 8)).resolves.toEqual([
      {
        recurringBillId: "recurring-1",
        isRecurring: true,
        name: "Allowance",
        type: "payday",
        amount: 100,
        date: new Date(2026, 7, 1),
      },
      {
        recurringBillId: "recurring-1",
        isRecurring: true,
        name: "Allowance",
        type: "payday",
        amount: 100,
        date: new Date(2026, 7, 8),
      },
      {
        recurringBillId: "recurring-1",
        isRecurring: true,
        name: "Allowance",
        type: "payday",
        amount: 100,
        date: new Date(2026, 7, 15),
      },
      {
        recurringBillId: "recurring-1",
        isRecurring: true,
        name: "Allowance",
        type: "payday",
        amount: 100,
        date: new Date(2026, 7, 22),
      },
      {
        recurringBillId: "recurring-1",
        isRecurring: true,
        name: "Allowance",
        type: "payday",
        amount: 100,
        date: new Date(2026, 7, 29),
      },
      {
        recurringBillId: "recurring-2",
        isRecurring: true,
        name: "Biweekly Bill",
        type: "bill",
        amount: 50,
        date: new Date(2026, 7, 1),
      },
      {
        recurringBillId: "recurring-2",
        isRecurring: true,
        name: "Biweekly Bill",
        type: "bill",
        amount: 50,
        date: new Date(2026, 7, 15),
      },
      {
        recurringBillId: "recurring-2",
        isRecurring: true,
        name: "Biweekly Bill",
        type: "bill",
        amount: 50,
        date: new Date(2026, 7, 29),
      },
    ]);
  });

  it("queries unapplied bills for one day", async () => {
    prismaMock.bills.findMany.mockResolvedValue([]);

    await getBillsByDay("user-1", 2026, 7, 25);

    expect(prismaMock.bills.findMany).toHaveBeenCalledWith({
      where: {
        userId: "user-1",
        applied: false,
        date: {
          gte: new Date(2026, 6, 25),
          lt: new Date(2026, 6, 26),
        },
      },
      select: {
        name: true,
        amount: true,
        type: true,
        id: true,
      },
    });
  });

  it("queries unapplied bills by date range", async () => {
    const startDate = new Date(2026, 6, 1);
    const endDate = new Date(2026, 6, 31);
    prismaMock.bills.findMany.mockResolvedValue([]);

    await getUnappliedBillsByRange("user-1", startDate, endDate);

    expect(prismaMock.bills.findMany).toHaveBeenCalledWith({
      where: {
        userId: "user-1",
        applied: false,
        date: {
          gte: startDate,
          lt: endDate,
        },
      },
      orderBy: {
        date: "asc",
      },
      select: {
        amount: true,
        type: true,
      },
    });
  });

  it("returns range bills in reverse order for simulation math", async () => {
    prismaMock.bills.findMany.mockResolvedValue([
      { id: "one", amount: 1, type: "bill" },
      { id: "two", amount: 2, type: "payday" },
    ]);

    await expect(
      getBillsByRange("user-1", new Date(2026, 6, 1), new Date(2026, 6, 5)),
    ).resolves.toEqual([
      { id: "two", amount: 2, type: "payday" },
      { id: "one", amount: 1, type: "bill" },
    ]);
  });

  it("creates a recurring bill rule", async () => {
    prismaMock.recurringBill.create.mockResolvedValue({ id: "recurring-1" });

    await addRecurringBill({
      name: "Rent",
      type: "bill",
      amount: 1500,
      frequency: "monthly",
      startDate: new Date(2026, 6, 1),
      userId: "user-1",
    });

    expect(prismaMock.recurringBill.create).toHaveBeenCalledWith({
      data: {
        name: "Rent",
        type: "bill",
        amount: 1500,
        frequency: "monthly",
        startDate: expect.any(Date),
        userId: "user-1",
      },
    });
  });

  it("deletes a bill scoped to the user", async () => {
    await deleteBillById("user-1", "bill-1");

    expect(prismaMock.bills.deleteMany).toHaveBeenCalledWith({
      where: {
        id: "bill-1",
        userId: "user-1",
      },
    });
  });

  it("deletes a recurring bill rule scoped to the user", async () => {
    await deleteRecurringBillById("user-1", "recurring-1");

    expect(prismaMock.recurringBill.deleteMany).toHaveBeenCalledWith({
      where: {
        id: "recurring-1",
        userId: "user-1",
      },
    });
  });
});
