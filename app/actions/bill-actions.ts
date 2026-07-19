"use server";

import { requireUser } from "../lib/auth/session";
import {
  getBillsByUser,
  getBillsByUserForMonth,
  AddBill,
} from "../lib/db/bills-db";
import { addUsersSavings } from "../lib/db/bank-db";
import {
  createNotification,
  deleteNotification,
  getNotificationsByDay
} from "../lib/db/notifications";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import type { Bill, Notification } from "@/types/types";
import { isBillType } from "../lib/bills";
import { parseLocalDate } from "../lib/dates";

// server action for getting a user's bills
export async function getUsersBillsAction() {
  await new Promise((resolve) => setTimeout(resolve, 3000));

  const user = await requireUser();
  const userBills = await getBillsByUser(user.id);

  return userBills;
}

export async function getUsersBillsByDayForMonthAction(
  year: number,
  month: number,
) {
  await new Promise((resolve) => setTimeout(resolve, 3000));

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
        name: bill.name,
        type: bill.type,
        date: bill.date,
      },
    ];

    return billsByDay;
  }, {});
}

export async function addBillAction(href: string, formData: FormData) {
  await new Promise((resolve) => setTimeout(resolve, 3000));

  const user = await requireUser();

  const name = String(formData.get("name") ?? "");
  const type = String(formData.get("type") ?? "");
  const dateValue = String(formData.get("date") ?? "");
  const date = parseLocalDate(dateValue);
  const amount = Number(formData.get("amount") ?? "");

  if (!name || !isBillType(type) || !date) {
    throw new Error("Invalid bill form data");
  }

  if(type === "savings"){
    addUsersSavings(user.id, amount);
  }

  const bill = await AddBill({
    name,
    type,
    date,
    userId: user.id,
    amount
  });

  await createNotification(name, date, bill.id, user.id, amount);

  redirect(href);
}

export async function deleteNotificationAction(notificationID: string) {
  await new Promise((resolve) => setTimeout(resolve, 3000));
  const user = await requireUser();

  await deleteNotification(notificationID, user.id);
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/notifications");
}

export async function getNotificationsByDayAction() {
  const user = await requireUser();
  const notifications =  await getNotificationsByDay(user.id);
  return notifications as Notification[];
}
