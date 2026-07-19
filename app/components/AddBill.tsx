import { addBillAction } from "../actions/bill-actions";
import SubmitButton from "./FormSubmitButton";

export function AddBill({
  date,
  redirectHref = "/dashboard/calender",
}: {
  date?: string;
  redirectHref?: string;
}) {
  return (
    <section className="w-full rounded-lg bg-white p-6 text-gray-950 shadow-xl">
    

      <form action={addBillAction.bind(null, redirectHref)}
      className="space-y-4">
        <label className="block">
          <span className="text-sm font-medium">Name</span>
          <input
            name="name"
            type="text"
            required
            className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 outline-none focus:border-blue-700"
          />
        </label>

         <label className="block">
            <span className="text-sm font-medium">Bill Amount:</span>
            <input
              name="amount"
              type="number"
              step="0.01"
              required
              className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 outline-none focus:border-blue-700"
            />
          </label>

        <input type="hidden" name="date" value={date ?? ""} />

        <label className="block">
          <span className="text-sm font-medium">Type</span>
          <select
            name="type"
            className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 outline-none focus:border-blue-700"
          >
            <option value="bill">Bill</option>
            <option value="payday">Paycheck</option>
            <option value="purchase">Spending</option>
            <option value="savings">Add to Savings</option>
          </select>
        </label>

        <SubmitButton
          pendingText="Adding bill..."
          className="w-full rounded-md bg-blue-950 px-4 py-2 font-semibold text-yellow-300 hover:bg-blue-900 disabled:opacity-50"
        >
          Add Bill
        </SubmitButton>
      </form>
    </section>
  );
}
