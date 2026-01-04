"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { loginAction } from "../actions/login";

const Login = () => {
  const [state, formAction] = useActionState(loginAction, {
    error: "",
    success: "",
  });

  return (
    <>
      <form
        action={formAction}
        className="mx-auto mt-16 w-full max-w-6xl justify-around rounded-3xl border-2 border-slate-900/70 bg-white/70 px-4 py-8 text-slate-900 shadow-[0_18px_45px_-25px_rgba(15,23,42,0.8)] sm:mt-20 sm:px-6 sm:py-10 md:mt-24"
      >
        <h2 className="text-center text-3xl underline">Log In</h2>

        <div className="flex flex-row items-center">
          <div className="flex w-1/2 flex-col items-start gap-5">
            <div className="flex w-full max-w-md flex-col items-start gap-2">
              <label
                className="text-left text-lg font-medium"
                htmlFor="username"
              >
                Username
              </label>
              <input
                className="ml-1 w-[20vw] rounded-tl-2xl border-2 border-black p-1.5 text-black focus-visible:outline-slate-900"
                type="text"
                name="username"
                id="username"
                placeholder="Username"
                required
              />
            </div>

            <div className="flex w-full max-w-md flex-col items-start gap-2">
              <label
                className="text-left text-lg font-medium"
                htmlFor="password"
              >
                Password
              </label>
              <input
                className="ml-1 w-[20vw] rounded-tl-2xl border-2 border-black p-1.5 text-black focus-visible:outline-slate-900"
                type="password"
                name="password"
                id="password"
                placeholder="Password"
                required
              />
            </div>
          </div>

          {state.error && <h3 className="text-xl text-red-300">{state.error}</h3>}

          {state.success && (
            <h3 className="text-green-300">{state.success}</h3>
          )}
        </div>

        <SubmitButton />
      </form>
    </>
  );
};

const SubmitButton = () => {
  const { pending } = useFormStatus();

  return (
    <button
      className="mt-2 rounded-full border-2 bg-slate-900 px-6 py-2.5 text-white shadow-md transition hover:-translate-y-0.5 hover:border-yellow-500 hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-70"
      type="submit"
      disabled={pending}
    >
      {pending ? "Logging In..." : "Log In"}
    </button>
  );
};

export default Login;
