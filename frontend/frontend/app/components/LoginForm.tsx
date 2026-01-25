"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

const Login = () => {
  const router = useRouter();
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setSuccess("");
    setIsSubmitting(true);

    const formData = new FormData(event.currentTarget);
    const usernameValue = formData.get("username");
    const passwordValue = formData.get("password");

    const username =
      typeof usernameValue === "string" ? usernameValue.trim() : "";
    const password = typeof passwordValue === "string" ? passwordValue : "";

    if (!username || !password) {
      setError("Username and password are required");
      setIsSubmitting(false);
      return;
    }

    try {
      const response = await fetch("/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      });

      let data: { message?: string } | null = null;
      try {
        data = (await response.json()) as { message?: string };
      } catch {
        data = null;
      }

      if (!response.ok) {
        setError(data?.message ?? `Error: ${response.statusText}`);
        setIsSubmitting(false);
        return;
      }

      if (data?.message === "Invalid Credentials") {
        setError(data.message);
        setIsSubmitting(false);
        return;
      }

      setSuccess("Logged in successfully");
      router.push("/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Network error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <form
        onSubmit={handleSubmit}
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
                className="ml-1 w-full max-w-md rounded-tl-2xl border-2 border-black p-1.5 text-black focus-visible:outline-slate-900 md:w-[20vw]"
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
                className="ml-1 w-full max-w-md rounded-tl-2xl border-2 border-black p-1.5 text-black focus-visible:outline-slate-900 md:w-[20vw]"
                type="password"
                name="password"
                id="password"
                placeholder="Password"
                required
              />
            </div>
          </div>

          {error && <h3 className="text-xl text-red-300">{error}</h3>}

          {success && (
            <h3 className="text-green-300">{success}</h3>
          )}
        </div>

        <SubmitButton isSubmitting={isSubmitting} />
      </form>
    </>
  );
};

const SubmitButton = ({ isSubmitting }: { isSubmitting: boolean }) => {
  return (
    <button
      className="mt-2 rounded-full border-2 bg-slate-900 px-6 py-2.5 text-white shadow-md transition hover:-translate-y-0.5 hover:border-yellow-500 hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-70"
      type="submit"
      disabled={isSubmitting}
    >
      {isSubmitting ? "Logging In..." : "Log In"}
    </button>
  );
};

export default Login;
