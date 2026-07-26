import { randomBytes, scrypt, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";
import type {
  LoginWithCredentialsInput,
  SignUpWithCredentialsInput,
  UpdateUserProfileDBInput,
} from "../../../types/types";
import { prisma } from "./prisma";

const scryptAsync = promisify(scrypt);

async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const derivedKey = (await scryptAsync(password, salt, 64)) as Buffer;

  return `${salt}:${derivedKey.toString("hex")}`;
}

async function verifyPassword(password: string, hashedPassword: string) {
  const [salt, storedKey] = hashedPassword.split(":");

  if (!salt || !storedKey) {
    return false;
  }

  const storedBuffer = Buffer.from(storedKey, "hex");
  const derivedKey = (await scryptAsync(password, salt, 64)) as Buffer;

  if (storedBuffer.length !== derivedKey.length) {
    return false;
  }

  return timingSafeEqual(storedBuffer, derivedKey);
}

export async function getUserByEmail(email: string) {
  return prisma.user.findUnique({
    where: { email },
    select: {
      email: true,
    },
  });
}

export async function signUpWithUserCredentials({
  email,
  name,
  username,
  password,
}: SignUpWithCredentialsInput) {
  const existingUsername = await prisma.user.findUnique({
    where: { username },
    select: {
      id: true,
    },
  });

  if (existingUsername) {
    return { error: "Username is already taken" };
  }

  if (email) {
    const existingEmail = await getUserByEmail(email);

    if (existingEmail) {
      return { error: "Email is already taken" };
    }
  }

  const hashedPassword = await hashPassword(password);

  await prisma.user.create({
    data: {
      email,
      name,
      username,
      password: hashedPassword,
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

  return {};
}

export async function loginWithUserCredentials({
  username,
  password,
}: LoginWithCredentialsInput) {
  const user = await prisma.user.findUnique({
    where: { username },
    select: {
      id: true,
      name: true,
      email: true,
      image: true,
      password: true,
    },
  });

  if (!user?.password) {
    return null;
  }

  const passwordMatches = await verifyPassword(password, user.password);

  if (!passwordMatches) {
    return null;
  }

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    image: user.image,
  };
}

export async function getUserProfileById(userId: string) {
  return prisma.user.findUnique({
    where: { id: userId },
    select: {
      name: true,
      email: true,
      username: true,
    },
  });
}

export async function UpdateUserProfile({
  username,
  name,
  password,
  email,
  userId,
}: UpdateUserProfileDBInput) {
  const hashedPassword = password ? await hashPassword(password) : undefined;

  await prisma.user.update({
    where: { id: userId },
    data: {
      username,
      password: hashedPassword,
      email,
      name,
    },
  });

  return { message: "user updated" };
}

export async function deleteUser(userId: string) {
  await prisma.user.delete({
    where: { id: userId },
  });
}
