import Link from "next/link";
import {
  signUpWithGoogleAction,
  signUpWithCredentialsAction,
} from "../actions/user-actions";
import SubmitButton from "../components/FormSubmitButton";

export default function SignUpPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-900 px-4 text-gray-950">
      <section className="w-full max-w-md rounded-lg bg-white p-6 shadow-lg">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-center">Create account</h1>
        </div>

        <div className="my-6 h-px bg-gray-200" />

        <form action={signUpWithCredentialsAction} className="space-y-4">
          <label className="block">
            <span className="text-sm font-medium">Name</span>
            <input
              name="name"
              type="text"
              className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 outline-none focus:border-blue-700"
            />
          </label>

          <label className="block">
            <span className="text-sm font-medium">Email</span>
            <input
              name="email"
              type="email"
              className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 outline-none focus:border-blue-700"
            />
          </label>

          <label className="block">
            <span className="text-sm font-medium">Username</span>
            <input
              name="username"
              type="text"
              required
              className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 outline-none focus:border-blue-700"
            />
          </label>

          <label className="block">
            <span className="text-sm font-medium">Password</span>
            <input
              name="password"
              type="password"
              required
              className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 outline-none focus:border-blue-700"
            />
          </label>

          <SubmitButton
            pendingText="Creating account..."
            className="w-full rounded-md bg-blue-950 px-4 py-2 font-semibold text-yellow-300 disabled:opacity-5 hover:bg-blue-900"
          >
            Sign Up
          </SubmitButton>
        </form>

        <form action={signUpWithGoogleAction} className="mt-4">
          <SubmitButton
            pendingText="Authenticating..."
            className="w-full rounded-md border border-gray-300 px-4 py-2 font-semibold text-gray-900 hover:bg-gray-100"
          >
            Sign Up With Google
          </SubmitButton>
        </form>

        <p className="mt-6 text-center text-sm text-gray-600">
          Already have an account?{" "}
          <Link href="/login" className="font-semibold text-blue-800">
            Log in
          </Link>
        </p>
      </section>
    </main>
  );
}
