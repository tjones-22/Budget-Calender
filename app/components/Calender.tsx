import type { Bill, Day } from "../../types/types";
import Link from "next/link";
import DayCard from "./Day";

const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function getDaysInMonth(
  month: Date,
  billsByDay: Record<number, Bill[]>,
): Day[] {
  const year = month.getFullYear();
  const monthIndex = month.getMonth();
  const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();

  return Array.from({ length: daysInMonth }, (_, index) => ({
    dayNumber: index + 1,
    bills: billsByDay[index + 1] ?? [],
  }));
}

export default function Calender({
  month = new Date(),
  interactiveDays = false,
  billsByDay = {},
  navigationHref,
}: {
  month?: Date;
  interactiveDays?: boolean;
  billsByDay?: Record<number, Bill[]>;
  navigationHref?: string;
}) {
  const days = getDaysInMonth(month, billsByDay);
  const year = month.getFullYear();
  const monthIndex = month.getMonth();
  const firstWeekdayOfMonth = new Date(year, monthIndex, 1).getDay();
  const previousMonth = new Date(year, monthIndex - 1, 1);
  const nextMonth = new Date(year, monthIndex + 1, 1);
  const getMonthHref = (date: Date) =>
    `${navigationHref}?year=${date.getFullYear()}&month=${date.getMonth() + 1}`;
  const monthName = month.toLocaleString("default", {
    month: "long",
    year: "numeric",
  });

  return (
    <section className="min-w-3/4  rounded-lg border border-gray-200 bg-white p-4 text-gray-950 dark:border-gray-700 dark:bg-black dark:text-white ml-1 mt-3">
      <div className="mb-4 flex items-center justify-between gap-4">
        {navigationHref ? (
          <Link
            href={getMonthHref(previousMonth)}
            className="rounded-md border border-gray-700 px-3 py-1 text-sm font-semibold hover:bg-gray-100 dark:border-gray-300 dark:hover:bg-gray-900"
          >
            Previous
          </Link>
        ) : (
          <span />
        )}

        <h2 className="text-lg font-semibold sm:text-center">{monthName}</h2>

        {navigationHref ? (
          <Link
            href={getMonthHref(nextMonth)}
            className="rounded-md border border-gray-700 px-3 py-1 text-sm font-semibold hover:bg-gray-100 dark:border-gray-300 dark:hover:bg-gray-900"
          >
            Next
          </Link>
        ) : (
          <span />
        )}
      </div>

      <div className="grid grid-cols-7 justify-items-center gap-x-2 gap-y-3">
        {daysOfWeek.map((day) => (
          <div
            key={day}
            className="w-full text-center text-xs font-semibold uppercase text-gray-500 dark:text-gray-400"
          >
            {day}
          </div>
        ))}

        {Array.from({ length: firstWeekdayOfMonth }, (_, index) => (
          <div
            key={`empty-start-${index}`}
            aria-hidden="true"
            className="aspect-square w-full max-w-24"
          />
        ))}

        {days.map((day) => (
          <DayCard
            key={day.dayNumber}
            day={day}
            className="aspect-square w-full max-w-24 items-center"
            href={
              interactiveDays
                ? `/dashboard/add-bill?year=${year}&month=${monthIndex + 1}&day=${day.dayNumber}`
                : undefined
            }
          />
        ))}
      </div>
    </section>
  );
}
