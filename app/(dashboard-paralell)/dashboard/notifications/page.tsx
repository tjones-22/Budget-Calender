import Notifications from "@/app/components/Notifications";
import { getUsersBillsAction } from "@/app/actions/bill-actions";
import { getBillLabel, isBillType } from "@/app/lib/bills";

import type { Bill } from "@/types/types";
import Link from "next/link";

export default async function NotificationsPage() {
  const bills = await getUsersBillsAction();

  const notificationBills: Bill[] = bills.flatMap((bill) => {
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

  return (
    <>
      <Link href={"/dashboard"} className=" text-yellow-300 text-xl mb-5 hover:text-yellow-500 hover:tracking-wider hover-animation-timing">
        Back to Dashboard
      </Link>

      <div className="mt-10">
        <Notifications bills={notificationBills} />
      </div>

      
    </>
  );
}
