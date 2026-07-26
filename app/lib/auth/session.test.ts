import { beforeEach, describe, expect, it, vi } from "vitest";

const authMock = vi.hoisted(() => vi.fn());
const redirectMock = vi.hoisted(() => vi.fn());

vi.mock("@/auth", () => ({
  auth: authMock,
}));

vi.mock("next/navigation", () => ({
  redirect: redirectMock,
}));

import { getCurrentUser, requireUser } from "./session";

describe("session helpers", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns the current session user", async () => {
    authMock.mockResolvedValue({
      user: {
        id: "user-1",
        name: "John Doe",
      },
    });

    await expect(getCurrentUser()).resolves.toEqual({
      id: "user-1",
      name: "John Doe",
    });
  });

  it("returns null when no user is signed in", async () => {
    authMock.mockResolvedValue(null);

    await expect(getCurrentUser()).resolves.toBeNull();
  });

  it("redirects to login when a required user is missing", async () => {
    authMock.mockResolvedValue(null);

    await requireUser();

    expect(redirectMock).toHaveBeenCalledWith("/login");
  });
});
