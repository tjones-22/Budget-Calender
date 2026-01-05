import { NextResponse } from "next/server";

const backendUrl = "https://budget-calender.onrender.com/api/login";

export async function POST(request: Request) {
  let payload: { username?: string; password?: string } | null = null;
  try {
    payload = (await request.json()) as { username?: string; password?: string };
  } catch {
    payload = null;
  }

  const username = payload?.username?.trim() ?? "";
  const password = payload?.password ?? "";

  if (!username || !password) {
    return NextResponse.json(
      { message: "Username and password are required" },
      { status: 400 },
    );
  }

  let response: Response;
  try {
    response = await fetch(backendUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username, password }),
    });
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "Network error" },
      { status: 500 },
    );
  }

  let data: { message?: string; sessionId?: string; expiresAt?: number } | null = null;
  try {
    data = (await response.json()) as {
      message?: string;
      sessionId?: string;
      expiresAt?: number;
    };
  } catch {
    data = null;
  }

  if (!response.ok) {
    return NextResponse.json(
      { message: data?.message ?? response.statusText },
      { status: response.status },
    );
  }

  if (data?.message === "Invalid Credentials") {
    return NextResponse.json({ message: data.message }, { status: 401 });
  }

  const res = NextResponse.json({ message: "Logged in successfully" });
  if (data?.sessionId) {
    const maxAgeSeconds = data.expiresAt
      ? Math.max(0, Math.floor((data.expiresAt - Date.now()) / 1000))
      : 24 * 60 * 60;
    res.cookies.set("session", data.sessionId, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: maxAgeSeconds,
    });
  }

  return res;
}
