import { prisma } from "./prisma";
import { AddBillInput } from "@/types/types";
import { getCurrentWeekRange, getDayRange, getMonthRange, getTodayRange } from "../dates";

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

export async function getBillsByUserForMonth(
  userID: string,
  year: number,
  month: number,
) {
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
      name: true,
      type: true,
      date: true,
      amount: true,
    },
  });

  return userBills;
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
