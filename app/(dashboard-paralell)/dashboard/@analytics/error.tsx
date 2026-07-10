"use client";

import { useRouter } from "next/navigation";
import { startTransition } from "react";

export default function AnalyticsError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const router = useRouter();

  function retry() {
    startTransition(() => {
      router.refresh();
      reset();
    });
  }

  return (
    <div className="w-full rounded-lg border border-red-300 bg-red-50 p-4 text-red-900">
      <p className="font-semibold">There was an error getting your analytics.</p>

      <button
        type="button"
        onClick={retry}
        className="mt-4 rounded-md bg-red-700 px-4 py-2 text-sm font-semibold text-white hover:bg-red-800"
      >
        Retry
      </button>
    </div>
  );
}
