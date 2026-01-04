import Link from "next/link";
import SignUp from "../components/SignUpForm";
export default function Home() {
  return (
    <>
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
          href={"/login"}
        >
          Login
          <span aria-hidden="true" className="ml-2 inline-block text-2xl">
            →
          </span>
        </Link>
      </div>

      <SignUp />
    </>
  );
}
