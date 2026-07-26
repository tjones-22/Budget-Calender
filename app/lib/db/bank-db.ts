import type { UpdateBankStartingBalanceByUserIdInput } from "@/types/types";
import { prisma } from "./prisma";
import {
  getBillsByDay,
  getBillsByRange,
  getUnappliedBillsFromMonthStartThroughDay,
} from "./bills-db";
import { getStartOfDay, getStartOfNextDay } from "../dates";

type BillBankEffect = {
  id: string;
  amount: number;
  type: string;
};

export async function setupNewOAuthUser(userId: string) {
  await prisma.bank.upsert({
    where: { userId },
    update: {},
    create: {
      userId,
      savings: 0,
      currentBalance: 0,
    },
  });
}

export async function getUserOnboardingStatus(userId: string) {
  return prisma.bank.findUnique({
    where: { userId },
    select: {
      onboardingComplete: true,
    },
  });
}

export async function getUserBankInfo(userId: string) {
  return prisma.bank.findUnique({
    where: {
      userId,
    },
    select: {
      savings: true,
      currentBalance: true,
      lastUpdated: true,
    },
  });
}

export async function getUsersSavingsForTheMonth(userId: string) {
  const userSavings = await prisma.bank.findUnique({
    where: {
      userId,
    },
    select: {
      savings: true,
    },
  });

  return userSavings?.savings ?? 0;
}

export async function addUsersSavings(userId: string, amountAdded: number) {
  // adding to savings will bull from current balance ("the checking account")
  await prisma.bank.update({
    where: {
      userId,
    },
    data: {
      currentBalance: {
        decrement: amountAdded,
      },
    },
  });

  return prisma.bank.update({
    where: {
      userId,
    },
    data: {
      savings: {
        increment: amountAdded,
      },
    },
    select: {
      savings: true,
    },
  });
}

export async function updateBankStartingBalanceByUserId({
  userId,
  startingBalance,
  startingSavings,
}: UpdateBankStartingBalanceByUserIdInput) {
  const bank = await prisma.bank.update({
    where: { userId },
    data: {
      currentBalance: startingBalance,
      savings: startingSavings,
      onboardingComplete: true,
    },
    select: {
      savings: true,
      currentBalance: true,
      lastUpdated: true,
    },
  });

  return { bank };
}

export async function updateCurrentBalance(userId: string, amount: number) {
  await prisma.bank.update({
    where: {
      userId,
    },
    data: {
      currentBalance: {
        increment: amount,
      },
    },
  });
}

function getBillTotals(bills: BillBankEffect[]) {
  let currentBalanceChange = 0;
  let currentSavingsChange = 0;

  for (const bill of bills) {
    if (bill.type === "payday") {
      currentBalanceChange += bill.amount;
    }

    if (bill.type === "savings") {
      currentBalanceChange -= bill.amount;
      currentSavingsChange += bill.amount;
    }

    if (bill.type === "bill" || bill.type === "purchase") {
      currentBalanceChange -= bill.amount;
    }
  }

  return {
    currentBalanceChange,
    currentSavingsChange,
  };
}

async function applyBillsToBank(userId: string, bills: BillBankEffect[]) {
  if (bills.length === 0) {
    return {
      appliedCount: 0,
      appliedBills: bills,
    };
  }

  const billIds = bills.map((bill) => bill.id);
  const { currentBalanceChange, currentSavingsChange } = getBillTotals(bills);

  // transaction will update currentBalance, savings, and applied together.
  // If one fails, Prisma rolls back all changes in this transaction.
  await prisma.$transaction([
    prisma.bank.update({
      where: { userId },
      data: {
        currentBalance: {
          increment: currentBalanceChange,
        },
        savings: {
          increment: currentSavingsChange,
        },
      },
    }),

    prisma.bills.updateMany({
      where: {
        userId,
        id: {
          in: billIds,
        },
      },
      data: {
        applied: true,
      },
    }),
  ]);

  return {
    appliedCount: bills.length,
    appliedBills: bills,
  };
}

export async function applyBillsForTheDay(userId: string, date: Date) {
  const bills = await getBillsByDay(
    userId,
    date.getFullYear(),
    date.getMonth() + 1,
    date.getDate(),
  );

  return applyBillsToBank(userId, bills);
}

export async function applyUnappliedBillsFromMonthStartThroughToday(
  userId: string,
  date = new Date(),
) {
  const bills = await getUnappliedBillsFromMonthStartThroughDay(userId, date);

  return applyBillsToBank(userId, bills);
}





export async function applyBillSimulation(
  userId: string,
  selectedDay: Date,
) {
 
  const bank = await getUserBankInfo(userId);

  if (!bank) {
    return null;
  }

  let currentBalance = bank.currentBalance 
  let savings = bank.savings;
  const today = getStartOfDay();
  const selectedDate = getStartOfDay(selectedDay);

  if(selectedDate.getTime() == today.getTime()){
    return {
      projectedBalance: currentBalance,
      projectedSavings: savings,

    };
  }

  const isFutureProjection = selectedDate > today;
  const bills = isFutureProjection
    ? await getBillsByRange(
        userId,
        getStartOfNextDay(today),
        getStartOfNextDay(selectedDate),
      )
    : await getBillsByRange(
        userId,
        getStartOfNextDay(selectedDate),
        getStartOfNextDay(today),
      );

  if (bills.length === 0) {
    return {
      projectedBalance: currentBalance,
      projectedSavings: savings,
    };
  }

  for (const bill of bills) {
    if (bill.type === "payday") {
      currentBalance += isFutureProjection ? bill.amount : -bill.amount;
    }

    if (bill.type === "purchase" || bill.type === "bill") {
      currentBalance += isFutureProjection ? -bill.amount : bill.amount;
    }

    if (bill.type === "savings") {
      currentBalance += isFutureProjection ? -bill.amount : bill.amount;
      savings += isFutureProjection ? bill.amount : -bill.amount;
    }
  }

  return {
    projectedBalance: currentBalance,
    projectedSavings: savings,
  };
}
