"use server";

import { requireUser } from "../lib/auth/session";
import {
  getBillsByUser,
  getBillsByUserForMonth,
  AddBill,
  addRecurringBill,
  deleteBillById,
  deleteRecurringBillById,
} from "../lib/db/bills-db";
import { applyUnappliedBillsFromMonthStartThroughToday } from "../lib/db/bank-db";
import {
  createNotification,
  deleteNotification,
  getNotificationsByDay,
} from "../lib/db/notifications";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import type { Bill, Notification } from "@/app/types/types";
import { isBillType, isRecurrenceOption } from "../lib/bills";
import { parseLocalDate } from "../lib/dates";

function getAmountValue(formData: FormData) {
  const amountValue = formData.get("amount");

  if (typeof amountValue !== "string" || amountValue.trim() === "") {
    return {
      amount: null,
      rawAmount: amountValue,
    };
  }

  const amount = Number(amountValue);

  return {
    amount: Number.isFinite(amount) && amount > 0 ? amount : null,
    rawAmount: amountValue,
  };
}

// server action for getting a user's bills
export async function getUsersBillsAction() {
  const user = await requireUser();
  const userBills = await getBillsByUser(user.id);

  return userBills;
}

export async function getUsersBillsByDayForMonthAction(
  year: number,
  month: number,
) {
  const user = await requireUser();
  const userBills = await getBillsByUserForMonth(user.id, year, month);

  return userBills.reduce<Record<number, Bill[]>>((billsByDay, bill) => {
    if (!isBillType(bill.type)) {
      return billsByDay;
    }

    const dayNumber = bill.date.getDate();

    billsByDay[dayNumber] = [
      ...(billsByDay[dayNumber] ?? []),
      {
        id: bill.id,
        recurringBillId: bill.recurringBillId,
        isRecurring: bill.isRecurring,
        name: bill.name,
        type: bill.type,
        date: bill.date,
        amount: bill.amount,
      },
    ];

    return billsByDay;
  }, {});
}

export async function addBillAction(href: string, formData: FormData) {
  const user = await requireUser();

  const name = String(formData.get("name") ?? "");
  const type = String(formData.get("type") ?? "");
  const dateValue = String(formData.get("date") ?? "");
  const recurrence = String(formData.get("recurrence") ?? "none");
  const date = parseLocalDate(dateValue);
  const { amount, rawAmount } = getAmountValue(formData);

  if (!name || !isBillType(type) || !date) {
    throw new Error("Invalid bill form data");
  }

  if (amount === null) {
    throw new Error(`Invalid bill amount: ${String(rawAmount)}`);
  }

  if (!isRecurrenceOption(recurrence)) {
    throw new Error("Invalid recurrence option");
  }

  if (recurrence !== "none") {
    await addRecurringBill({
      name,
      type,
      amount,
      frequency: recurrence,
      startDate: date,
      userId: user.id,
    });
  }

  const bill = await AddBill({
    name,
    type,
    date,
    userId: user.id,
    amount,
  });

  await createNotification(name, date, bill.id, user.id, amount);
  await applyUnappliedBillsFromMonthStartThroughToday(user.id);

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/analytics");
  revalidatePath("/dashboard/calender");
  revalidatePath("/dashboard/notifications");

  redirect(href);
}

export async function deleteNotificationAction(notificationID: string) {
  const user = await requireUser();

  await deleteNotification(notificationID, user.id);
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/notifications");
}

export async function deleteBillAction(billId: string) {
  const user = await requireUser();

  await deleteBillById(user.id, billId);

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/analytics");
  revalidatePath("/dashboard/calender");
  revalidatePath("/dashboard/notifications");
}

export async function deleteRecurringBillAction(recurringBillId: string) {
  const user = await requireUser();

  await deleteRecurringBillById(user.id, recurringBillId);

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/analytics");
  revalidatePath("/dashboard/calender");
  revalidatePath("/dashboard/notifications");
}

export async function getNotificationsByDayAction() {
  const user = await requireUser();
  const notifications = await getNotificationsByDay(user.id);
  return notifications as Notification[];
}
