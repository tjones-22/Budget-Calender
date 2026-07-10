"use server"

import { requireUser } from "../lib/auth/session"
import { getBillsByUser, getBillsByUserForMonth, AddBill } from "../lib/db/bills-db";
import { redirect } from "next/navigation";
import type { Bill } from "@/types/types";
import { isBillType } from "../lib/bills";

function parseLocalDate(dateValue: string) {
  const [yearValue, monthValue, dayValue] = dateValue.split("-");
  const year = Number(yearValue);
  const month = Number(monthValue);
  const day = Number(dayValue);

  if (!year || !month || !day) {
    return null;
  }

  const date = new Date(year, month - 1, day);

  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {
    return null;
  }

  return date;
}

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

export async function addBillAction(href:string, formData: FormData) {
    await new Promise((resolve) => setTimeout(resolve, 3000));

    
  const user = await requireUser();

  const name = String(formData.get("name") ?? "");
  const type = String(formData.get("type") ?? "");
  const dateValue = String(formData.get("date") ?? "");
  const date = parseLocalDate(dateValue);

  if (!name || !isBillType(type) || !date) {
    throw new Error("Invalid bill form data");
  }

  await AddBill({
    name,
    type,
    date,
    userId: user.id,
  });

  redirect(href);
}
