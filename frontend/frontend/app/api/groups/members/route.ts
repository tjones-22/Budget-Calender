import { NextResponse } from "next/server";
import { buildBackendUrl } from "@/app/lib/backend";

const backendUrl = buildBackendUrl("/api/groups/members");

export async function GET(request: Request) {
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

  const response = await fetch(backendUrl, {
    method: "GET",
    headers: sessionId ? { "x-session-id": sessionId } : undefined,
  });
  const data = await response.json();
  return NextResponse.json(data, { status: response.status });
}
