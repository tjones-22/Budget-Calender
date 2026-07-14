import Notifications from "@/app/components/Notifications";
import Link from "next/link";

export default async function NotificationsPage() {
  return (
    <>
      <Link href={"/dashboard"} className=" text-yellow-300 text-xl mb-5 hover:text-yellow-500 hover:tracking-wider hover-animation-timing">
        Back to Dashboard
      </Link>

      <div className="mt-10">
        <Notifications />
      </div>

      
    </>
  );
}
