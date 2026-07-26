"use server";

import { signIn, signOut } from "@/auth";
import { AuthError } from "next-auth";
import { redirect } from "next/navigation";
import type {
  AuthFormState,
  UpdateUserProfileFormState,
} from "../../types/types";
import { requireUser } from "../lib/auth/session";
import {
  deleteUser,
  signUpWithUserCredentials,
  UpdateUserProfile,
} from "../lib/db/user-db";

function getStringValue(formData: FormData, key: string) {
  const value = formData.get(key);

  return typeof value === "string" ? value.trim() : "";
}

function getCredentials(formData: FormData) {
  return {
    username: getStringValue(formData, "username"),
    password: getStringValue(formData, "password"),
  };
}

async function signInWithGoogleRedirect(redirectTo: string) {
  await signIn("google", {
    redirectTo,
  });
}

export async function signInWithGoogleAction() {
  await signInWithGoogleRedirect("/dashboard");
}

export async function signUpWithGoogleAction() {
  await signInWithGoogleRedirect("/signup/addbankinfo");
}

export async function signOutAction() {
  await signOut({
    redirectTo: "/",
  });
}

export async function signUpWithCredentialsAction(formData: FormData) {
  const email = getStringValue(formData, "email");
  const name = getStringValue(formData, "name");
  const { username, password } = getCredentials(formData);

  if (!username || !password) {
    redirect("/signup?error=missing-fields");
  }

  const result = await signUpWithUserCredentials({
    email: email || undefined,
    name: name || undefined,
    username,
    password,
  });

  if ("error" in result) {
    redirect(
      `/signup?error=${encodeURIComponent(result.error ?? "signup-failed")}`,
    );
  }

  await signIn("credentials", {
    username,
    password,
    redirectTo: "/signup/addbankinfo",
  });
}

export async function signInWithCredentialsAction(
  _previousState: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const { username, password } = getCredentials(formData);

  if (!username || !password) {
    return { error: "Username and password are required" };
  }

  try {
    await signIn("credentials", {
      username,
      password,
      redirectTo: "/dashboard",
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return { error: "Invalid username or password" };
    }

    throw error;
  }

  return {};
}

export async function updateUserProfileAction(
  _previousState: UpdateUserProfileFormState,
  formData: FormData,
): Promise<UpdateUserProfileFormState> {
  const username = getStringValue(formData, "username");
  const password = getStringValue(formData, "password");
  const email = getStringValue(formData, "email");
  const name = getStringValue(formData, "name");

  if (!name) {
    return { error: "Name is required" };
  }

  const user = await requireUser();

  try {
    await UpdateUserProfile({
      username: username || undefined,
      name,
      password: password || undefined,
      email: email || undefined,
      userId: user.id,
    });
  } catch {
    return { error: "Could not update user profile" };
  }

  return { success: "User profile updated" };
}

export async function deleteUserAction() {
  const user = await requireUser();

  await deleteUser(user.id);

  redirect("/");
}
