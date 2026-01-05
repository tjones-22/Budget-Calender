"use client";

import { useMemo, useState } from "react";

type CalendarDay = {
  date: string;
  bills: { name: string; amount: number; recurringId?: string }[];
  paydays: { name: string; amount: number; recurringId?: string }[];
  purchases: { name: string; amount: number; recurringId?: string }[];
  savings: { name: string; amount: number; recurringId?: string }[];
  isCurrentMonth: boolean;
  isToday: boolean;
};

type CalendarViewProps = {
  month: number;
  year: number;
  username: string;
  initialFunds: number;
  initialSavings: number;
  matrix: CalendarDay[][];
};

type PurchaseItem = { name: string; amount: number; recurringId?: string };
type AmountItem = { name: string; amount: number; recurringId?: string };

const emptyAmount = "";
const emptyMonths = "";
const defaultCadence = "weekly";

const cadenceOptions = [
  { value: "weekly", label: "Weekly" },
  { value: "biweekly", label: "Biweekly" },
  { value: "monthly", label: "Monthly" },
] as const;

const monthLabel = (year: number, month: number) =>
  Number.isFinite(year) && Number.isFinite(month)
    ? new Date(year, month - 1, 1).toLocaleString("default", { month: "long" })
    : "Invalid Date";

const CalendarView = ({
  month,
  year,
  username,
  initialFunds,
  initialSavings,
  matrix,
}: CalendarViewProps) => {
  const [activeMonth, setActiveMonth] = useState(Number(month));
  const [activeYear, setActiveYear] = useState(Number(year));
  const [activeMatrix, setActiveMatrix] = useState(matrix);
  const [selectedDay, setSelectedDay] = useState<CalendarDay | null>(null);
  const [bills, setBills] = useState<AmountItem[]>([]);
  const [paydays, setPaydays] = useState<AmountItem[]>([]);
  const [purchases, setPurchases] = useState<PurchaseItem[]>([]);
  const [savings, setSavings] = useState<AmountItem[]>([]);
  const [newType, setNewType] = useState("bill");
  const [newLabel, setNewLabel] = useState("");
  const [newAmount, setNewAmount] = useState(emptyAmount);
  const [isRecurring, setIsRecurring] = useState(false);
  const [recurrenceCadence, setRecurrenceCadence] = useState(defaultCadence);
  const [recurrenceMode, setRecurrenceMode] = useState<"months" | "forever">(
    "months",
  );
  const [recurrenceMonths, setRecurrenceMonths] = useState(emptyMonths);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");

  const flatDays = useMemo(() => activeMatrix.flat(), [activeMatrix]);
  const activeDay = useMemo(() => {
    if (selectedDay) {
      return selectedDay;
    }
    return flatDays.find((day) => day.isToday) ?? flatDays.find((day) => day.isCurrentMonth) ?? null;
  }, [flatDays, selectedDay]);

  const currentFunds = useMemo(() => {
    const reference = selectedDay ? new Date(`${selectedDay.date}T00:00:00`) : new Date();
    const days = activeMatrix.flat();
    const dayTime = (date: string) => new Date(`${date}T00:00:00`).getTime();
    const monthStart = new Date(activeYear, activeMonth - 1, 1).getTime();
    const firstPayday = days
      .filter((day) => day.paydays.length > 0)
      .map((day) => ({
        time: dayTime(day.date),
        amount: day.paydays.reduce((sum, payday) => sum + payday.amount, 0),
      }))
      .filter((payday) => payday.time >= monthStart)
      .sort((a, b) => a.time - b.time)[0];

    if (!firstPayday) {
      return initialFunds;
    }
    if (reference.getTime() < firstPayday.time) {
      return 0;
    }

    const totals = days.reduce(
      (acc, day) => {
        const currentTime = dayTime(day.date);
        if (currentTime < firstPayday.time || currentTime > reference.getTime()) {
          return acc;
        }
        return {
          paydays: acc.paydays + day.paydays.reduce((sum, payday) => sum + payday.amount, 0),
          bills: acc.bills + day.bills.reduce((sum, bill) => sum + bill.amount, 0),
          purchases:
            acc.purchases +
            day.purchases.reduce((sum, purchase) => sum + purchase.amount, 0),
          savings:
            acc.savings +
            day.savings.reduce((sum, entry) => sum + entry.amount, 0),
        };
      },
      { paydays: 0, bills: 0, purchases: 0, savings: 0 },
    );

    return totals.paydays - totals.bills - totals.purchases - totals.savings;
  }, [activeMatrix, activeMonth, activeYear, initialFunds, selectedDay]);

  const savingsBalance = useMemo(() => {
    const reference = selectedDay ? new Date(`${selectedDay.date}T00:00:00`) : new Date();
    const days = activeMatrix.flat();
    const totalSavings = days.reduce((sum, day) => {
      const currentTime = new Date(`${day.date}T00:00:00`).getTime();
      if (currentTime > reference.getTime()) {
        return sum;
      }
      return sum + day.savings.reduce((inner, entry) => inner + entry.amount, 0);
    }, 0);
    return initialSavings + totalSavings;
  }, [activeMatrix, initialSavings, selectedDay]);

  const analytics = useMemo(() => {
    const currentMonthDays = activeMatrix.flat().filter((day) => day.isCurrentMonth);
    const totalBills = currentMonthDays.reduce(
      (sum, day) => sum + day.bills.reduce((inner, bill) => inner + bill.amount, 0),
      0,
    );
    const totalPaydays = currentMonthDays.reduce(
      (sum, day) =>
        sum + day.paydays.reduce((inner, payday) => inner + payday.amount, 0),
      0,
    );
    const totalPurchases = currentMonthDays.reduce(
      (sum, day) =>
        sum + day.purchases.reduce((inner, purchase) => inner + purchase.amount, 0),
      0,
    );
    const totalSavings = currentMonthDays.reduce(
      (sum, day) =>
        sum + day.savings.reduce((inner, entry) => inner + entry.amount, 0),
      0,
    );
    const leftoverBeforePurchases = initialFunds + totalPaydays - totalBills;
    const endOfMonthFunds = leftoverBeforePurchases - totalPurchases - totalSavings;
    return {
      totalBills,
      totalPaydays,
      totalPurchases,
      totalSavings,
      leftoverBeforePurchases,
      endOfMonthFunds,
    };
  }, [activeMatrix, initialFunds]);

  const betweenPaydays = useMemo(() => {
    const reference = selectedDay ? new Date(`${selectedDay.date}T00:00:00`) : new Date();
    const days = activeMatrix.flat();
    const paydayDates = days
      .filter((day) => day.paydays.length > 0)
      .map((day) => ({
        date: day.date,
        time: new Date(`${day.date}T00:00:00`).getTime(),
        amount: day.paydays.reduce((sum, payday) => sum + payday.amount, 0),
      }))
      .sort((a, b) => a.time - b.time);

    const nextPayday = paydayDates.find((payday) => payday.time > reference.getTime()) ?? null;
    if (!nextPayday) {
      return null;
    }

    const windowStart = selectedDay
      ? new Date(`${selectedDay.date}T00:00:00`).getTime() + 24 * 60 * 60 * 1000
      : reference.getTime();
    const windowEnd = nextPayday.time;

    const totalsUntilNext = days.reduce(
      (acc, day) => {
        const dayTime = new Date(`${day.date}T00:00:00`).getTime();
        if (dayTime < windowStart || dayTime >= windowEnd) {
          return acc;
        }
        return {
          bills: acc.bills + day.bills.reduce((sum, bill) => sum + bill.amount, 0),
          purchases:
            acc.purchases +
            day.purchases.reduce((sum, purchase) => sum + purchase.amount, 0),
          savings:
            acc.savings + day.savings.reduce((sum, entry) => sum + entry.amount, 0),
        };
      },
      { bills: 0, purchases: 0, savings: 0 },
    );

    const projectedBalance =
      currentFunds -
      totalsUntilNext.bills -
      totalsUntilNext.purchases -
      totalsUntilNext.savings +
      nextPayday.amount;

    return {
      nextPaydayDate: nextPayday.date,
      nextPaydayAmount: nextPayday.amount,
      billsUntilNext: totalsUntilNext.bills,
      purchasesUntilNext: totalsUntilNext.purchases,
      savingsUntilNext: totalsUntilNext.savings,
      projectedBalance,
    };
  }, [activeMatrix, currentFunds, selectedDay]);

  const openEditor = (day: CalendarDay) => {
    if (!day.isCurrentMonth) {
      return;
    }
    setSelectedDay(day);
    setBills(day.bills);
    setPaydays(day.paydays);
    setPurchases(day.purchases);
    setSavings(day.savings);
    setNewType("bill");
    setNewLabel("");
    setNewAmount(emptyAmount);
    setIsRecurring(false);
    setRecurrenceCadence(defaultCadence);
    setRecurrenceMode("months");
    setRecurrenceMonths(emptyMonths);
    setError("");
  };

  const closeEditor = () => {
    setSelectedDay(null);
    setError("");
  };

  const applyDayUpdate = (
    date: string,
    nextBills: AmountItem[],
    nextPaydays: AmountItem[],
    nextPurchases: PurchaseItem[],
    nextSavings: AmountItem[],
  ) => {
    setActiveMatrix((prev) =>
      prev.map((row) =>
        row.map((cell) =>
          cell.date === date
              ? {
                  ...cell,
                  bills: nextBills,
                  paydays: nextPaydays,
                  purchases: nextPurchases,
                  savings: nextSavings,
                }
              : cell,
        ),
      ),
    );
    if (selectedDay?.date === date) {
      setSelectedDay((prev) =>
        prev
          ? {
              ...prev,
              bills: nextBills,
              paydays: nextPaydays,
              purchases: nextPurchases,
              savings: nextSavings,
            }
          : prev,
      );
      setBills(nextBills);
      setPaydays(nextPaydays);
      setPurchases(nextPurchases);
      setSavings(nextSavings);
    }
  };

  const addEvent = async () => {
    const label = newLabel.trim();
    if (!label) {
      setError("Please enter a label.");
      return;
    }

    const amount = Number(newAmount);
    if (!Number.isFinite(amount)) {
      setError("Please enter a valid amount.");
      return;
    }

    if (isRecurring) {
      if (!selectedDay) {
        setError("Please select a date first.");
        return;
      }
      if (recurrenceMode === "months") {
        const monthsValue = Number(recurrenceMonths);
        if (!Number.isInteger(monthsValue) || monthsValue <= 0) {
          setError("Enter a valid number of months.");
          return;
        }
      }
      setIsSaving(true);
      setError("");
      try {
        const response = await fetch("http://localhost:3001/api/calendar/recurring", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            date: selectedDay.date,
            type: newType,
            name: label,
            amount,
            cadence: recurrenceCadence,
            monthsCount: recurrenceMode === "months" ? Number(recurrenceMonths) : undefined,
            forever: recurrenceMode === "forever",
          }),
        });
        if (!response.ok) {
          setError(`Error: ${response.statusText}`);
          return;
        }
        await loadMonth(activeYear, activeMonth, selectedDay.date);
        setNewLabel("");
        setNewAmount(emptyAmount);
        setIsRecurring(false);
        setRecurrenceCadence(defaultCadence);
        setRecurrenceMode("months");
        setRecurrenceMonths(emptyMonths);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Network error");
      } finally {
        setIsSaving(false);
      }
      return;
    }

    if (newType === "bill") {
      setBills((prev) => [...prev, { name: label, amount }]);
    } else if (newType === "payday") {
      setPaydays((prev) => [...prev, { name: label, amount }]);
    } else if (newType === "purchase") {
      setPurchases((prev) => [...prev, { name: label, amount }]);
    } else {
      setSavings((prev) => [...prev, { name: label, amount }]);
    }

    setNewLabel("");
    setNewAmount(emptyAmount);
    setError("");
  };

  const persistDay = async (
    date: string,
    nextBills: AmountItem[],
    nextPaydays: AmountItem[],
    nextPurchases: PurchaseItem[],
    nextSavings: AmountItem[],
  ) => {
    const stripRecurring = <T extends { name: string; amount: number; recurringId?: string }>(
      items: T[],
    ) =>
      items
        .filter((item) => !item.recurringId)
        .map((item) => ({ name: item.name, amount: item.amount }));
    setIsSaving(true);
    setError("");
    try {
      const response = await fetch("http://localhost:3001/api/calendar/day", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          date,
          bills: stripRecurring(nextBills),
          paydays: stripRecurring(nextPaydays),
          purchases: stripRecurring(nextPurchases),
          savings: stripRecurring(nextSavings),
        }),
      });
      if (!response.ok) {
        setError(`Error: ${response.statusText}`);
        return false;
      }
      applyDayUpdate(date, nextBills, nextPaydays, nextPurchases, nextSavings);
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Network error");
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  const saveDay = async () => {
    if (!selectedDay) {
      return;
    }
    const saved = await persistDay(selectedDay.date, bills, paydays, purchases, savings);
    if (saved) {
      closeEditor();
    }
  };

  const deleteEvent = async (
    date: string,
    type: "bill" | "payday" | "purchase" | "savings",
    index: number,
  ) => {
    const day = activeMatrix.flat().find((item) => item.date === date);
    if (!day) {
      return;
    }
    const nextBills = [...day.bills];
    const nextPaydays = [...day.paydays];
    const nextPurchases = [...day.purchases];
    const nextSavings = [...day.savings];

    if (type === "bill") {
      nextBills.splice(index, 1);
    } else if (type === "payday") {
      nextPaydays.splice(index, 1);
    } else if (type === "purchase") {
      nextPurchases.splice(index, 1);
    } else {
      nextSavings.splice(index, 1);
    }

    await persistDay(date, nextBills, nextPaydays, nextPurchases, nextSavings);
  };

  const deleteRecurring = async (
    recurringId: string,
    date: string,
    scope: "one" | "all",
  ) => {
    setIsSaving(true);
    setError("");
    try {
      const response = await fetch(
        "http://localhost:3001/api/calendar/recurring/delete",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ recurringId, date, scope }),
        },
      );
      if (!response.ok) {
        setError(`Error: ${response.statusText}`);
        return;
      }
      await loadMonth(activeYear, activeMonth, date);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Network error");
    } finally {
      setIsSaving(false);
    }
  };

  const loadMonth = async (
    yearValue: number,
    monthValue: number,
    selectedDate?: string,
  ) => {
    try {
      const response = await fetch(
        `http://localhost:3001/api/calendar?year=${yearValue}&month=${monthValue}`,
      );
      if (!response.ok) {
        setError(`Error: ${response.statusText}`);
        return;
      }
      const data = (await response.json()) as {
        year: number;
        month: number;
        matrix: CalendarDay[][];
      };
      const parsedYear = Number(data.year);
      const parsedMonth = Number(data.month);
      if (!Number.isFinite(parsedYear) || !Number.isFinite(parsedMonth)) {
        setError("Invalid calendar data.");
        return;
      }
      setActiveYear(parsedYear);
      setActiveMonth(parsedMonth);
      setActiveMatrix(data.matrix);
      if (selectedDate) {
        const nextSelected =
          data.matrix.flat().find((day) => day.date === selectedDate) ?? null;
        setSelectedDay(nextSelected);
        setBills(nextSelected?.bills ?? []);
        setPaydays(nextSelected?.paydays ?? []);
        setPurchases(nextSelected?.purchases ?? []);
        setSavings(nextSelected?.savings ?? []);
      } else {
        setSelectedDay(null);
        setBills([]);
        setPaydays([]);
        setPurchases([]);
        setSavings([]);
      }
      setError("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Network error");
    }
  };

  const goPrevMonth = () => {
    const nextMonth = activeMonth === 1 ? 12 : activeMonth - 1;
    const nextYear = activeMonth === 1 ? activeYear - 1 : activeYear;
    loadMonth(nextYear, nextMonth);
  };

  const goNextMonth = () => {
    const nextMonth = activeMonth === 12 ? 1 : activeMonth + 1;
    const nextYear = activeMonth === 12 ? activeYear + 1 : activeYear;
    loadMonth(nextYear, nextMonth);
  };

  return (
    <section className="w-full max-w-6xl rounded-3xl border border-slate-200 bg-white p-6 shadow-xl">
      <div className="flex items-center justify-between pb-4">
        <div className="flex items-center gap-3">
          <button
            type="button"
            className="rounded-full border border-slate-200 px-3 py-1 text-sm text-slate-600 hover:border-slate-400 hover:text-slate-900"
            onClick={goPrevMonth}
          >
            Prev
          </button>
          <h2 className="text-xl font-semibold text-slate-900">
            {monthLabel(activeYear, activeMonth)} {activeYear}
          </h2>
          <button
            type="button"
            className="rounded-full border border-slate-200 px-3 py-1 text-sm text-slate-600 hover:border-slate-400 hover:text-slate-900"
            onClick={goNextMonth}
          >
            Next
          </button>
        </div>
        <span className="text-sm text-slate-500">{username}</span>
      </div>
      {error && (
        <p className="mb-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">
          {error}
        </p>
      )}
      <div className="mt-3 grid grid-cols-1 gap-6 md:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <div>
          <div className="grid grid-cols-7 gap-2 text-center text-xs font-semibold uppercase text-slate-500">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((label) => (
              <span key={label}>{label}</span>
            ))}
          </div>
          <div className="mt-3 grid grid-cols-7 gap-2 text-center text-sm">
            {flatDays.map((cell, index) => (
              <button
                key={`${cell.date}-${index}`}
                type="button"
                onClick={() => openEditor(cell)}
                className={`h-12 rounded-xl border border-slate-200 p-1 text-left transition ${
                  cell.isCurrentMonth
                    ? "bg-slate-50 text-slate-800 hover:border-slate-400"
                    : "bg-transparent text-slate-400 cursor-not-allowed"
                } ${
                  cell.isToday
                    ? "bg-slate-900 text-white border-slate-900"
                    : ""
                }`}
              >
                <div className="text-xs">{cell.date.split("-")[2]}</div>
                <div className="mt-1 flex flex-wrap gap-1">
                  {cell.bills.length > 0 && (
                    <span className="h-2 w-2 rounded-full bg-red-500" />
                  )}
                  {cell.paydays.length > 0 && (
                    <span className="h-2 w-2 rounded-full bg-green-500" />
                  )}
                  {cell.purchases.length > 0 && (
                    <span className="h-2 w-2 rounded-full bg-blue-500" />
                  )}
                  {cell.savings.length > 0 && (
                    <span className="h-2 w-2 rounded-full bg-amber-500" />
                  )}
                </div>
              </button>
            ))}
          </div>
          {selectedDay && (
            <div className="mt-6 w-full rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <h3 className="text-base font-semibold text-slate-900">
                Adding Events
              </h3>
              <div className="mt-2 flex items-center justify-between">
                <h4 className="text-lg font-semibold text-slate-900">
                  Edit {selectedDay.date}
                </h4>
                <button
                  type="button"
                  className="text-sm text-slate-500 hover:text-slate-900"
                  onClick={closeEditor}
                >
                  Close
                </button>
              </div>
              <div className="mt-4 grid gap-3">
                <div className="rounded-xl border border-slate-200 bg-white p-3">
                  <div className="flex flex-wrap gap-2">
                    <select
                      className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700"
                      value={newType}
                      onChange={(event) => setNewType(event.target.value)}
                    >
                      <option value="bill">Bill</option>
                      <option value="payday">Payday</option>
                      <option value="purchase">Purchase</option>
                      <option value="savings">Move to Savings</option>
                    </select>
                    <input
                      className="min-w-[160px] flex-1 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900"
                      value={newLabel}
                      onChange={(event) => setNewLabel(event.target.value)}
                      placeholder="Label"
                    />
                    <input
                      className="w-32 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900"
                      value={newAmount}
                      onChange={(event) => setNewAmount(event.target.value)}
                      placeholder="Amount"
                      inputMode="decimal"
                    />
                    <label className="flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700">
                      <input
                        type="checkbox"
                        checked={isRecurring}
                        onChange={(event) => setIsRecurring(event.target.checked)}
                      />
                      Recurring
                    </label>
                    <button
                      type="button"
                      className="rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
                      onClick={addEvent}
                    >
                      Add
                    </button>
                  </div>
                  {isRecurring && (
                    <div className="mt-3 grid gap-3 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
                      <div className="flex flex-col gap-2">
                        <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                          Repeat
                        </label>
                        <select
                          className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700"
                          value={recurrenceCadence}
                          onChange={(event) => setRecurrenceCadence(event.target.value)}
                        >
                          {cadenceOptions.map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="flex flex-col gap-2">
                        <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                          Duration
                        </label>
                        <div className="flex flex-wrap gap-2">
                          <label className="flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700">
                            <input
                              type="radio"
                              name="recurrence-mode"
                              value="months"
                              checked={recurrenceMode === "months"}
                              onChange={() => setRecurrenceMode("months")}
                            />
                            Months
                          </label>
                          <label className="flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700">
                            <input
                              type="radio"
                              name="recurrence-mode"
                              value="forever"
                              checked={recurrenceMode === "forever"}
                              onChange={() => setRecurrenceMode("forever")}
                            />
                            Forever
                          </label>
                        </div>
                        {recurrenceMode === "months" && (
                          <input
                            className="w-32 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900"
                            value={recurrenceMonths}
                            onChange={(event) => setRecurrenceMonths(event.target.value)}
                            placeholder="Months"
                            inputMode="numeric"
                          />
                        )}
                      </div>
                    </div>
                  )}
                </div>
                <div className="grid gap-2 text-sm text-slate-700">
                  <div>
                    <span className="font-semibold text-red-600">Bills:</span>{" "}
                    {bills.length > 0
                      ? bills.map((item) => `${item.name} ($${item.amount})`).join(", ")
                      : "None"}
                  </div>
                  <div>
                    <span className="font-semibold text-green-600">Paydays:</span>{" "}
                    {paydays.length > 0
                      ? paydays.map((item) => `${item.name} ($${item.amount})`).join(", ")
                      : "None"}
                  </div>
                  <div>
                    <span className="font-semibold text-blue-600">Purchases:</span>{" "}
                    {purchases.length > 0
                      ? purchases.map((item) => `${item.name} ($${item.amount})`).join(", ")
                      : "None"}
                  </div>
                  <div>
                    <span className="font-semibold text-amber-600">Savings:</span>{" "}
                    {savings.length > 0
                      ? savings.map((item) => `${item.name} ($${item.amount})`).join(", ")
                      : "None"}
                  </div>
                </div>
              </div>
              {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
              <div className="mt-4 flex gap-2">
                <button
                  type="button"
                  className="rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:opacity-60"
                  onClick={saveDay}
                  disabled={isSaving}
                >
                  {isSaving ? "Saving..." : "Save"}
                </button>
                <button
                  type="button"
                  className="rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-600 transition hover:border-slate-400 hover:text-slate-900"
                  onClick={closeEditor}
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
        <aside className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700 md:sticky md:top-6 md:self-start">
          <h3 className="text-base font-semibold text-slate-900">
            {activeDay ? `Events for ${activeDay.date}` : "Events"}
          </h3>
          <div className="mt-3 rounded-xl border border-slate-200 bg-white p-3">
            <div className="text-xs uppercase tracking-wide text-slate-500">
              Bank Funds
            </div>
            <div className="mt-1 text-2xl font-semibold text-slate-900">
              ${currentFunds.toFixed(2)}
            </div>
          </div>
          <div className="mt-3 rounded-xl border border-slate-200 bg-white p-3">
            <div className="text-xs uppercase tracking-wide text-slate-500">
              Bank Savings
            </div>
            <div className="mt-1 text-2xl font-semibold text-slate-900">
              ${savingsBalance.toFixed(2)}
            </div>
          </div>
          <div className="mt-4 space-y-3">
            <div>
              <div className="flex items-center gap-2 text-sm font-semibold text-red-600">
                <span className="h-2 w-2 rounded-full bg-red-500" />
                Bills
              </div>
              {activeDay && activeDay.bills.length > 0 ? (
                <ul className="mt-2 space-y-1 text-slate-700">
                  {activeDay.bills.map((bill, index) => {
                    const isRecurringBill = Boolean(bill.recurringId);
                    return (
                      <li
                        key={`${bill.name}-${index}`}
                        className="flex items-center justify-between gap-2"
                      >
                        <span>
                          {bill.name} (${bill.amount})
                        </span>
                        <div className="flex items-center gap-2 text-xs">
                          {isRecurringBill ? (
                            <>
                              <button
                                type="button"
                                className="text-slate-400 hover:text-slate-700"
                                onClick={() =>
                                  deleteRecurring(
                                    bill.recurringId as string,
                                    activeDay.date,
                                    "one",
                                  )
                                }
                              >
                                Delete once
                              </button>
                              <button
                                type="button"
                                className="text-slate-400 hover:text-slate-700"
                                onClick={() =>
                                  deleteRecurring(
                                    bill.recurringId as string,
                                    activeDay.date,
                                    "all",
                                  )
                                }
                              >
                                Delete all
                              </button>
                            </>
                          ) : (
                            <button
                              type="button"
                              className="text-slate-400 hover:text-slate-700"
                              onClick={() => deleteEvent(activeDay.date, "bill", index)}
                            >
                              Delete
                            </button>
                          )}
                        </div>
                      </li>
                    );
                  })}
                </ul>
              ) : (
                <p className="mt-2 text-xs text-slate-500">None</p>
              )}
            </div>
            <div>
              <div className="flex items-center gap-2 text-sm font-semibold text-green-600">
                <span className="h-2 w-2 rounded-full bg-green-500" />
                Paydays
              </div>
              {activeDay && activeDay.paydays.length > 0 ? (
                <ul className="mt-2 space-y-1 text-slate-700">
                  {activeDay.paydays.map((payday, index) => {
                    const isRecurringPayday = Boolean(payday.recurringId);
                    return (
                      <li
                        key={`${payday.name}-${index}`}
                        className="flex items-center justify-between gap-2"
                      >
                        <span>
                          {payday.name} (${payday.amount})
                        </span>
                        <div className="flex items-center gap-2 text-xs">
                          {isRecurringPayday ? (
                            <>
                              <button
                                type="button"
                                className="text-slate-400 hover:text-slate-700"
                                onClick={() =>
                                  deleteRecurring(
                                    payday.recurringId as string,
                                    activeDay.date,
                                    "one",
                                  )
                                }
                              >
                                Delete once
                              </button>
                              <button
                                type="button"
                                className="text-slate-400 hover:text-slate-700"
                                onClick={() =>
                                  deleteRecurring(
                                    payday.recurringId as string,
                                    activeDay.date,
                                    "all",
                                  )
                                }
                              >
                                Delete all
                              </button>
                            </>
                          ) : (
                            <button
                              type="button"
                              className="text-slate-400 hover:text-slate-700"
                              onClick={() => deleteEvent(activeDay.date, "payday", index)}
                            >
                              Delete
                            </button>
                          )}
                        </div>
                      </li>
                    );
                  })}
                </ul>
              ) : (
                <p className="mt-2 text-xs text-slate-500">None</p>
              )}
            </div>
            <div>
              <div className="flex items-center gap-2 text-sm font-semibold text-blue-600">
                <span className="h-2 w-2 rounded-full bg-blue-500" />
                Purchases
              </div>
              {activeDay && activeDay.purchases.length > 0 ? (
                <ul className="mt-2 space-y-1 text-slate-700">
                  {activeDay.purchases.map((purchase, index) => {
                    const isRecurringPurchase = Boolean(purchase.recurringId);
                    return (
                      <li
                        key={`${purchase.name}-${index}`}
                        className="flex items-center justify-between gap-2"
                      >
                        <span>
                          {purchase.name} (${purchase.amount})
                        </span>
                        <div className="flex items-center gap-2 text-xs">
                          {isRecurringPurchase ? (
                            <>
                              <button
                                type="button"
                                className="text-slate-400 hover:text-slate-700"
                                onClick={() =>
                                  deleteRecurring(
                                    purchase.recurringId as string,
                                    activeDay.date,
                                    "one",
                                  )
                                }
                              >
                                Delete once
                              </button>
                              <button
                                type="button"
                                className="text-slate-400 hover:text-slate-700"
                                onClick={() =>
                                  deleteRecurring(
                                    purchase.recurringId as string,
                                    activeDay.date,
                                    "all",
                                  )
                                }
                              >
                                Delete all
                              </button>
                            </>
                          ) : (
                            <button
                              type="button"
                              className="text-slate-400 hover:text-slate-700"
                              onClick={() => deleteEvent(activeDay.date, "purchase", index)}
                            >
                              Delete
                            </button>
                          )}
                        </div>
                      </li>
                    );
                  })}
                </ul>
              ) : (
                <p className="mt-2 text-xs text-slate-500">None</p>
              )}
            </div>
            <div>
              <div className="flex items-center gap-2 text-sm font-semibold text-amber-600">
                <span className="h-2 w-2 rounded-full bg-amber-500" />
                Savings
              </div>
              {activeDay && activeDay.savings.length > 0 ? (
                <ul className="mt-2 space-y-1 text-slate-700">
                  {activeDay.savings.map((entry, index) => {
                    const isRecurringSavings = Boolean(entry.recurringId);
                    return (
                      <li
                        key={`${entry.name}-${index}`}
                        className="flex items-center justify-between gap-2"
                      >
                        <span>
                          {entry.name} (${entry.amount})
                        </span>
                        <div className="flex items-center gap-2 text-xs">
                          {isRecurringSavings ? (
                            <>
                              <button
                                type="button"
                                className="text-slate-400 hover:text-slate-700"
                                onClick={() =>
                                  deleteRecurring(
                                    entry.recurringId as string,
                                    activeDay.date,
                                    "one",
                                  )
                                }
                              >
                                Delete once
                              </button>
                              <button
                                type="button"
                                className="text-slate-400 hover:text-slate-700"
                                onClick={() =>
                                  deleteRecurring(
                                    entry.recurringId as string,
                                    activeDay.date,
                                    "all",
                                  )
                                }
                              >
                                Delete all
                              </button>
                            </>
                          ) : (
                            <button
                              type="button"
                              className="text-slate-400 hover:text-slate-700"
                              onClick={() => deleteEvent(activeDay.date, "savings", index)}
                            >
                              Delete
                            </button>
                          )}
                        </div>
                      </li>
                    );
                  })}
                </ul>
              ) : (
                <p className="mt-2 text-xs text-slate-500">None</p>
              )}
            </div>
          </div>

          {activeMatrix.flat().some((day) => day.paydays.length > 0) && (
            <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-4 text-sm text-slate-700">
              <h3 className="text-base font-semibold text-slate-900">
                Between Paydays
              </h3>
              {betweenPaydays ? (
                <div className="mt-3 grid gap-3 sm:grid-cols-2">
                  <div className="rounded-xl border border-slate-200 bg-white p-3">
                    <div className="text-xs uppercase tracking-wide text-slate-500">
                      Next Payday
                    </div>
                    <div className="mt-1 text-lg font-semibold text-slate-900">
                      {betweenPaydays.nextPaydayDate} (${betweenPaydays.nextPaydayAmount.toFixed(2)})
                    </div>
                  </div>
                  <div className="rounded-xl border border-slate-200 bg-white p-3">
                    <div className="text-xs uppercase tracking-wide text-slate-500">
                      Bills Until Next Payday
                    </div>
                    <div className="mt-1 text-lg font-semibold text-slate-900">
                      ${betweenPaydays.billsUntilNext.toFixed(2)}
                    </div>
                  </div>
                  <div className="rounded-xl border border-slate-200 bg-white p-3">
                    <div className="text-xs uppercase tracking-wide text-slate-500">
                      Purchases Until Next Payday
                    </div>
                    <div className="mt-1 text-lg font-semibold text-slate-900">
                      ${betweenPaydays.purchasesUntilNext.toFixed(2)}
                    </div>
                  </div>
                  <div className="rounded-xl border border-slate-200 bg-white p-3">
                    <div className="text-xs uppercase tracking-wide text-slate-500">
                      Savings Until Next Payday
                    </div>
                    <div className="mt-1 text-lg font-semibold text-slate-900">
                      ${betweenPaydays.savingsUntilNext.toFixed(2)}
                    </div>
                  </div>
                  <div className="rounded-xl border border-slate-200 bg-white p-3">
                    <div className="text-xs uppercase tracking-wide text-slate-500">
                      Projected Balance At Next Payday
                    </div>
                    <div className="mt-1 text-lg font-semibold text-slate-900">
                      ${betweenPaydays.projectedBalance.toFixed(2)}
                    </div>
                  </div>
                </div>
              ) : (
                <p className="mt-2 text-sm text-slate-500">
                  Add a future payday to see the projection.
                </p>
              )}
            </div>
          )}

          <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-4 text-sm text-slate-700">
            <h3 className="text-base font-semibold text-slate-900">
              Month Analytics
            </h3>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              <div className="rounded-xl border border-slate-200 bg-white p-3">
                <div className="text-xs uppercase tracking-wide text-slate-500">
                  Total Bills
                </div>
                <div className="mt-1 text-lg font-semibold text-slate-900">
                  ${analytics.totalBills.toFixed(2)}
                </div>
              </div>
              <div className="rounded-xl border border-slate-200 bg-white p-3">
                <div className="text-xs uppercase tracking-wide text-slate-500">
                  Total Paydays
                </div>
                <div className="mt-1 text-lg font-semibold text-slate-900">
                  ${analytics.totalPaydays.toFixed(2)}
                </div>
              </div>
              <div className="rounded-xl border border-slate-200 bg-white p-3">
                <div className="text-xs uppercase tracking-wide text-slate-500">
                  Purchases Planned
                </div>
                <div className="mt-1 text-lg font-semibold text-slate-900">
                  ${analytics.totalPurchases.toFixed(2)}
                </div>
              </div>
              <div className="rounded-xl border border-slate-200 bg-white p-3">
                <div className="text-xs uppercase tracking-wide text-slate-500">
                  Savings Moves
                </div>
                <div className="mt-1 text-lg font-semibold text-slate-900">
                  ${analytics.totalSavings.toFixed(2)}
                </div>
              </div>
              <div className="rounded-xl border border-slate-200 bg-white p-3">
                <div className="text-xs uppercase tracking-wide text-slate-500">
                  End of Month Funds
                </div>
                <div className="mt-1 text-lg font-semibold text-slate-900">
                  ${analytics.endOfMonthFunds.toFixed(2)}
                </div>
              </div>
              <div className="rounded-xl border border-slate-200 bg-white p-3 sm:col-span-2">
                <div className="text-xs uppercase tracking-wide text-slate-500">
                  Leftover After Bills
                </div>
                <div className="mt-1 text-lg font-semibold text-slate-900">
                  ${analytics.leftoverBeforePurchases.toFixed(2)}
                </div>
              </div>
            </div>
          </div>
        </aside>
      </div>

    </section>
  );
};

export default CalendarView;
