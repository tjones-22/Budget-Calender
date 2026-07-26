"use client";

import { MouseEvent, useState } from "react";
import { AddBill } from "./AddBill";
import CalenderSimulation from "./CalenderSimulation";
import type { Bill } from "@/types/types";

type SimulationAndAddBillProps = {
  date?: string;
  redirectHref?: string;
  projectedBalance?: number | null;
  projectedSavings?: number | null;
  calendarYear?: number;
  calendarMonth?: number;
  selectedDay?: number;
  billsByDay?: Record<number, Bill[]>;
};

export default function SimulationAndAddBill({
  date,
  redirectHref,
  projectedBalance,
  projectedSavings,
  calendarYear,
  calendarMonth,
  selectedDay,
  billsByDay,
}: SimulationAndAddBillProps) {
  const [showForm, setShowForm] = useState(false);
  const [loadingSimulationDate, setLoadingSimulationDate] = useState<
    string | null
  >(null);
  const isLoadingSimulation =
    Boolean(loadingSimulationDate) && loadingSimulationDate !== date;

  function handleSimulationClick(event: MouseEvent<HTMLDivElement>) {
    const clickedLink = (event.target as HTMLElement).closest("a");

    if (!clickedLink) {
      return;
    }

    const href = clickedLink.getAttribute("href");

    if (href?.startsWith("/dashboard/add-bill")) {
      const targetUrl = new URL(href, window.location.origin);
      const year = targetUrl.searchParams.get("year");
      const month = targetUrl.searchParams.get("month");
      const day = targetUrl.searchParams.get("day");

      if (!year || !month || !day) {
        return;
      }

      setLoadingSimulationDate(
        `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`,
      );
    }
  }

  if (showForm) {
    return (
      <div className="space-y-4">
        <button
          type="button"
          onClick={() => setShowForm(false)}
          className="rounded-md border border-gray-300 px-3 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-100"
        >
          Back to simulation
        </button>

        <AddBill date={date} redirectHref={redirectHref} />
      </div>
    );
  }

  return (
    <div className="space-y-6" onClickCapture={handleSimulationClick}>
      {isLoadingSimulation ? (
        <div className="px-4 py-2 text-center text-sm font-semibold text-blue-900">
          Loading simulation...
        </div>
      ) : null}

      <CalenderSimulation
        projectedBalance={projectedBalance}
        projectedSavings={projectedSavings}
        calendarYear={calendarYear}
        calendarMonth={calendarMonth}
        selectedDay={selectedDay}
        billsByDay={billsByDay}
      />

      <button
        type="button"
        onClick={() => setShowForm(true)}
        className="w-full rounded-md bg-blue-950 px-4 py-2 font-semibold text-yellow-300 hover:bg-blue-900"
      >
        Add a Bill
      </button>
    </div>
  );
}

