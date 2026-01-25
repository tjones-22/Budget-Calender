"use client";

import { useState } from "react";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { signupAction } from "../actions/signup";

const SignUp = () => {
  const [state, formAction] = useActionState(signupAction, {
    error: "",
    success: "",
  });
  const [step, setStep] = useState(1);
  const [stepError, setStepError] = useState("");
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [initialFunds, setInitialFunds] = useState("");
  const [initialSavings, setInitialSavings] = useState("");
  const [notifyBills, setNotifyBills] = useState(false);
  const [notifyPaydays, setNotifyPaydays] = useState(false);

  const goNext = () => {
    if (!name.trim() || !username.trim() || !password || !phone.trim()) {
      setStepError("Please fill out all fields");
      return;
    }
    if (password.length < 8) {
      setStepError("Password must be longer than 8 characters");
      return;
    }
    setStepError("");
    setStep(2);
  };

  return (
    <>
      <form
        action={formAction}
        className="mx-auto mt-16 w-full max-w-6xl justify-around rounded-3xl border-2 border-slate-900/70 bg-white/70 px-4 py-8 shadow-[0_18px_45px_-25px_rgba(15,23,42,0.8)] sm:mt-20 sm:px-6 sm:py-10 md:mt-24"
      >
        <h2 className="text-center text-3xl underline">
          {step === 1 ? "Sign Up" : "Account Details"}
        </h2>

        <div className="flex flex-row items-center">
          <div className="flex w-1/2 flex-col items-start gap-5">
            <div className="flex w-full max-w-md flex-col items-start gap-2">
              <label className="text-left text-lg font-medium" htmlFor="name">
                Name
              </label>
              <input
                className="ml-1 w-full max-w-md rounded-tl-2xl border-2 border-black p-1.5 text-black focus-visible:outline-slate-900 md:w-[20vw]"
                type="text"
                name="name"
                id="name"
                placeholder="Name"
                value={name}
                onChange={(event) => setName(event.target.value)}
                hidden={step === 2}
                disabled={step === 2}
              />
            </div>

            <div className="flex w-full max-w-md flex-col items-start gap-2">
              <label
                className="text-left text-lg font-medium"
                htmlFor="username"
              >
                Username
              </label>
              <input
                className="ml-1 w-full max-w-md rounded-tl-2xl border-2 border-black p-1.5 text-black focus-visible:outline-slate-900 md:w-[20vw]"
                type="text"
                name="username"
                id="username"
                placeholder="Username"
                value={username}
                onChange={(event) => setUsername(event.target.value)}
                hidden={step === 2}
                disabled={step === 2}
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
                className="ml-1 w-full max-w-md rounded-tl-2xl border-2 border-black p-1.5 text-black focus-visible:outline-slate-900 md:w-[20vw]"
                type="password"
                name="password"
                id="password"
                placeholder="Password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                hidden={step === 2}
                disabled={step === 2}
              />
            </div>
            <div className="flex w-full max-w-md flex-col items-start gap-2">
              <label className="text-left text-lg font-medium" htmlFor="phone">
                Phone
              </label>
              <input
                className="ml-1 w-full max-w-md rounded-tl-2xl border-2 border-black p-1.5 text-black focus-visible:outline-slate-900 md:w-[20vw]"
                type="phone"
                name="phone"
                id="phone"
                placeholder="(012)-345-6789"
                value={phone}
                onChange={(event) => setPhone(event.target.value)}
                hidden={step === 2}
                disabled={step === 2}
              />
            </div>

            {step === 2 && (
              <>
                <input type="hidden" name="name" value={name} />
                <input type="hidden" name="username" value={username} />
                <input type="hidden" name="password" value={password} />
                <input type="hidden" name="phone" value={phone} />
              </>
            )}

            {step === 2 && (
              <>
                <div className="flex w-full max-w-md flex-col items-start gap-2">
                  <label
                    className="text-left text-lg font-medium"
                    htmlFor="initialFunds"
                  >
                    Initial Funds
                  </label>
                  <input
                    className="ml-1 w-full max-w-md rounded-tl-2xl border-2 border-black p-1.5 text-black focus-visible:outline-slate-900 md:w-[20vw]"
                    type="text"
                    name="initialFunds"
                    id="initialFunds"
                    placeholder="1000"
                    value={initialFunds}
                    onChange={(event) => setInitialFunds(event.target.value)}
                  />
                </div>
                <div className="flex w-full max-w-md flex-col items-start gap-2">
                  <label
                    className="text-left text-lg font-medium"
                    htmlFor="initialSavings"
                  >
                    Initial Savings
                  </label>
                  <input
                    className="ml-1 w-full max-w-md rounded-tl-2xl border-2 border-black p-1.5 text-black focus-visible:outline-slate-900 md:w-[20vw]"
                    type="text"
                    name="initialSavings"
                    id="initialSavings"
                    placeholder="0"
                    value={initialSavings}
                    onChange={(event) => setInitialSavings(event.target.value)}
                  />
                </div>
                <div className="flex flex-col items-start gap-3">
                  <label className="flex items-center gap-2 text-lg font-medium">
                    <input
                      type="checkbox"
                      name="notifyBills"
                      checked={notifyBills}
                      onChange={(event) => setNotifyBills(event.target.checked)}
                    />
                    Text me about upcoming bills
                  </label>
                  <label className="flex items-center gap-2 text-lg font-medium">
                    <input
                      type="checkbox"
                      name="notifyPaydays"
                      checked={notifyPaydays}
                      onChange={(event) => setNotifyPaydays(event.target.checked)}
                    />
                    Text me about upcoming paydays
                  </label>
                </div>
              </>
            )}
          </div>

          {stepError && (
            <h3 className="text-red-500 text-xl">{stepError}</h3>
          )}
          {state.error && <h3 className="text-red-500 text-xl">{state.error}</h3>}

          {state.success && (
            <h3 className="text-green-300">{state.success}</h3>
          )}
        </div>

        <div className="flex gap-3">
          {step === 1 ? (
            <button
              type="button"
              className="mt-2 rounded-full border-2 bg-slate-900 px-6 py-2.5 text-white shadow-md transition hover:-translate-y-0.5 hover:border-yellow-500 hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:ring-offset-2"
              onClick={goNext}
            >
              Next
            </button>
          ) : (
            <>
              <button
                type="button"
                className="mt-2 rounded-full border-2 border-slate-900 px-6 py-2.5 text-slate-900 shadow-md transition hover:-translate-y-0.5 hover:border-yellow-500 hover:text-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:ring-offset-2"
                onClick={() => setStep(1)}
              >
                Back
              </button>
              <SubmitButton />
            </>
          )}
        </div>
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
      {pending ? "Signing Up..." : "Sign Up"}
    </button>
  );
};

export default SignUp;
