import Loader from "@/app/components/Loader";

export default function Loading() {
  return(
    <div className="w-full h-[10vh] bg-black rounded-lg mb-4">
      <Loader />
    </div>
  );
}
