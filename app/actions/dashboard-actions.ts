"use server";

import { requireUser } from "../lib/auth/session";
import { getUserBankInfo } from "../lib/db/dashboard-db";


// server action for getting savings, current balance, etc.
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
