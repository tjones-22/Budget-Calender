import { getUsersBillsByDayForMonthAction } from "@/app/actions/bill-actions";
import Calender from "@/app/components/Calender";
import Loader from "@/app/components/Loader";
import Link from "next/link";
import { Suspense } from "react";

type CalenderPageProps = {
  searchParams: Promise<{
    year?: string;
    month?: string;
  }>;
};

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

export default async function CalenderPage({ searchParams }: CalenderPageProps){
    const params = await searchParams;
    const month = getCalendarMonth(params);
    const calendarKey = `${month.getFullYear()}-${month.getMonth() + 1}`;

    return(
        <>
        <Link href={"/dashboard"} className=" text-yellow-300 text-xl mb-25 hover:text-yellow-500 hover:tracking-wider hover-animation-timing">
        Back to Dashboard
      </Link>
        <Suspense key={calendarKey} fallback={<Loader />}>
          <CalendarContent month={month} />
        </Suspense>
        </>
    );
}

async function CalendarContent({ month }: { month: Date }) {
  const billsByDay = await getUsersBillsByDayForMonthAction(
    month.getFullYear(),
    month.getMonth() + 1,
  );

  return (
    <Calender
      month={month}
      billsByDay={billsByDay}
      interactiveDays
      navigationHref="/dashboard/calender"
    />
  );
}
