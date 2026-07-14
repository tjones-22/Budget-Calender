import Notifications from "@/app/components/Notifications";
import Link from "next/link";

export default async function NotificationsSlot() {
  return (
    <div className="space-y-2">
      <Link
        href="/dashboard/notifications"
        className="inline-block text-sm font-semibold text-yellow-300 hover:text-yellow-500"
      >
        View notifications
      </Link>
      <Notifications />
    </div>
  );
}
