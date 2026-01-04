import AppDescriptionSection from "./components/AppDescriptionSection";
import Link from "next/link";

export default function Home() {
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
