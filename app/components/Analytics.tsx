import { getUserBankAnalyticsAction } from "../actions/bank-actions";
import { formatCurrency } from "../lib/format";

type AnalyticsProps = {
  currentBalance?: number | null;
  savings?: number | null;
  compact?: boolean;
};

export default async function Analytics({
  currentBalance,
  savings,
  compact = false,
}: AnalyticsProps) {
  const weeklyBillsData = await getUserBankAnalyticsAction();

  const weeklyStart = weeklyBillsData.startOfWeek.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });

  const weeklyEnd = new Date(
    weeklyBillsData.startOfNextWeek.getFullYear(),
    weeklyBillsData.startOfNextWeek.getMonth(),
    weeklyBillsData.startOfNextWeek.getDate() - 1,
  ).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });

  const accountBalance = currentBalance ?? 0;
  const weeklyAmount = accountBalance - weeklyBillsData.weeklyAmount;
  const monthlyAmount = accountBalance - weeklyBillsData.monthlyAmount;
  const monthlySavings = weeklyBillsData.monthlySavings;

  return (
    <div className="w-full rounded-lg bg-gray-900 p-4 text-gray-300 dark:bg-white dark:text-black">
      <h3 className="border-b text-lg font-semibold">Analytics</h3>

      <div className="flex h-fit flex-col justify-evenly">
        <h4>Account: {formatCurrency(currentBalance)}</h4>
        <h4>Savings: {formatCurrency(savings)}</h4>

        {!compact ? (
          <>
            <h4>
              End Of Week Balance ({weeklyStart} - {weeklyEnd}):{" "}
              {formatCurrency(weeklyAmount)}
            </h4>

            <h4>End of Month Balance: {formatCurrency(monthlyAmount)}</h4>

            <h4>End of Month Savings: {formatCurrency(monthlySavings)}</h4>
          </>
        ) : null}
      </div>
    </div>
  );
}
