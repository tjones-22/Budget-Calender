import { beforeEach, describe, expect, it, vi } from "vitest";

const prismaMock = vi.hoisted(() => ({
  user: {
    create: vi.fn(),
    delete: vi.fn(),
    findUnique: vi.fn(),
    update: vi.fn(),
  },
}));

vi.mock("./prisma", () => ({
  prisma: prismaMock,
}));

import {
  deleteUser,
  getUserByEmail,
  getUserProfileById,
  loginWithUserCredentials,
  signUpWithUserCredentials,
} from "./user-db";

describe("user db helpers", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("looks up a user by email without selecting sensitive fields", async () => {
    prismaMock.user.findUnique.mockResolvedValue({ email: "test@example.com" });

    await getUserByEmail("test@example.com");

    expect(prismaMock.user.findUnique).toHaveBeenCalledWith({
      where: { email: "test@example.com" },
      select: {
        email: true,
      },
    });
  });

  it("prevents duplicate usernames during signup", async () => {
    prismaMock.user.findUnique.mockResolvedValueOnce({ id: "existing-user" });

    await expect(
      signUpWithUserCredentials({
        username: "johndoe",
        password: "password",
      }),
    ).resolves.toEqual({
      error: "Username is already taken",
    });

    expect(prismaMock.user.create).not.toHaveBeenCalled();
  });

  it("creates a credentials user with a starting bank row", async () => {
    prismaMock.user.findUnique.mockResolvedValue(null);
    prismaMock.user.create.mockResolvedValue({ id: "user-1" });

    await expect(
      signUpWithUserCredentials({
        email: "test@example.com",
        name: "John Doe",
        username: "johndoe",
        password: "password",
      }),
    ).resolves.toEqual({});

    expect(prismaMock.user.create).toHaveBeenCalledWith({
      data: {
        email: "test@example.com",
        name: "John Doe",
        username: "johndoe",
        password: expect.stringMatching(/^[a-f0-9]+:[a-f0-9]+$/),
        bank: {
          create: {
            savings: 0,
            currentBalance: 0,
          },
        },
      },
      select: {
        id: true,
      },
    });
  });

  it("returns null when credentials login has no password hash", async () => {
    prismaMock.user.findUnique.mockResolvedValue({
      id: "oauth-user",
      password: null,
    });

    await expect(
      loginWithUserCredentials({
        username: "oauth-user",
        password: "password",
      }),
    ).resolves.toBeNull();
  });

  it("selects only public account profile fields", async () => {
    await getUserProfileById("user-1");

    expect(prismaMock.user.findUnique).toHaveBeenCalledWith({
      where: { id: "user-1" },
      select: {
        name: true,
        email: true,
        username: true,
      },
    });
  });

  it("deletes a user by id", async () => {
    await deleteUser("user-1");

    expect(prismaMock.user.delete).toHaveBeenCalledWith({
      where: { id: "user-1" },
    });
  });
});
