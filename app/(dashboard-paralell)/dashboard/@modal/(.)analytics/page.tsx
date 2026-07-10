import { getUserBankInfoAction } from "@/app/actions/dashboard-actions";
import Analytics from "@/app/components/Analytics";
import Modal from "@/app/components/Modal";

export default async function AnalyticsModal() {
  const usersBankInfo = await getUserBankInfoAction();

  return (
    <Modal pathname="/dashboard/analytics">
      <Analytics
        currentBalance={usersBankInfo?.currentBalance}
        savings={usersBankInfo?.savings}
      />
    </Modal>
  );
}
