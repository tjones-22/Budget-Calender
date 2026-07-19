"use server"

import { requireUser } from "../lib/auth/session"
import { getStartOfDay } from "../lib/dates";
import { applyBillsForTheDay } from "../lib/db/bank-db";

export async function applyBillsForToday( day?:Date){
    const user = await requireUser();
    const today = getStartOfDay();

    

    await applyBillsForTheDay(user.id, day ?? today);
   
}