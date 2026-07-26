import { beforeEach, describe, expect, it, vi } from "vitest";

const AuthErrorMock = vi.hoisted(
  () =>
    class AuthError extends Error {
      constructor(message: string) {
        super(message);
        this.name = "AuthError";
      }
    },
);
const signInMock = vi.hoisted(() => vi.fn());
const signOutMock = vi.hoisted(() => vi.fn());
const redirectMock = vi.hoisted(() => vi.fn());
const requireUserMock = vi.hoisted(() => vi.fn());
const deleteUserMock = vi.hoisted(() => vi.fn());
const signUpWithUserCredentialsMock = vi.hoisted(() => vi.fn());
const updateUserProfileMock = vi.hoisted(() => vi.fn());

vi.mock("@/auth", () => ({
  signIn: signInMock,
  signOut: signOutMock,
}));

vi.mock("next-auth", () => ({
  AuthError: AuthErrorMock,
}));

vi.mock("next/navigation", () => ({
  redirect: redirectMock,
}));

vi.mock("../lib/auth/session", () => ({
  requireUser: requireUserMock,
}));

vi.mock("../lib/db/user-db", () => ({
  deleteUser: deleteUserMock,
  signUpWithUserCredentials: signUpWithUserCredentialsMock,
  UpdateUserProfile: updateUserProfileMock,
}));

import {
  deleteUserAction,
  signInWithCredentialsAction,
  signInWithGoogleAction,
  signOutAction,
  signUpWithCredentialsAction,
  signUpWithGoogleAction,
  updateUserProfileAction,
} from "./user-actions";

describe("user actions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    requireUserMock.mockResolvedValue({ id: "user-1" });
    signUpWithUserCredentialsMock.mockResolvedValue({});
  });

  it("starts Google sign in for existing users", async () => {
    await signInWithGoogleAction();

    expect(signInMock).toHaveBeenCalledWith("google", {
      redirectTo: "/dashboard",
    });
  });

  it("starts Google sign up through onboarding", async () => {
    await signUpWithGoogleAction();

    expect(signInMock).toHaveBeenCalledWith("google", {
      redirectTo: "/signup/addbankinfo",
    });
  });

  it("signs the user out to the home page", async () => {
    await signOutAction();

    expect(signOutMock).toHaveBeenCalledWith({
      redirectTo: "/",
    });
  });

  it("creates a credentials user and signs them in", async () => {
    const formData = new FormData();
    formData.set("email", "john@example.com");
    formData.set("name", "John Doe");
    formData.set("username", "johndoe");
    formData.set("password", "password");

    await signUpWithCredentialsAction(formData);

    expect(signUpWithUserCredentialsMock).toHaveBeenCalledWith({
      email: "john@example.com",
      name: "John Doe",
      username: "johndoe",
      password: "password",
    });
    expect(signInMock).toHaveBeenCalledWith("credentials", {
      username: "johndoe",
      password: "password",
      redirectTo: "/signup/addbankinfo",
    });
  });

  it("returns a validation error for missing credentials", async () => {
    const formData = new FormData();

    await signUpWithCredentialsAction(formData);

    expect(redirectMock).toHaveBeenCalledWith("/signup?error=missing-fields");
  });

  it("returns form state errors for missing sign-in credentials", async () => {
    const formData = new FormData();

    await expect(signInWithCredentialsAction({}, formData)).resolves.toEqual({
      error: "Username and password are required",
    });
  });

  it("returns an invalid credentials error for AuthError failures", async () => {
    signInMock.mockRejectedValue(new AuthErrorMock("CredentialsSignin"));
    const formData = new FormData();
    formData.set("username", "johndoe");
    formData.set("password", "wrong-password");

    await expect(signInWithCredentialsAction({}, formData)).resolves.toEqual({
      error: "Invalid username or password",
    });
  });

  it("updates the signed-in user's profile", async () => {
    const formData = new FormData();
    formData.set("name", "John Doe");
    formData.set("username", "johndoe");
    formData.set("email", "john@example.com");

    await expect(updateUserProfileAction({}, formData)).resolves.toEqual({
      success: "User profile updated",
    });
    expect(updateUserProfileMock).toHaveBeenCalledWith({
      username: "johndoe",
      name: "John Doe",
      password: undefined,
      email: "john@example.com",
      userId: "user-1",
    });
  });

  it("returns a validation error when profile name is missing", async () => {
    const formData = new FormData();

    await expect(updateUserProfileAction({}, formData)).resolves.toEqual({
      error: "Name is required",
    });
  });

  it("deletes the signed-in user and redirects home", async () => {
    await deleteUserAction();

    expect(deleteUserMock).toHaveBeenCalledWith("user-1");
    expect(redirectMock).toHaveBeenCalledWith("/");
  });
});
