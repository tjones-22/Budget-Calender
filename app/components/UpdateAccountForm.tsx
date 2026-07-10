"use client";

import { useActionState } from "react";
import type { UpdateUserProfileFormState } from "../../types/types";
import { updateUserProfileAction } from "../actions/user-actions";
import SubmitButton from "./FormSubmitButton";

type UpdateAccountFormProps = {
  defaultName?: string | null;
  defaultEmail?: string | null;
  defaultUsername?: string | null;
};

export default function UpdateAccountForm({
  defaultName,
  defaultEmail,
  defaultUsername,
}: UpdateAccountFormProps) {
  const [state, formAction] = useActionState<UpdateUserProfileFormState, FormData>(
    updateUserProfileAction,
    {},
  );

  return (
    <form action={formAction} className="mt-6 flex flex-col gap-3">
      {state.success ? (
        <p className="rounded-md bg-green-100 p-3 text-sm font-medium text-green-800">
          {state.success}
        </p>
      ) : null}

      {state.error ? (
        <p className="rounded-md bg-red-100 p-3 text-sm font-medium text-red-800">
          {state.error}
        </p>
      ) : null}

      <label className="font-semibold" htmlFor="name">
        Name:
      </label>
      <input
        id="name"
        className="rounded-md border p-2"
        type="text"
        name="name"
        defaultValue={defaultName ?? ""}
        required
      />

      <label className="font-semibold" htmlFor="username">
        Username:
      </label>
      <input
        id="username"
        className="rounded-md border p-2"
        type="text"
        name="username"
        defaultValue={defaultUsername ?? ""}
      />

      <label className="font-semibold" htmlFor="password">
        Password:
      </label>
      <input
        id="password"
        className="rounded-md border p-2"
        type="password"
        name="password"
        
      />

      <label className="font-semibold" htmlFor="email">
        Email:
      </label>
      <input
        id="email"
        className="rounded-md border p-2"
        type="email"
        name="email"
        defaultValue={defaultEmail ?? ""}
      />

      <SubmitButton
        pendingText="Updating..."
        className="mt-4 rounded-md bg-blue-950 px-4 py-2 font-semibold text-yellow-300 hover:bg-blue-900 disabled:opacity-70"
      >
        Submit
      </SubmitButton>
    </form>
  );
}
