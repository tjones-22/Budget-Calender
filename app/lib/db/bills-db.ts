import { prisma } from "./prisma";
import { AddBillInput, addRecurringBillInput } from "@/types/types";
import { isBillType } from "../bills";
import {
  getCurrentWeekRange,
  getDayRange,
  getMonthRange,
  getStartOfNextDay,
  getTodayRange,
} from "../dates";

type MonthBill = {
  id?: string;
  recurringBillId?: string;
  isRecurring?: boolean;
  name: string;
  type: string;
  date: Date;
  amount: number;
};

type RecurringBillRule = {
  id: string;
  name: string;
  type: string;
  amount: number;
  frequency: string;
  startDate: Date;
};

function isSameLocalDay(firstDate: Date, secondDate: Date) {
  return (
    firstDate.getFullYear() === secondDate.getFullYear() &&
    firstDate.getMonth() === secondDate.getMonth() &&
    firstDate.getDate() === secondDate.getDate()
  );
}

function isInRange(date: Date, startDate: Date, endDate: Date) {
  return date >= startDate && date < endDate;
}

function addDays(date: Date, days: number) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate() + days);
}

function getMonthlyOccurrenceDate(
  recurringBill: RecurringBillRule,
  monthDate: Date,
) {
  const occurrenceDate = new Date(
    monthDate.getFullYear(),
    monthDate.getMonth(),
    recurringBill.startDate.getDate(),
  );

  if (occurrenceDate.getMonth() !== monthDate.getMonth()) {
    return null;
  }

  return occurrenceDate;
}

function getRecurringBillOccurrencesForMonth(
  recurringBills: RecurringBillRule[],
  startOfMonth: Date,
  startOfNextMonth: Date,
): MonthBill[] {
  const occurrences: MonthBill[] = [];

  for (const recurringBill of recurringBills) {
    if (!isBillType(recurringBill.type)) {
      continue;
    }

    if (recurringBill.frequency === "monthly") {
      const occurrenceDate = getMonthlyOccurrenceDate(
        recurringBill,
        startOfMonth,
      );

      if (
        occurrenceDate &&
        occurrenceDate >= recurringBill.startDate &&
        isInRange(occurrenceDate, startOfMonth, startOfNextMonth) &&
        !isSameLocalDay(occurrenceDate, recurringBill.startDate)
      ) {
        occurrences.push({
          recurringBillId: recurringBill.id,
          isRecurring: true,
          name: recurringBill.name,
          type: recurringBill.type,
          amount: recurringBill.amount,
          date: occurrenceDate,
        });
      }

      continue;
    }

    const intervalDays =
      recurringBill.frequency === "daily"
        ? 1
        : recurringBill.frequency === "weekly"
          ? 7
          : recurringBill.frequency === "biweekly"
            ? 14
            : null;

    if (!intervalDays) {
      continue;
    }

    for (
      let occurrenceDate = recurringBill.startDate;
      occurrenceDate < startOfNextMonth;
      occurrenceDate = addDays(occurrenceDate, intervalDays)
    ) {
      if (
        isInRange(occurrenceDate, startOfMonth, startOfNextMonth) &&
        !isSameLocalDay(occurrenceDate, recurringBill.startDate)
      ) {
        occurrences.push({
          recurringBillId: recurringBill.id,
          isRecurring: true,
          name: recurringBill.name,
          type: recurringBill.type,
          amount: recurringBill.amount,
          date: occurrenceDate,
        });
      }
    }
  }

  return occurrences;
}

// get a user's bills
export async function getBillsByUser(userID: string) {
  const { startOfToday, startOfTomorrow } = getTodayRange();

  const userBills = await prisma.bills.findMany({
    where: {
      userId: userID,
      date: {
        gte: startOfToday,
        lt: startOfTomorrow,
      },
    },
    select: {
      type: true,
      date: true,
    },
  });

  return userBills;
}

export async function getBillsByUserByWeek(userId: string) {
  const { startOfWeek, startOfNextWeek } = getCurrentWeekRange();

  const weekBills = await prisma.bills.findMany({
    where: {
      userId,
      date: {
        gte: startOfWeek,
        lt: startOfNextWeek,
      },
    },
    select: {
      amount: true,
      type: true,
    },
  });

  const weeklyAmount = weekBills.reduce((total, bill) => {
    if (bill.type === "payday") {
      return total - bill.amount;
    }

    if (bill.type === "bill" || bill.type === "purchase") {
      return total + bill.amount;
    }

    return total;
  }, 0);

  return {
    startOfWeek,
    startOfNextWeek,
    weeklyAmount,
  };
}

export async function getUnappliedBillsByRange(
  userId: string,
  startDate: Date,
  endDate: Date,
) {
  return prisma.bills.findMany({
    where: {
      userId,
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
}

export async function getBillsByUserForMonth(
  userID: string,
  year: number,
  month: number,
): Promise<MonthBill[]> {
  const { startOfMonth, startOfNextMonth } = getMonthRange(year, month);

  const userBills = await prisma.bills.findMany({
    where: {
      userId: userID,
      date: {
        gte: startOfMonth,
        lt: startOfNextMonth,
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

  const recurringBills = await prisma.recurringBill.findMany({
    where: {
      userId: userID,
      active: true,
      startDate: {
        lt: startOfNextMonth,
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

  const bills: MonthBill[] = userBills.map((bill) => ({
    id: bill.id,
    name: bill.name,
    type: bill.type,
    date: bill.date,
    amount: bill.amount,
  }));

  return [
    ...bills,
    ...getRecurringBillOccurrencesForMonth(
      recurringBills,
      startOfMonth,
      startOfNextMonth,
    ),
  ];
}

export async function getBillsByDay(userId:string, year:number, month:number, day:number){
  const { startOfDay, startOfNextDay } = getDayRange(year, month, day);

  const bill = await prisma.bills.findMany({
    where:{
      userId,
      applied:false,
      date:{
        gte:startOfDay,
        lt:startOfNextDay
      }
      
      
    },
    select:{
      name:true,
      amount:true,
      type:true,
      id:true,

    }
  })

  return bill;
}

export async function getUnappliedBillsFromMonthStartThroughDay(
  userId: string,
  date = new Date(),
) {
  const { startOfMonth } = getMonthRange(
    date.getFullYear(),
    date.getMonth() + 1,
  );
  const startOfNextDay = getStartOfNextDay(date);

  return prisma.bills.findMany({
    where: {
      userId,
      applied: false,
      date: {
        gte: startOfMonth,
        lt: startOfNextDay,
      },
    },
    orderBy: {
      date: "asc",
    },
    select: {
      id: true,
      amount: true,
      type: true,
    },
  });
}

// make sure day1 is less than day 2. EX: day1: July 1 and Day 2 July 23.
export async function getBillsByRange(userId:string, day1:Date,day2:Date){

  const billsInRange = await prisma.bills.findMany({
    where:{
      userId,
      date:{
        gte:day1,
        lt:day2,
      },

    },
    select:{
      amount:true,
      id:true,
      type:true,
  }});

  // used to add/subtract bills, savings,etc from the selected day to the start of the month.
  return billsInRange.reverse();
}

export async function AddBill({
  name,
  type,
  date,
  userId,
  amount,
}: AddBillInput) {
  return await prisma.bills.create({
    data: {
      name,
      type,
      date,
      userId,
      amount,
    },
    select: {
      id: true,
      name: true,
      type: true,
      date: true,
      amount: true,
    },
  });
}

export async function addRecurringBill({name,type,amount,frequency,startDate, userId}: addRecurringBillInput) {
  return await prisma.recurringBill.create({
    data:{
      name,
      type,
      amount,
      frequency,
      startDate,
      userId
    },
  })
}

export async function deleteBillById(userId: string, billId: string) {
  return prisma.bills.deleteMany({
    where: {
      id: billId,
      userId,
    },
  });
}

export async function deleteRecurringBillById(
  userId: string,
  recurringBillId: string,
) {
  return prisma.recurringBill.deleteMany({
    where: {
      id: recurringBillId,
      userId,
    },
  });
}
