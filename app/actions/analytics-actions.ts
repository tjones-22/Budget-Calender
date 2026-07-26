"use server"

import { requireUser } from "../lib/auth/session"
import { parseLocalDate } from "../lib/dates";
import {
    applyBillSimulation,
    applyUnappliedBillsFromMonthStartThroughToday,
} from "../lib/db/bank-db";


// ONLY USE FOR APPLYING TODAYS BILLS
export async function applyBillsForToday(){
    const user = await requireUser();

    await applyUnappliedBillsFromMonthStartThroughToday(user.id);
   
}

export async function applyBillsSimulation(formData:FormData,){
    const user = await requireUser();
    const date = parseLocalDate(String(formData.get("date") ?? ""));
    if(!date){
        throw new Error("Invalid Date");
    }
    
    return await applyBillSimulation(user.id, date);
}
