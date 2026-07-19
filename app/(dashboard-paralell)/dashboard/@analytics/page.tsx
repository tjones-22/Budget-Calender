import { getUserBankInfoAction } from "@/app/actions/bank-actions";
import Analytics from "@/app/components/Analytics";
import Link from "next/link";

export default async function AnalyticsSlot() {
  const usersBankInfo = await getUserBankInfoAction();

  return (
    <Link href="/dashboard/analytics" className="w-full">
      <Analytics
        currentBalance={usersBankInfo?.currentBalance}
        savings={usersBankInfo?.savings}
        compact
      />
    </Link>
  );
}
