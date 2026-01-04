import Link from "next/link";
import Login from "../components/LoginForm";


export default function Home() {
  return (
     <div className="min-h-screen bg-slate-50">
      <div className=" flex flex-row justify-between items-center w-full h-auto p-in">
        <Link
          className="text-left mt-[10vh] text-4xl p-8 transition-all duration-300 ease-out hover:text-yellow-500 hover:tracking-widest hover:underline"
          href={"/"}
        >
          <span aria-hidden="true" className="mr-2 inline-block text-2xl">
            ←
          </span>
          Back to Home
        </Link>

        <Link
          className="text-left mt-[10vh] text-4xl p-8 transition-all duration-300 ease-out hover:text-yellow-500 hover:tracking-widest hover:underline"
          href={"/signup"}
        >
          Sign Up
          <span aria-hidden="true" className="ml-2 inline-block text-2xl">
            →
          </span>
        </Link>
      </div>
      <Login />

      
    </div>
  );
}
