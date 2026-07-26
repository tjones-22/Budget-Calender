import { getUsersBillsByDayForMonthAction } from "@/app/actions/bill-actions";
import Modal from "@/app/components/Modal";
import SimulationAndAddBill from "@/app/components/SimulationAndAddBill";
import { requireUser } from "@/app/lib/auth/session";
import { parseLocalDate } from "@/app/lib/dates";
import { applyBillSimulation } from "@/app/lib/db/bank-db";

type AddBillModalProps = {
  searchParams: Promise<{
    year?: string;
    month?: string;
    day?: string;
  }>;
};

function getDateValue({
  year,
  month,
  day,
}: {
  year?: string;
  month?: string;
  day?: string;
}) {
  if (!year || !month || !day) {
    return "";
  }

  return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
}

function getRedirectHref({ year, month }: { year?: string; month?: string }) {
  if (!year || !month) {
    return "/dashboard/calender";
  }

  return `/dashboard/calender?year=${year}&month=${month}`;
}

function getCalendarMonth({
  year,
  month,
}: {
  year?: string;
  month?: string;
}) {
  const parsedYear = Number(year);
  const parsedMonth = Number(month);

  if (!parsedYear || !parsedMonth || parsedMonth < 1 || parsedMonth > 12) {
    return new Date();
  }

  return new Date(parsedYear, parsedMonth - 1, 1);
}

export default async function AddBillModal({ searchParams }: AddBillModalProps) {
  const params = await searchParams;
  const dateValue = getDateValue(params);
  const selectedDate = parseLocalDate(dateValue);
  const month = getCalendarMonth(params);
  const user = await requireUser();

  const simulation = selectedDate
    ? await applyBillSimulation(user.id, selectedDate)
    : null;
  const billsByDay = await getUsersBillsByDayForMonthAction(
    month.getFullYear(),
    month.getMonth() + 1,
  );

  return (
    <Modal pathname="/dashboard/add-bill">
      <SimulationAndAddBill
        date={dateValue}
        redirectHref={getRedirectHref(params)}
        projectedBalance={simulation?.projectedBalance}
        projectedSavings={simulation?.projectedSavings}
        month={month}
        billsByDay={billsByDay}
      />
    </Modal>
  );
}
