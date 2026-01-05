import AppDescriptionSection from "./components/AppDescriptionSection";
import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import CalendarView from "./components/CalendarView";

type UserProfile = {
  name: string;
  username: string;
  initialFunds: number;
  initialSavings: number;
};

type CalendarDay = {
  date: string;
  bills: { name: string; amount: number; recurringId?: string }[];
  paydays: { name: string; amount: number; recurringId?: string }[];
  purchases: { name: string; amount: number; recurringId?: string }[];
  savings: { name: string; amount: number; recurringId?: string }[];
  isCurrentMonth: boolean;
  isToday: boolean;
};

type CalendarResponse = {
  year: number;
  month: number;
  matrix: CalendarDay[][];
};

async function getUserProfile(): Promise<UserProfile | null> {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("session");
  if (!sessionCookie?.value) {
    return null;
  }

  try {
    const response = await fetch("http://localhost:3001/api/login/me", {
      headers: {
        Cookie: `session=${sessionCookie.value}`,
      },
      cache: "no-store",
    });
    if (!response.ok) {
      return null;
    }
    const data = (await response.json()) as { user?: UserProfile | null };
    if (!data.user) {
      return null;
    }
    return {
      ...data.user,
      initialSavings: Number(data.user.initialSavings ?? 0),
    };
  } catch {
    return null;
  }
}

async function getCalendar(): Promise<CalendarResponse | null> {
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth() + 1;
  try {
    const response = await fetch(
      `http://localhost:3001/api/calendar?year=${year}&month=${month}`,
      { cache: "no-store" },
    );
    if (!response.ok) {
      return null;
    }
    return (await response.json()) as CalendarResponse;
  } catch {
    return null;
  }
}

export default async function Home() {
  const user = await getUserProfile();
  const calendar = await getCalendar();

  async function logoutAction() {
    "use server";
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get("session");
    if (sessionCookie?.value) {
      await fetch("http://localhost:3001/api/login/logout", {
        method: "POST",
        headers: {
          Cookie: `session=${sessionCookie.value}`,
        },
      });
    }
    redirect("/");
  }
 

  if (user) {
    return (
      <div className="text-[18px] flex flex-col items-center justify-start gap-6 w-full h-auto p-6">
        <div className="flex w-full max-w-4xl items-center justify-between">
          <h1 className="bg-linear-to-r from-slate-900 via-slate-700 to-slate-500 bg-clip-text text-3xl font-semibold tracking-tight text-transparent md:text-4xl">
            Welcome, {user.name}
          </h1>
          <form action={logoutAction}>
            <button
              className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:-translate-y-0.5 hover:border-slate-300 hover:text-slate-900"
              type="submit"
            >
              Log out
            </button>
          </form>
        </div>
        {calendar ? (
          <CalendarView
            month={calendar.month}
            year={calendar.year}
            username={user.username}
            initialFunds={user.initialFunds}
            initialSavings={user.initialSavings}
            matrix={calendar.matrix}
          />
        ) : (
          <section className="w-full max-w-4xl rounded-3xl border border-slate-200 bg-white p-6 shadow-xl">
            <h2 className="text-xl font-semibold text-slate-900">
              Calendar unavailable
            </h2>
            <p className="mt-2 text-sm text-slate-600">
              Unable to load calendar data. Please try again.
            </p>
          </section>
        )}
      </div>
    );
  }

  return (
    <div className="text-[20px] flex flex-col items-center justify-start gap-6 w-full h-auto p-3.5">
      <h1 className="bg-linear-to-r from-slate-900 via-slate-700 to-slate-500 bg-clip-text text-3xl font-semibold tracking-tight text-transparent md:text-4xl">
        Welcome to Budget Calender
      </h1>

      <div className="flex flex-row justify-evenly items-center w-screen h-auto">
        <Link
          className="rounded-full bg-slate-900 px-6 py-2.5 text-white shadow-md transition hover:-translate-y-0.5 hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:ring-offset-2"
          href={"/login"}
        >
          Login
          </Link>


        <Link
          className="rounded-full bg-slate-900 px-6 py-2.5 text-white shadow-md transition hover:-translate-y-0.5 hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:ring-offset-2"
          href={"/signup"}
        >
          Sign Up
          </Link>
      </div>
      <AppDescriptionSection />
    </div>
  );
}
