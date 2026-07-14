import Modal from "@/app/components/Modal";
import Notifications from "@/app/components/Notifications";

export default async function NotificationsModal() {
  return (
    <Modal pathname="/dashboard/notifications">
      <Notifications />
    </Modal>
  );
}
