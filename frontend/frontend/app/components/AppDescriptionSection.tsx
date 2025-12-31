const dayLabels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const dateCells = Array.from({ length: 28 }, (_, index) => index + 1);
const highlightedDates = new Set([5, 12, 21]);

export default function AppDescriptionSection() {
  return (
    <section className="mt-6 w-full max-w-6xl px-4 sm:px-6">
      <div className="grid gap-10 md:grid-cols-[1.1fr_0.9fr] md:items-start">
        <div className="space-y-3 text-slate-800">
          <h2 className="text-3xl font-semibold tracking-tight text-slate-900">
            Your money, mapped in time
          </h2>
          <p className="text-lg leading-relaxed text-slate-700 md:text-xl">
            Budget Calender lets you set dates for bills, paydays, and future
            purchases, then projects your account balance over time. See how
            upcoming expenses shift your runway in a calendar view, and get
            day-of notifications so nothing sneaks up on you.
          </p>
          <p className="text-lg leading-relaxed text-slate-700 md:text-xl">
            Plan ahead with confidence by visualizing what hits your account and
            when, plus quick alerts for anything happening today.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 md:justify-items-end">
          <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-linear-to-br from-slate-50 via-white to-slate-100 p-5 shadow-sm sm:p-6">
            <div className="flex min-h-70 w-full flex-col gap-3 rounded-2xl border border-slate-200 bg-white/80 p-4 sm:min-h-75 sm:p-5">
              <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Calendar View
              </div>
              <div className="space-y-2">
                <div className="grid grid-cols-7 gap-1 text-[11px] font-medium text-slate-500 sm:text-xs">
                  {dayLabels.map((label) => (
                    <div key={label} className="text-center">
                      {label}
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-7 gap-1">
                  {dateCells.map((date) => {
                    const isHighlighted = highlightedDates.has(date);
                    return (
                      <div
                        key={date}
                        className={`flex items-center justify-center rounded-md px-2 py-1 text-[11px] font-semibold sm:px-2.5 sm:py-1.5 sm:text-[12px] ${
                          isHighlighted
                            ? "bg-slate-900 text-white"
                            : "bg-slate-100 text-slate-600"
                        }`}
                      >
                        {date}
                      </div>
                    );
                  })}
                </div>
              </div>
              <div className="mt-auto flex items-center justify-between rounded-lg border border-slate-200 bg-white px-3 py-2 text-[12px] font-medium text-slate-600 shadow-sm">
                <span>Balance projection</span>
                <span className="text-slate-900">$1,240</span>
              </div>
            </div>
          </div>

          <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-linear-to-br from-white via-slate-50 to-slate-100 p-5 shadow-sm sm:p-6">
            <div className="flex min-h-70 w-full flex-col gap-3 rounded-2xl border border-slate-200 bg-white/80 p-4 sm:min-h-75 sm:p-5">
              <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Alerts &amp; Forecasts
              </div>
              <div className="space-y-2">
                <div className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600 shadow-sm">
                  Today: Phone bill due
                </div>
                <div className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600 shadow-sm">
                  Friday: Paycheck hits
                </div>
                <div className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600 shadow-sm">
                  Next week: Vacation deposit
                </div>
              </div>
              <div className="mt-auto flex items-center justify-between rounded-lg border border-slate-200 bg-white px-3 py-2 text-[12px] font-medium text-slate-600 shadow-sm">
                <span>Forecasted balance</span>
                <span className="text-slate-900">$1,240</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
