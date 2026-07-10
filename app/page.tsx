import Calender from "./components/Calender";
import { mockBillsByDay } from "./lib/mockBills";
import Link from "next/link";
export default function Home() {
  return (
    <>
      <div className="flex md:flex-row items-center justify-around min-w-full h-auto p-4 dark:bg-black dark:text-white bg-blue-950 text-yellow-300">
        <h1 className="fade-in font-bold  text-lg md:text-2xl dark:text-amber-700  ">
          Welcome to Budget Calender
        </h1>
        <div className="flex flex-row w-1/3  justify-evenly items-center text-lg ">
          
            <Link
              className="bg-gray-900 p-3 rounded-lg hover:bg-amber-700 hover-animation-timing"
              href={"/login"}
            >
              Login
            </Link>
          
          
            <Link
              className="bg-gray-900 p-3 rounded-lg hover:bg-amber-700 hover-animation-timing"
              href={"/signup"}
            >
              Sign Up
            </Link>
          
        </div>
      </div>
      <main className="homepage-main mt-4 dark:bg-gray-900 min-[1000px]:flex-row min-[1000px]:h- flex-col sm:min-h-screen sm:justify-around sm: items-center">
        <div className="md:w-2/4  sm:w-screen border  min-[1000px]:h-[40vh] p-4 mt-4  dark:bg-white text-black dark:text-gray-900">
          <div className="flex border-b-2 min-w-full">
            <h2 className="font-semibold min-[1000px]:text-3xl ">
              Manage your bills better in a calender view
            </h2>
          </div>
          <p className="min-[1000px]:text-2xl">
            To help you see what bills are coming up and when the next payday
            is. Budget Calender will display it all in a calender so it is
            easier to plan future purchases. It also allows you to see your
            current ballance in an day, week, and end of the month.
          </p>
          <p className="min-[1000px]:text-2xl">
            For this app, we have you enter in your savings and a hypothetical checking account where your bills pull money from. 
            If this were a real app we would use a secured API for getting your bank account information and notifying you when 
            bills have been paid.
          </p>
        </div>

        <div>
          <Calender billsByDay={mockBillsByDay} />
        </div>
      </main>
    </>
  );
}
