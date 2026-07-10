import { getUsersBillsByDayForMonthAction } from "@/app/actions/bill-actions";
import Calender from "@/app/components/Calender";
import Link from "next/link";


export default async function CalenderPage(){
    const month = new Date();
    const billsByDay = await getUsersBillsByDayForMonthAction(
        month.getFullYear(),
        month.getMonth() + 1,
    );

    return(
        <>
        <Link href={"/dashboard"} className=" text-yellow-300 text-xl mb-25 hover:text-yellow-500 hover:tracking-wider hover-animation-timing">
        Back to Dashboard
      </Link>
        <Calender month={month} billsByDay={billsByDay} interactiveDays />
        </>
    );
}
