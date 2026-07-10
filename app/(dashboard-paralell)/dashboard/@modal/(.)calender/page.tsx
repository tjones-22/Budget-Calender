import { getUsersBillsByDayForMonthAction } from "@/app/actions/bill-actions";
import Calender from "@/app/components/Calender";
import Modal from "@/app/components/Modal";

export default async function CalenderModal() {
  const month = new Date();
  const billsByDay = await getUsersBillsByDayForMonthAction(
    month.getFullYear(),
    month.getMonth() + 1,
  );

  return (
    <Modal pathname="/dashboard/calender">
      <Calender month={month} billsByDay={billsByDay} interactiveDays />
    </Modal>
  );
}
