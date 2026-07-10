import { redirect } from "next/navigation";
import { updateBankStartingBalanceFormAction } from "../../actions/user-actions";
import { requireUser } from "../../lib/auth/session";
import { getUserOnboardingStatus } from "../../lib/db/user-db";

export default async function AddBankInfoPage() {
  const user = await requireUser();
  const userSetup = await getUserOnboardingStatus(user.id);

  if (!userSetup || userSetup.onboardingComplete) {
    redirect("/dashboard");
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-900 px-4 text-gray-950">
      <section className="w-full max-w-md rounded-lg bg-white p-6 shadow-lg">
        <h1 className="text-2xl font-bold">Enter your starting balance</h1>

        <form
          action={updateBankStartingBalanceFormAction}
          className="mt-6 space-y-4"
        >
          <label className="block">
            <span className="text-sm font-medium">Starting balance</span>
            <input
              name="startingBalance"
              type="number"
              step="0.01"
              required
              className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 outline-none focus:border-blue-700"
            />
          </label>

          <button
            type="submit"
            className="w-full rounded-md bg-blue-950 px-4 py-2 font-semibold text-yellow-300 hover:bg-blue-900"
          >
            Save balance
          </button>
        </form>
      </section>
    </main>
  );
}
