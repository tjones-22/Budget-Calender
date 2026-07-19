import Notifications from "@/app/components/Notifications";
import Link from "next/link";

export default async function NotificationsSlot() {
  return (
    <Link href="/dashboard/notifications" className="block">
      <Notifications showDeleteActions={false} />
    </Link>
  );
}
