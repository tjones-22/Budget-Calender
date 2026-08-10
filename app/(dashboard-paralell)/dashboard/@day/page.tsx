import { getUsersBillsAction } from "@/app/actions/bill-actions";
import DayCard from "@/app/components/Day";
import { getBillLabel, isBillType } from "@/app/lib/bills";
import type { Bill, Day } from "@/app/types/types";
import Link from "next/link";

export default async function DaySlot() {
  const usersBills = await getUsersBillsAction();
  const today = new Date();
  const weekdayName = today.toLocaleDateString("en-US", {
    weekday: "long",
  });

  const dayBills: Bill[] = usersBills.flatMap((bill) => {
    if (!isBillType(bill.type)) {
      return [];
    }

    return [
      {
        type: bill.type,
        name: getBillLabel(bill.type),
      },
    ];
  });

  const todayCard: Day = {
    dayNumber: today.getDate(),
    bills: dayBills,
  };

  return (
    <Link href="/dashboard/calender" className="mb-4 block w-full">
      <DayCard
        day={todayCard}
        weekdayName={weekdayName}
        weekdayNameClassName="text-2xl normal-case"
        dayNumberClassName="text-6xl"
        headerClassName="flex-col gap-4"
        className="h-56 w-full max-w-full justify-between"
      />
    </Link>
  );
}
