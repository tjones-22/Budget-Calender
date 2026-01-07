import { NextResponse } from "next/server";
import { buildBackendUrl } from "@/app/lib/backend";

const backendUrl = buildBackendUrl("/api/groups/members/update");

export async function POST(request: Request) {
  const sessionCookie = request.headers.get("cookie") ?? "";
  let sessionId = "";
  if (sessionCookie) {
    const match = sessionCookie
      .split(";")
      .map((part) => part.trim())
      .find((part) => part.startsWith("session="));
    if (match) {
      sessionId = decodeURIComponent(match.slice("session=".length));
    }
  }

  let payload: unknown = null;
  try {
    payload = await request.json();
  } catch {
    payload = null;
  }

  const response = await fetch(backendUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(sessionId ? { "x-session-id": sessionId } : {}),
    },
    body: JSON.stringify(payload ?? {}),
  });

  const data = await response.json();
  return NextResponse.json(data, { status: response.status });
}
