"use server";

import { redirect } from "next/navigation";
import { requireUser } from "../lib/auth/session";
import {
  applyUnappliedBillsFromMonthStartThroughToday,
  getUserBankInfo,
  getUserOnboardingStatus,
  updateBankStartingBalanceByUserId,
} from "../lib/db/bank-db";
import { getUnappliedBillsByRange } from "../lib/db/bills-db";
import {
  getCurrentMonthRange,
  getCurrentWeekRange,
  getStartOfNextDay,
} from "../lib/dates";

function getStringValue(formData: FormData, key: string) {
  const value = formData.get(key);

  return typeof value === "string" ? value.trim() : "";
}

function getProjectedBankValues(
  currentBalance: number,
  savings: number,
  bills: { amount: number; type: string }[],
) {
  return bills.reduce(
    (projectedValues, bill) => {
      if (bill.type === "payday") {
        projectedValues.currentBalance += bill.amount;
      }

      if (bill.type === "bill" || bill.type === "purchase") {
        projectedValues.currentBalance -= bill.amount;
      }

      if (bill.type === "savings") {
        projectedValues.currentBalance -= bill.amount;
        projectedValues.savings += bill.amount;
      }

      return projectedValues;
    },
    {
      currentBalance,
      savings,
    },
  );
}

export async function getUserBankInfoAction() {
  const user = await requireUser();
  await applyUnappliedBillsFromMonthStartThroughToday(user.id);

  const userBankInfo = await getUserBankInfo(user.id);

  return {
    savings: userBankInfo?.savings,
    currentBalance: userBankInfo?.currentBalance,
    lastUpdate: userBankInfo?.lastUpdated,
  };
}

export async function getUserBankAnalyticsAction() {
  const user = await requireUser();
  await applyUnappliedBillsFromMonthStartThroughToday(user.id);

  const userBankInfo = await getUserBankInfo(user.id);
  const currentBalance = userBankInfo?.currentBalance ?? 0;
  const savings = userBankInfo?.savings ?? 0;

  const { startOfWeek, startOfNextWeek } = getCurrentWeekRange();
  const { startOfNextMonth } = getCurrentMonthRange();
  const startOfTomorrow = getStartOfNextDay();

  const futureWeekBills = await getUnappliedBillsByRange(
    user.id,
    startOfTomorrow,
    startOfNextWeek,
  );

  const futureMonthBills = await getUnappliedBillsByRange(
    user.id,
    startOfTomorrow,
    startOfNextMonth,
  );

  const endOfWeek = getProjectedBankValues(
    currentBalance,
    savings,
    futureWeekBills,
  );

  const endOfMonth = getProjectedBankValues(
    currentBalance,
    savings,
    futureMonthBills,
  );

  return {
    startOfWeek,
    startOfNextWeek,
    currentBalance,
    savings,
    endOfWeekBalance: endOfWeek.currentBalance,
    endOfWeekSavings: endOfWeek.savings,
    endOfMonthBalance: endOfMonth.currentBalance,
    endOfMonthSavings: endOfMonth.savings,
  };
}

export async function updateBankStartingBalanceFormAction(formData: FormData) {
  const user = await requireUser();
  const startingBalanceValue = Number(
    getStringValue(formData, "startingBalance"),
  );
  const startingSavingsBalanceValue = Number(
    getStringValue(formData, "startingSavings"),
  );

  if (
    !Number.isFinite(startingBalanceValue) ||
    !Number.isFinite(startingSavingsBalanceValue) ||
    startingBalanceValue < 0 ||
    startingSavingsBalanceValue < 0
  ) {
    redirect(
      `/signup/addbankinfo?error=${encodeURIComponent(
        "Enter valid balances",
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
