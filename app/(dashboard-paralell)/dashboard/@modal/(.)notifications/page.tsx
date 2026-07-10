import { getUsersBillsAction } from "@/app/actions/bill-actions";

import Modal from "@/app/components/Modal";
import Notifications from "@/app/components/Notifications";
import { getBillLabel, isBillType } from "@/app/lib/bills";
import type { Bill } from "@/types/types";

export default async function NotificationsModal() {
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
    <Modal pathname="/dashboard/notifications">
      <Notifications bills={notificationBills} />
    </Modal>
  );
}
