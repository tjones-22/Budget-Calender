import Calender from "./components/Calender";
import { mockBillsByDay } from "./lib/mockBills";
import Link from "next/link";

export default function Home() {
  return (
    <>
      <div className="flex h-auto min-w-full items-center justify-around bg-blue-950 p-4 text-yellow-300 dark:bg-black dark:text-white md:flex-row">
        <h1 className="fade-in text-lg font-bold dark:text-amber-700 md:text-2xl">
          Welcome to Budget Calendar
        </h1>
        <div className="flex w-1/3 flex-row items-center justify-evenly text-lg">
          <Link
            className="hover-animation-timing rounded-lg bg-gray-900 p-3 hover:bg-amber-700"
            href="/login"
          >
            Login
          </Link>

          <Link
            className="hover-animation-timing rounded-lg bg-gray-900 p-3 hover:bg-amber-700"
            href="/signup"
          >
            Sign Up
          </Link>
        </div>
      </div>
      <main className="homepage-main mt-4 flex-col items-center dark:bg-gray-900 sm:min-h-screen sm:justify-around min-[1000px]:flex-row">
        <div className="mt-4 border p-4 text-black dark:bg-white dark:text-gray-900 sm:w-screen md:w-2/4 min-[1000px]:h-[40vh]">
          <div className="flex min-w-full border-b-2">
            <h2 className="font-semibold min-[1000px]:text-3xl">
              Manage your bills in a calendar view
            </h2>
          </div>
          <p className="min-[1000px]:text-2xl">
            To help you see what bills are coming up and when the next payday
            is, Budget Calendar displays it all in a calendar so it is
            easier to plan future purchases. It also allows you to see your
            current balance by day, week, and end of the month.
          </p>
          <p className="min-[1000px]:text-2xl">
            For this app, you enter your savings and a hypothetical checking
            account where your bills pull money from. If this were a real app,
            we would use a secure API to get your bank account information and
            notify you when bills have been paid.
          </p>
        </div>

        <div>
          <Calender billsByDay={mockBillsByDay} />
        </div>
      </main>
    </>
  );
}
