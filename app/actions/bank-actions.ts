"use server";

import { redirect } from "next/navigation";
import { requireUser } from "../lib/auth/session";
import {
  getUserBankInfo,
  getUserOnboardingStatus,
  getUsersSavingsForTheMonth,
  updateBankStartingBalanceByUserId,
} from "../lib/db/bank-db";
import { getBillsByUserByWeek, getBillsByUserForMonth } from "../lib/db/bills-db";
import { getCurrentMonthRange } from "../lib/dates";


function getStringValue(formData: FormData, key: string) {
  const value = formData.get(key);

  return typeof value === "string" ? value.trim() : "";
}

export async function getUserBankInfoAction() {
  await new Promise((resolve) => setTimeout(resolve, 3000));

  const user = await requireUser();
  const userBankInfo = await getUserBankInfo(user.id);

  return {
    savings: userBankInfo?.savings,
    currentBalance: userBankInfo?.currentBalance,
    lastUpdate: userBankInfo?.lastUpdated,
  };
}

export async function getUserBankAnalyticsAction() {
  await new Promise((resolve) => setTimeout(resolve, 3000));

  const user = await requireUser();
  const { startOfMonth } = getCurrentMonthRange();

  const weeklyBillsData = await getBillsByUserByWeek(user.id);

  const monthBills = await getBillsByUserForMonth(
    user.id,
    startOfMonth.getFullYear(),
    startOfMonth.getMonth() + 1,
  );

  const monthlySavings = await getUsersSavingsForTheMonth(user.id);

  const monthlyAmount = monthBills.reduce((total, bill) => {
    if (bill.type === "payday") {
      return total - bill.amount;
    }

    if (bill.type === "bill" || bill.type === "purchase") {
      return total + bill.amount;
    }

    return total;
  }, 0);

  return {
    ...weeklyBillsData,
    monthlyAmount,
    monthlySavings,
  };
}

export async function updateBankStartingBalanceFormAction(formData: FormData) {
  const user = await requireUser();
  const startingBalanceValue = Number(getStringValue(formData, "startingBalance"));
  const startingSavingsBalanceValue = Number(getStringValue(formData, "startingSavings"));

  if (
    !startingBalanceValue ||
    Number.isNaN(
      startingBalanceValue |
        startingSavingsBalanceValue ||
        Number.isNaN(startingSavingsBalanceValue),
    )
  ) {
    redirect(
      `/signup/addbankinfo?error=${encodeURIComponent(
        "Enter a valid starting balance",
      )}`,
    );
  }

  const userSetup = await getUserOnboardingStatus(user.id);

  if (!userSetup || userSetup.onboardingComplete) {
    redirect("/dashboard");
  }

  await updateBankStartingBalanceByUserId({
    userId: user.id,
    startingBalance: startingBalanceValue,
    startingSavings: startingSavingsBalanceValue,
  });

  redirect("/dashboard");
}
