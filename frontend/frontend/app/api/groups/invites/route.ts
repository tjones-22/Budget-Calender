import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { buildBackendUrl } from "@/app/lib/backend";

const backendUrl = buildBackendUrl("/api/groups/invites");

export async function GET() {
  const cookieStore = await cookies();
  const session = cookieStore.get("session")?.value;
  if (!session) {
    return NextResponse.json({ invites: [] }, { status: 401 });
  }

  const response = await fetch(backendUrl, {
    headers: {
      "x-session-id": session,
    },
  });
  const data = await response.json();
  return NextResponse.json(data, { status: response.status });
}
