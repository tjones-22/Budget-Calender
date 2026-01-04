"use server";

import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";

export type SignupState = {
  error: string;
  success: string;
};

export async function signupAction(
  _prevState: SignupState,
  formData: FormData,
): Promise<SignupState> {
  const nameValue = formData.get("name");
  const usernameValue = formData.get("username");
  const passwordValue = formData.get("password");
  const phoneValue = formData.get("phone");

  const name = typeof nameValue === "string" ? nameValue.trim() : "";
  const username = typeof usernameValue === "string" ? usernameValue.trim() : "";
  const password = typeof passwordValue === "string" ? passwordValue : "";
  const phone = typeof phoneValue === "string" ? phoneValue.trim() : "";

  if (!name || !username || !password || !phone) {
    return { error: "Please fill out all fields", success: "" };
  }

  if (password.length < 8) {
    return { error: "Password must be longer than 8 characters", success: "" };
  }

  const hashedPassword = await bcrypt.hash(password, 12);

  try {
    const response = await fetch("http://localhost:3001/api/signup", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name,
        username,
        password: hashedPassword,
        phone,
      }),
    });

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

  redirect("/login");
}
