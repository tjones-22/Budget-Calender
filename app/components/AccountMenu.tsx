"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { signOutAction } from "../actions/user-actions";
import SubmitButton from "./FormSubmitButton";

export default function AccountMenu({
  image,
  name,
}: {
  image?: string | null;
  name: string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        aria-expanded={open}
        aria-haspopup="menu"
        className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-full border border-gray-600 bg-gray-800 text-sm font-semibold text-yellow-300 hover:ring-2 hover:ring-yellow-300"
      >
        {image ? (
          <Image
            src={image}
            width={48}
            height={48}
            alt={`${name} profile picture`}
            className="h-full w-full object-cover"
          />
        ) : (
          name.charAt(0).toUpperCase()
        )}
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 z-50 mt-2 w-48 rounded-md border border-gray-700 bg-white py-2 text-gray-950 shadow-lg"
        >
          <Link
            href="/account"
            role="menuitem"
            className="block px-4 py-2 text-sm hover:bg-gray-100"
            onClick={() => setOpen(false)}
          >
            Account
          </Link>

          <form action={signOutAction}>
            <SubmitButton className="block w-full px-4 py-2 text-left text-sm text-red-700 hover:bg-red-50">
              Sign out
            </SubmitButton>
          </form>
        </div>
      )}
    </div>
  );
}
