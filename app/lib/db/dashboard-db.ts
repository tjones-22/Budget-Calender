import { prisma } from "./prisma";



export async function getUserBankInfo(userID: string) {
  const userBank = await prisma.bank.findUnique({
    where: {
      userId: userID,
    },
    select: {
      savings: true,
      currentBalance: true,
      lastUpdated: true,
    },
  });

  return userBank;
}
