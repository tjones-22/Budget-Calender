import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { buildBackendUrl } from "@/app/lib/backend";

const backendUrl = buildBackendUrl("/api/login/logout");

export async function POST() {
  const cookieStore = await cookies();
  const session = cookieStore.get("session")?.value;

  if (session) {
    await fetch(backendUrl, {
      method: "POST",
      headers: {
        "x-session-id": session,
      },
    });
  }

  const response = NextResponse.json({ message: "Logged out" });
  response.cookies.set("session", "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  });
  return response;
}
