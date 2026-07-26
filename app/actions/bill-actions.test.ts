import { beforeEach, describe, expect, it, vi } from "vitest";

const requireUserMock = vi.hoisted(() => vi.fn());
const addBillMock = vi.hoisted(() => vi.fn());
const addRecurringBillMock = vi.hoisted(() => vi.fn());
const deleteBillByIdMock = vi.hoisted(() => vi.fn());
const deleteRecurringBillByIdMock = vi.hoisted(() => vi.fn());
const getBillsByUserMock = vi.hoisted(() => vi.fn());
const getBillsByUserForMonthMock = vi.hoisted(() => vi.fn());
const applyUnappliedBillsMock = vi.hoisted(() => vi.fn());
const createNotificationMock = vi.hoisted(() => vi.fn());
const deleteNotificationMock = vi.hoisted(() => vi.fn());
const getNotificationsByDayMock = vi.hoisted(() => vi.fn());
const redirectMock = vi.hoisted(() => vi.fn());
const revalidatePathMock = vi.hoisted(() => vi.fn());

vi.mock("../lib/auth/session", () => ({
  requireUser: requireUserMock,
}));

vi.mock("../lib/db/bills-db", () => ({
  AddBill: addBillMock,
  addRecurringBill: addRecurringBillMock,
  deleteBillById: deleteBillByIdMock,
  deleteRecurringBillById: deleteRecurringBillByIdMock,
  getBillsByUser: getBillsByUserMock,
  getBillsByUserForMonth: getBillsByUserForMonthMock,
}));

vi.mock("../lib/db/bank-db", () => ({
  applyUnappliedBillsFromMonthStartThroughToday: applyUnappliedBillsMock,
}));

vi.mock("../lib/db/notifications", () => ({
  createNotification: createNotificationMock,
  deleteNotification: deleteNotificationMock,
  getNotificationsByDay: getNotificationsByDayMock,
}));

vi.mock("next/navigation", () => ({
  redirect: redirectMock,
}));

vi.mock("next/cache", () => ({
  revalidatePath: revalidatePathMock,
}));

import {
  addBillAction,
  deleteBillAction,
  deleteNotificationAction,
  deleteRecurringBillAction,
  getNotificationsByDayAction,
  getUsersBillsAction,
  getUsersBillsByDayForMonthAction,
} from "./bill-actions";

function makeBillFormData({
  amount = "79.99",
  date = "2026-07-25",
  name = "Internet",
  recurrence = "none",
  type = "bill",
} = {}) {
  const formData = new FormData();

  formData.set("name", name);
  formData.set("type", type);
  formData.set("amount", amount);
  formData.set("date", date);
  formData.set("recurrence", recurrence);

  return formData;
}

describe("bill actions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    requireUserMock.mockResolvedValue({ id: "user-1" });
    addBillMock.mockResolvedValue({
      id: "bill-1",
      name: "Internet",
      type: "bill",
      date: new Date(2026, 6, 25),
      amount: 79.99,
    });
  });

  it("gets the signed-in user's bills", async () => {
    getBillsByUserMock.mockResolvedValue([{ type: "bill", date: new Date() }]);

    await expect(getUsersBillsAction()).resolves.toEqual([
      { type: "bill", date: expect.any(Date) },
    ]);
    expect(getBillsByUserMock).toHaveBeenCalledWith("user-1");
  });

  it("groups a user's monthly bills by local day", async () => {
    getBillsByUserForMonthMock.mockResolvedValue([
      {
        id: "bill-1",
        name: "Internet",
        type: "bill",
        amount: 79.99,
        date: new Date(2026, 6, 25),
      },
      {
        name: "Unknown",
        type: "invalid",
        date: new Date(2026, 6, 26),
      },
    ]);

    await expect(getUsersBillsByDayForMonthAction(2026, 7)).resolves.toEqual({
      25: [
        {
          name: "Internet",
          id: "bill-1",
          amount: 79.99,
          type: "bill",
          date: new Date(2026, 6, 25),
        },
      ],
    });
  });

  it("creates a bill, notification, applies pending bills, revalidates, and redirects", async () => {
    await addBillAction("/dashboard/calender", makeBillFormData());

    expect(addBillMock).toHaveBeenCalledWith({
      name: "Internet",
      type: "bill",
      date: new Date(2026, 6, 25),
      userId: "user-1",
      amount: 79.99,
    });
    expect(createNotificationMock).toHaveBeenCalledWith(
      "Internet",
      new Date(2026, 6, 25),
      "bill-1",
      "user-1",
      79.99,
    );
    expect(applyUnappliedBillsMock).toHaveBeenCalledWith("user-1");
    expect(revalidatePathMock).toHaveBeenCalledWith("/dashboard");
    expect(revalidatePathMock).toHaveBeenCalledWith("/dashboard/analytics");
    expect(revalidatePathMock).toHaveBeenCalledWith("/dashboard/calender");
    expect(revalidatePathMock).toHaveBeenCalledWith("/dashboard/notifications");
    expect(redirectMock).toHaveBeenCalledWith("/dashboard/calender");
  });

  it("creates a recurring bill rule when recurrence is selected", async () => {
    await addBillAction(
      "/dashboard/calender",
      makeBillFormData({
        name: "Rent",
        amount: "1500",
        recurrence: "monthly",
      }),
    );

    expect(addRecurringBillMock).toHaveBeenCalledWith({
      name: "Rent",
      type: "bill",
      amount: 1500,
      frequency: "monthly",
      startDate: new Date(2026, 6, 25),
      userId: "user-1",
    });
  });

  it("rejects invalid bill amounts", async () => {
    await expect(
      addBillAction(
        "/dashboard/calender",
        makeBillFormData({
          amount: "0",
        }),
      ),
    ).rejects.toThrow("Invalid bill amount: 0");

    expect(addBillMock).not.toHaveBeenCalled();
  });

  it("rejects invalid recurrence options", async () => {
    await expect(
      addBillAction(
        "/dashboard/calender",
        makeBillFormData({
          recurrence: "yearly",
        }),
      ),
    ).rejects.toThrow("Invalid recurrence option");
  });

  it("deletes a notification for the signed-in user and revalidates notifications", async () => {
    await deleteNotificationAction("notification-1");

    expect(deleteNotificationMock).toHaveBeenCalledWith(
      "notification-1",
      "user-1",
    );
    expect(revalidatePathMock).toHaveBeenCalledWith("/dashboard");
    expect(revalidatePathMock).toHaveBeenCalledWith("/dashboard/notifications");
  });

  it("deletes a bill for the signed-in user and revalidates affected routes", async () => {
    await deleteBillAction("bill-1");

    expect(deleteBillByIdMock).toHaveBeenCalledWith("user-1", "bill-1");
    expect(revalidatePathMock).toHaveBeenCalledWith("/dashboard");
    expect(revalidatePathMock).toHaveBeenCalledWith("/dashboard/analytics");
    expect(revalidatePathMock).toHaveBeenCalledWith("/dashboard/calender");
    expect(revalidatePathMock).toHaveBeenCalledWith("/dashboard/notifications");
  });

  it("deletes a recurring bill rule for the signed-in user and revalidates affected routes", async () => {
    await deleteRecurringBillAction("recurring-1");

    expect(deleteRecurringBillByIdMock).toHaveBeenCalledWith(
      "user-1",
      "recurring-1",
    );
    expect(revalidatePathMock).toHaveBeenCalledWith("/dashboard");
    expect(revalidatePathMock).toHaveBeenCalledWith("/dashboard/analytics");
    expect(revalidatePathMock).toHaveBeenCalledWith("/dashboard/calender");
    expect(revalidatePathMock).toHaveBeenCalledWith("/dashboard/notifications");
  });

  it("gets today's notifications for the signed-in user", async () => {
    getNotificationsByDayMock.mockResolvedValue([
      { id: "notification-1", description: "Internet", amount: 79.99 },
    ]);

    await expect(getNotificationsByDayAction()).resolves.toEqual([
      { id: "notification-1", description: "Internet", amount: 79.99 },
    ]);
    expect(getNotificationsByDayMock).toHaveBeenCalledWith("user-1");
  });
});
