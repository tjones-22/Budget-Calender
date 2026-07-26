import Calender from "./Calender";
import type { Bill } from "@/types/types";
import { formatCurrency } from "../lib/format";
type CalenderSimulationProps = {
  projectedBalance?: number | null;
  projectedSavings?: number | null;
  calendarYear?: number;
  calendarMonth?: number;
  selectedDay?: number;
  billsByDay?: Record<number, Bill[]>;
};

export default function CalenderSimulation({
  projectedBalance,
  projectedSavings,
  calendarYear,
  calendarMonth,
  selectedDay,
  billsByDay,
}: CalenderSimulationProps) {
  const month =
    calendarYear && calendarMonth
      ? new Date(calendarYear, calendarMonth - 1, 1)
      : new Date();

  return (
    <div className="flex w-full flex-col items-center gap-6">
        
      <div className="flex w-full flex-col items-center justify-evenly rounded-lg bg-gray-100 p-4 text-gray-950">
        <h4>Projected Balance: {formatCurrency(projectedBalance) ?? "--"}</h4>
        <h4>Projected Savings: {formatCurrency(projectedSavings) ?? "--"}</h4>
      </div>

      <Calender
        month={month}
        billsByDay={billsByDay}
        selectedDay={selectedDay}
        interactiveDays
        navigationHref="/dashboard/add-bill"
      />
    </div>
  );
}


// TODO: Improve AI categorization and recurring bill detection.
