"use server";

import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import { buildBackendUrl } from "@/app/lib/backend";

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
  const initialFundsValue = formData.get("initialFunds");
  const initialSavingsValue = formData.get("initialSavings");
  const notifyBillsValue = formData.get("notifyBills");
  const notifyPaydaysValue = formData.get("notifyPaydays");

  const name = typeof nameValue === "string" ? nameValue.trim() : "";
  const username = typeof usernameValue === "string" ? usernameValue.trim() : "";
  const password = typeof passwordValue === "string" ? passwordValue : "";
  const phone = typeof phoneValue === "string" ? phoneValue.trim() : "";
  const initialFundsText =
    typeof initialFundsValue === "string" ? initialFundsValue.trim() : "";
  const initialFunds = Number(initialFundsText);
  const initialSavingsText =
    typeof initialSavingsValue === "string" ? initialSavingsValue.trim() : "";
  const initialSavings = Number(initialSavingsText);
  const notifyBills = notifyBillsValue === "on";
  const notifyPaydays = notifyPaydaysValue === "on";

  if (!name || !username || !password || !phone) {
    return { error: "Please fill out all fields", success: "" };
  }

  if (password.length < 8) {
    return { error: "Password must be longer than 8 characters", success: "" };
  }

  if (!initialFundsText || Number.isNaN(initialFunds)) {
    return { error: "Initial funds must be a valid number", success: "" };
  }
  if (!initialSavingsText || Number.isNaN(initialSavings)) {
    return { error: "Initial savings must be a valid number", success: "" };
  }

  const hashedPassword = await bcrypt.hash(password, 12);

  const backendUrl = buildBackendUrl("/api/signup");

  try {
    const response = await fetch(backendUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name,
        username,
        password: hashedPassword,
        phone,
        initialFunds,
        initialSavings,
        notifyBills,
        notifyPaydays,
      }),
    });

    if (!response.ok) {
      let errorMessage = `Error: ${response.statusText}`;
      try {
        const data = (await response.json()) as { message?: string };
        if (data?.message) {
          errorMessage = data.message;
        }
      } catch {
        // Ignore JSON parsing errors and fall back to status text.
      }
      return {
        error: errorMessage,
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
