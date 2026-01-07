import AppDescriptionSection from "./components/AppDescriptionSection";
import Link from "next/link";
import { cookies } from "next/headers";
import CalendarView from "./components/CalendarView";
import ProfileMenu from "./components/ProfileMenu";
import { buildBackendUrl } from "@/app/lib/backend";

type UserProfile = {
  name: string;
  username: string;
  initialFunds: number;
  initialSavings: number;
  groupId: string | null;
  role: "owner" | "viewer";
  canEdit: boolean;
  shareEvents: boolean;
  shareBalances: boolean;
  shareAnalytics: boolean;
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

async function getUserProfile(sessionId?: string): Promise<UserProfile | null> {
  if (!sessionId) {
    return null;
  }

  try {
    const response = await fetch(buildBackendUrl("/api/login/me"), {
      headers: {
        "x-session-id": sessionId,
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
      canEdit: data.user.canEdit ?? true,
      shareEvents: data.user.shareEvents ?? true,
      shareBalances: data.user.shareBalances ?? true,
      shareAnalytics: data.user.shareAnalytics ?? true,
      role: data.user.role ?? "owner",
    };
  } catch {
    return null;
  }
}

async function getCalendar(sessionId?: string): Promise<CalendarResponse | null> {
  if (!sessionId) {
    return null;
  }
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth() + 1;
  try {
    const response = await fetch(
      `${buildBackendUrl("/api/calendar")}?year=${year}&month=${month}`,
      {
        cache: "no-store",
        headers: {
          "x-session-id": sessionId,
        },
      },
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
  const cookieStore = await cookies();
  const sessionId = cookieStore.get("session")?.value;
  const user = await getUserProfile(sessionId);
  const calendar = user ? await getCalendar(sessionId) : null;

  if (user) {
    return (
      <div className="text-[18px] flex flex-col items-center justify-start gap-6 w-full h-auto p-6">
        <div className="flex w-full max-w-6xl items-center justify-between">
          <ProfileMenu name={user.name} role={user.role} />
          <h1 className="bg-linear-to-r from-slate-900 via-slate-700 to-slate-500 bg-clip-text text-3xl font-semibold tracking-tight text-transparent md:text-4xl">
            Welcome, {user.name}
          </h1>
          <div className="w-10" />
        </div>
        {calendar ? (
          <CalendarView
            month={calendar.month}
            year={calendar.year}
            username={user.username}
            initialFunds={user.initialFunds}
            initialSavings={user.initialSavings}
            role={user.role}
            canEdit={user.canEdit}
            shareEvents={user.shareEvents}
            shareBalances={user.shareBalances}
            shareAnalytics={user.shareAnalytics}
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
