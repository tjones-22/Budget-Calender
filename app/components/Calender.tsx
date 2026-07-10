import type { Bill, Day } from "../../types/types";
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
}: {
  month?: Date;
  interactiveDays?: boolean;
  billsByDay?: Record<number, Bill[]>;
}) {
  const days = getDaysInMonth(month, billsByDay);
  const year = month.getFullYear();
  const monthIndex = month.getMonth();
  const monthName = month.toLocaleString("default", {
    month: "long",
    year: "numeric",
  });

  return (
    <section className="min-w-3/4  rounded-lg border border-gray-200 bg-white p-4 text-gray-950 dark:border-gray-700 dark:bg-black dark:text-white ml-1 mt-3">
      <h2 className="mb-4 text-lg font-semibold sm:text-center">{monthName}</h2>

      <div className="grid grid-cols-7 justify-items-center gap-x-2 gap-y-3">
        {daysOfWeek.map((day) => (
          <div
            key={day}
            className="w-full text-center text-xs font-semibold uppercase text-gray-500 dark:text-gray-400"
          >
            {day}
          </div>
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
