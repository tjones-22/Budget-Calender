"use server";

import { redirect } from "next/navigation";

export type LoginState = {
  error: string;
  success: string;
};

export async function loginAction(
  _prevState: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const usernameValue = formData.get("username");
  const passwordValue = formData.get("password");

  const username = typeof usernameValue === "string" ? usernameValue.trim() : "";
  const password = typeof passwordValue === "string" ? passwordValue : "";

  if (!username || !password) {
    return { error: "Username and password are required", success: "" };
  }

  const query = new URLSearchParams({ username, password }).toString();

  try {
    const response = await fetch(
      `http://localhost:3001/api/signup?${query}`,
      {
        method: "GET",
      },
    );

    if (!response.ok) {
      return {
        error: `Error: ${response.statusText}`,
        success: "",
      };
    }
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Network error",
      success: "",
    };
  }

  redirect("/");
}
