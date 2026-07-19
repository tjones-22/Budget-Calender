import { getUserBankInfoAction } from "@/app/actions/bank-actions";
import Analytics from "@/app/components/Analytics";
import Link from "next/link";
export default async function AnalyticsPage() {
  const usersBankInfo = await getUserBankInfoAction();

  return (
    <>
      <Link href={"/dashboard"} className=" text-yellow-300 text-xl  mb-5  hover:text-yellow-500 hover:tracking-wider hover-animation-timing">
        Back to Dashboard
      </Link>

      <div className="mt-10">

         <Analytics
        currentBalance={usersBankInfo?.currentBalance}
        savings={usersBankInfo?.savings}
      />
      </div>
     
    </>
  );
}
