import type { UpdateBankStartingBalanceByUserIdInput } from "@/types/types";
import { prisma } from "./prisma";
import { getBillsByDay } from "./bills-db";

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

export async function applyBillsForTheDay(userId: string, date: Date) {
  const bills = await getBillsByDay(
    userId,
    date.getFullYear(),
    date.getMonth() + 1,
    date.getDate(),
  );
  let currentBalanceChange = 0;
  let currentSavingsChange = 0;

  if (bills.length == 0) return;

  const billIds = bills.map((bill) => bill.id);

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


    //transaction will update currentBalance,savings,and applied. If one fails it will undo changes it just made
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
          id: {
            in: billIds,
          },
        },
        data: {
          applied: true,
        },
      }),
    ]);
  }
}
