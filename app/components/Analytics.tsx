import { formatCurrency } from "../lib/format";

export default function Analytics({
  currentBalance,
  savings,
}: {
  currentBalance?: number | null;
  savings?: number | null;
}) {
  return (
    <div className="w-full rounded-lg bg-gray-900 p-4 text-gray-300 dark:bg-white dark:text-black">
      <h3 className="border-b text-lg font-semibold">Analytics</h3>

      <div className="flex h-fit flex-col justify-evenly">
        <h4>Account: {formatCurrency(currentBalance)}</h4>
        <h4>Savings: {formatCurrency(savings)}</h4>
      </div>
    </div>
  );
}
