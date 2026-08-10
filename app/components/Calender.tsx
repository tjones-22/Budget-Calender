import type { Bill, Day } from "@/app/types/types";
import Link from "next/link";
import DayCard from "./Day";
import {
  deleteBillAction,
  deleteRecurringBillAction,
} from "../actions/bill-actions";
import { formatCurrency } from "../lib/format";

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
  selectedDay,
}: {
  month?: Date;
  interactiveDays?: boolean;
  billsByDay?: Record<number, Bill[]>;
  navigationHref?: string;
  selectedDay?: number;
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
  const billsInMonth = Object.entries(billsByDay)
    .flatMap(([dayNumber, bills]) =>
      bills.map((bill) => ({
        ...bill,
        dayNumber: Number(dayNumber),
      })),
    )
    .sort((firstBill, secondBill) => firstBill.dayNumber - secondBill.dayNumber);

  return (
    <section className="mb-[env(safe-area-inset-bottom)] w-full rounded-lg border border-gray-200 bg-white p-2 text-gray-950 dark:border-gray-700 dark:bg-black dark:text-white sm:p-4 ml-1 mt-3">
      <div className="mb-3 flex items-center justify-between gap-2 sm:mb-4 sm:gap-4">
        {navigationHref ? (
          <Link
            href={getMonthHref(previousMonth)}
            className="rounded-md border border-gray-700 px-2 py-1 text-xs font-semibold hover:bg-gray-100 dark:border-gray-300 dark:hover:bg-gray-900 sm:px-3 sm:text-sm"
          >
            Previous
          </Link>
        ) : (
          <span />
        )}

        <h2 className="text-sm font-semibold sm:text-center sm:text-lg">
          {monthName}
        </h2>

        {navigationHref ? (
          <Link
            href={getMonthHref(nextMonth)}
            className="rounded-md border border-gray-700 px-2 py-1 text-xs font-semibold hover:bg-gray-100 dark:border-gray-300 dark:hover:bg-gray-900 sm:px-3 sm:text-sm"
          >
            Next
          </Link>
        ) : (
          <span />
        )}
      </div>

      <div className="flex flex-col gap-6 xl:flex-row xl:items-start">
        <div className="grid flex-1 grid-cols-7 items-start justify-items-center gap-1 sm:gap-x-2 sm:gap-y-3">
          {daysOfWeek.map((day) => (
            <div
              key={day}
              className="w-full text-center text-[0.6rem] font-semibold uppercase text-gray-500 dark:text-gray-400 sm:text-xs"
            >
              {day}
            </div>
          ))}

          {Array.from({ length: firstWeekdayOfMonth }, (_, index) => (
            <div
              key={`empty-start-${index}`}
              aria-hidden="true"
            className="h-12 w-full max-w-10 sm:h-16 sm:max-w-16 md:aspect-square md:h-auto md:max-w-24"
            />
          ))}

          {days.map((day) => (
            <DayCard
              key={day.dayNumber}
              day={day}
              className="h-12 w-full max-w-10 items-center rounded-md p-1 sm:h-16 sm:max-w-16 sm:p-2 md:aspect-square md:h-auto md:max-w-24"
              dayNumberClassName="text-sm sm:text-base"
              selected={selectedDay === day.dayNumber}
              href={
                interactiveDays
                  ? `/dashboard/add-bill?year=${year}&month=${monthIndex + 1}&day=${day.dayNumber}`
                  : undefined
              }
            />
          ))}
        </div>

        {interactiveDays && billsInMonth.length > 0 ? (
          <aside className="rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-950 xl:w-80 xl:shrink-0">
            <h3 className="text-sm font-semibold uppercase text-gray-500 dark:text-gray-400">
              Bills this month
            </h3>

            <div className="mt-3 space-y-2">
              {billsInMonth.map((bill, index) => {
                const deleteAction =
                  bill.isRecurring && bill.recurringBillId
                    ? deleteRecurringBillAction.bind(null, bill.recurringBillId)
                    : bill.id
                      ? deleteBillAction.bind(null, bill.id)
                      : null;

                return (
                  <div
                    key={`${bill.id ?? bill.recurringBillId ?? bill.name}-${bill.dayNumber}-${index}`}
                    className="flex items-center justify-between gap-3 rounded-md border border-gray-200 bg-white p-3 text-sm dark:border-gray-700 dark:bg-black"
                  >
                    <div>
                      <p className="font-semibold">
                        {bill.name}{" "}
                        {bill.isRecurring ? (
                          <span className="text-xs font-normal text-blue-500">
                            recurring
                          </span>
                        ) : null}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Day {bill.dayNumber}
                        {typeof bill.amount === "number"
                          ? ` • ${formatCurrency(bill.amount)}`
                          : ""}
                      </p>
                    </div>

                    {deleteAction ? (
                      <form action={deleteAction}>
                        <button
                          type="submit"
                          className="rounded-md bg-red-700 px-3 py-1 text-xs font-semibold text-white hover:bg-red-800"
                        >
                          {bill.isRecurring ? "Delete recurring" : "Delete"}
                        </button>
                      </form>
                    ) : null}
                  </div>
                );
              })}
            </div>
          </aside>
        ) : null}
      </div>
    </section>
  );
}
