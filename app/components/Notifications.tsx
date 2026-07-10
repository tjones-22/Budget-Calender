import type { Bill } from "@/types/types";

export default function Notifications({ bills }: { bills: Bill[] }) {
  return (
    <div className="rounded-lg  bg-gray-900 p-4 text-gray-300 dark:bg-white dark:text-black">
      <h2 className="text-lg font-semibold">Notifications</h2>

      <div className="mt-4 space-y-3">
        {bills.length > 0 ? (
          bills.map((bill, index) => (
            <div
              key={`${bill.type}-${index}`}
              className="rounded-md border border-gray-700 p-3 text-sm dark:border-gray-300"
            >
              {bill.name} today
            </div>
          ))
        ) : (
          <p className="text-sm text-gray-400 dark:text-gray-600">
            No bills scheduled for today.
          </p>
        )}
      </div>
    </div>
  );
}
