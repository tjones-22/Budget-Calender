import { getUsersBillsAction } from "@/app/actions/bill-actions";
import Notifications from "@/app/components/Notifications";
import { getBillLabel, isBillType } from "@/app/lib/bills";
import type { Bill } from "@/types/types";
import Link from "next/link";

export default async function NotificationsSlot() {
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
    <Link href="/dashboard/notifications">
      <Notifications bills={notificationBills} />
    </Link>
  );
}
