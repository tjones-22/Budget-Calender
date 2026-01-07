import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { buildBackendUrl } from "@/app/lib/backend";

const backendUrl = buildBackendUrl("/api/groups/invites/respond");

export async function POST(request: Request) {
  const cookieStore = await cookies();
  const session = cookieStore.get("session")?.value;
  if (!session) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const body = await request.text();
  const response = await fetch(backendUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-session-id": session,
    },
    body,
  });
  const data = await response.json();
  return NextResponse.json(data, { status: response.status });
}
