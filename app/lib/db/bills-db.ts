import {prisma} from "./prisma";
import { AddBillInput } from "@/types/types";

// get a user's bills
export async function getBillsByUser(userID: string) {
  const now = new Date();

  const startOfToday = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
  );

  const startOfTomorrow = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate() + 1,
  );

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

export async function getBillsByUserForMonth(
  userID: string,
  year: number,
  month: number,
) {
  const startOfMonth = new Date(year, month - 1, 1);
  const startOfNextMonth = new Date(year, month, 1);

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
    },
  });

  return userBills;
}

export async function AddBill({
    name,
    type,
    date,
    userId
}: AddBillInput ){

    
    return await prisma.bills.create({
        data:{
            name,
            type,
            date,
            userId, 
        },
        select:{
            id:true,
            name:true,
            type:true,
            date:true
        }
    });
}
