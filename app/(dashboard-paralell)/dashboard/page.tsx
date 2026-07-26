import { applyBillsForToday } from "@/app/actions/analytics-actions";
import AccountMenu from "../../components/AccountMenu";
import { requireUser } from "../../lib/auth/session";
import { capitalizeName } from "../../lib/format";

export default async function DashboardPage() {
  const user = await requireUser();
  const displayName = capitalizeName(user.name ?? "User");

  await applyBillsForToday();

  return (
    <header className="mb-6 flex items-center justify-between border-b border-gray-700 pb-4">
      <div>
        <h1 className="text-3xl font-bold text-yellow-300">Dashboard</h1>
        <p className="mt-1 text-2xl text-gray-300">Welcome {displayName}</p>
      </div>

      <AccountMenu image={user.image} name={displayName} />
    </header>
  );
}
