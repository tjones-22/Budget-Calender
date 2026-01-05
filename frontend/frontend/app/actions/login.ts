"use server";

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

  return {
    error: "Login is handled by the client form.",
    success: "",
  };
}
