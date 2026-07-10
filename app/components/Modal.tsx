"use client";

import { usePathname, useRouter } from "next/navigation";
import type { ReactNode } from "react";


type ModalProps = {
  children: ReactNode;
  pathname: string;
};

export default function Modal({ children, pathname }: ModalProps) {
  const currentPathname = usePathname();
  const router = useRouter();

  if (currentPathname !== pathname) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-lg rounded-lg bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3">
          

          <button
            type="button"
            onClick={() => router.replace("/dashboard")}
            aria-label="Close modal"
            className="flex h-8 w-8 items-center justify-center rounded-md text-xl leading-none text-gray-500 hover:bg-gray-100 hover:text-gray-900"
          >
            &times;
          </button>
        </div>

        <div className="p-4">{children}</div>
      </div>
    </div>
  );
}
