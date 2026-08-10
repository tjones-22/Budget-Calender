"use client";

import type { SubmitButtonProps } from "@/app/types/types";
import { useFormStatus } from "react-dom";

export default function SubmitButton({
  children,
  pendingText = "Loading...",
  className = "",
}: SubmitButtonProps) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className={className}
    >
      {pending ? pendingText : children}
    </button>
  );
}
