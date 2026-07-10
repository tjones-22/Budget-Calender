import Link from "next/link";
import { requireUser } from "../lib/auth/session";
import SubmitButton from "../components/FormSubmitButton";
import { deleteUserAction } from "../actions/user-actions";
import UpdateAccountForm from "../components/UpdateAccountForm";
import { getUserProfileById } from "../lib/db/user-db";


export default async function UpdateAccountPage() {
  const user = await requireUser();
  const profile = await getUserProfileById(user.id);
    
  return (
    <main className="min-h-screen bg-gray-900 p-6 text-white">
        <Link
          href="/dashboard"
          className="mt-4 inline-block rounded-md bg-blue-950 px-4 py-2 font-semibold text-yellow-300 hover:bg-blue-900"
        >
          Back to dashboard
        </Link>

      <div className="mx-auto max-w-3xl rounded-lg bg-white p-6 text-gray-950 shadow">
        <h1 className="text-2xl font-bold">Update Account</h1>

        <UpdateAccountForm
          defaultName={profile?.name ?? user.name}
          defaultEmail={profile?.email ?? user.email}
          defaultUsername={profile?.username}
        />

        <form action={deleteUserAction}>
          <SubmitButton
            className="w-full text-red-600 mt-4 inline-block rounded-md bg-gray-400 px-4 py-2 font-semibold hover:bg-blue-900"
          >
            Delete Account
          </SubmitButton>
        </form>
        
      </div>
    </main>
  );
}
