'use client'

const dayLabels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const dateCells = Array.from({ length: 28 }, (_, index) => index + 1);
const billDates = new Set([5]);
const paydayDates = new Set([12]);
const hypotheticalDates = new Set([21]);

export default function AppDescriptionSection() {
  return (
    <section
      className="mx-auto mt-16 w-full max-w-6xl justify-around rounded-3xl border-2 border-slate-900/70 bg-white/70 px-4 py-8 shadow-[0_18px_45px_-25px_rgba(15,23,42,0.8)] sm:mt-20 sm:px-6 sm:py-10 md:mt-24"
      style={{ animation: "sectionFade 0.8s ease 1s both" }}
    >
      <div className="grid gap-10 md:grid-cols-[1.1fr_0.9fr] md:items-start">
        <div className="space-y-3 text-slate-800">
          <h2 className="text-5xl font-bold tracking-tight text-slate-900">
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

        <div className="flex flex-col w-full h-full gap-10 sm:gap-12">
          <div className="w-full max-w-lg rounded-3xl border border-slate-200 bg-linear-to-br from-white via-slate-50 to-slate-100 p-5 shadow-[0_20px_40px_-28px_rgba(15,23,42,0.45)] sm:p-6">
            <div className="flex min-h-72 w-full flex-col gap-4 rounded-2xl border border-slate-200 bg-white/90 p-4 sm:min-h-80 sm:p-5">
              <div className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">
                Calendar View
              </div>
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-[clamp(0.65rem,1.1vw,0.85rem)] font-semibold tracking-wide text-slate-500">
                  {dayLabels.map((label) => (
                    <div
                      key={label}
                      className="flex-1 whitespace-nowrap text-center"
                    >
                      {label}
                    </div>
                  ))}
                </div>
                <div className="flex flex-wrap gap-2">
                  {dateCells.map((date) => {
                    const isBill = billDates.has(date);
                    const isPayday = paydayDates.has(date);
                    const isHypothetical = hypotheticalDates.has(date);
                    return (
                      <div
                        key={date}
                        className={`flex basis-[calc((100%-0.5rem*6)/7)] items-center justify-center rounded-lg px-2 py-1 text-[clamp(0.65rem,1.05vw,0.8rem)] font-semibold ${
                          isBill
                            ? "bg-red-100 text-red-700"
                            : isPayday
                              ? "bg-emerald-100 text-emerald-700"
                              : isHypothetical
                                ? "bg-amber-100 text-amber-700"
                                : "bg-slate-100 text-slate-600"
                        }`}
                      >
                        {date}
                      </div>
                    );
                  })}
                </div>
              </div>
              <div className="mt-auto flex items-center justify-between rounded-xl border border-slate-200 bg-white px-3 py-2 text-[12px] font-medium text-slate-600 shadow-sm">
                <span>Balance projection</span>
                <span className="text-slate-900">$1,240</span>
              </div>
            </div>
          </div>

          <div className="w-full max-w-lg rounded-3xl border border-slate-200 bg-linear-to-br from-slate-50 via-white to-slate-100 p-5 shadow-[0_20px_40px_-28px_rgba(15,23,42,0.45)] sm:p-6">
            <div className="flex min-h-72 w-full flex-col gap-4 rounded-2xl border border-slate-200 bg-white/90 p-4 sm:min-h-80 sm:p-5">
              <div className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">
                Alerts &amp; Forecasts
              </div>
              <div className="space-y-3">
                <div className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600 shadow-sm">
                  Today: Phone bill due
                </div>
                <div className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600 shadow-sm">
                  Friday: Paycheck hits
                </div>
                <div className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600 shadow-sm">
                  Next week: Vacation deposit
                </div>
              </div>
              <div className="mt-auto flex items-center justify-between rounded-xl border border-slate-200 bg-white px-3 py-2 text-[12px] font-medium text-slate-600 shadow-sm">
                <span>Forecasted balance</span>
                <span className="text-slate-900">$1,240</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      <style jsx>{`
        @keyframes sectionFade {
          from {
            opacity: 0;
            transform: translateY(24px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </section>
  );
}
