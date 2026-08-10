import Link from "next/link";
import { Day } from "@/app/types/types";
import { billTypeDotStyles } from "../lib/bills";

export default function DayCard({
  day,
  className = "",
  dayNumberClassName = "",
  weekdayNameClassName = "",
  weekdayName,
  headerClassName = "",
  href,
  selected = false,
}: {
  day: Day;
  className?: string;
  dayNumberClassName?: string;
  weekdayNameClassName?: string;
  weekdayName?: string;
  headerClassName?: string;
  href?: string;
  selected?: boolean;
}) {
  const weekdayClasses =
    weekdayNameClassName || "text-sm uppercase";
  const dayNumberClasses =
    dayNumberClassName || "text-base sm:text-sm";
  const sizeClasses = className || "max-w-fit";
  const selectedClasses = selected
    ? "border-blue-400 ring-4 ring-blue-500/70 dark:border-blue-400"
    : "border-gray-200 dark:border-gray-700";
  const cardClasses = `flex min-h-fit flex-col rounded-md border bg-white p-4 text-gray-950 dark:bg-black dark:text-white ${selectedClasses} ${href ? "cursor-pointer transition hover:border-blue-500 hover:ring-2 hover:ring-blue-500/30 focus:outline-none focus-visible:border-blue-400 focus-visible:ring-4 focus-visible:ring-blue-500/70 active:border-blue-400 active:ring-4 active:ring-blue-500/70 dark:focus-visible:border-blue-400 dark:active:border-blue-400" : ""} ${sizeClasses}`;
  const uniqueBillTypes = Array.from(
    new Map(day.bills.map((bill) => [bill.type, bill])).values(),
  );
  const cardContent = (
    <>
      <div
        className={`flex flex-col items-center justify-center ${headerClassName}`}
      >
        {weekdayName && (
          <p
            className={`font-semibold text-gray-500 dark:text-gray-400 ${weekdayClasses}`}
          >
            {weekdayName}
          </p>
        )}
        <p className={`font-bold italic ${dayNumberClasses}`}>
          {day.dayNumber}
        </p>
      </div>

      <div className="mt-auto flex w-full flex-row items-center justify-center gap-1">
        {uniqueBillTypes.map((bill) => (
          <span
            key={bill.type}
            title={bill.name}
            className={`size-1.5 shrink-0 rounded-full sm:size-2.5 ${billTypeDotStyles[bill.type]}`}
          />
        ))}
      </div>
    </>
  );

  if (href) {
    return (
      <Link
        href={href}
        className={cardClasses}
      >
        {cardContent}
      </Link>
    );
  }

  return (
    <div className={cardClasses}>{cardContent}</div>
  );
}
