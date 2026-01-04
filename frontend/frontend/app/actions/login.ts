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

  let response: Response;
  try {
    response = await fetch(`http://localhost:3001/api/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username, password }),
      credentials: "include",
    });
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Network error",
      success: "",
    };
  }

  if (!response.ok) {
    return {
      error: `Error: ${response.statusText}`,
      success: "",
    };
  }

  let resData: { message?: string } | null = null;
  try {
    resData = (await response.json()) as { message?: string };
  } catch {
    resData = null;
  }

  if (resData?.message === "Invalid Credentials") {
    return { error: resData.message, success: "" };
  }

  redirect("/");
}
