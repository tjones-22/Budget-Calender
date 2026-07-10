import Loader from "@/app/components/Loader";

export default function Loading() {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="flex h-40 w-full max-w-lg items-center justify-center rounded-lg bg-white shadow-xl dark:bg-gray-900">
        <Loader />
      </div>
    </div>
  );
}