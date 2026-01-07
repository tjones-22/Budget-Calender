import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { buildBackendUrl } from "@/app/lib/backend";

const backendUrl = buildBackendUrl("/api/calendar");

export async function GET(request: Request) {
  const cookieStore = await cookies();
  const session = cookieStore.get("session")?.value;
  if (!session) {
    return NextResponse.json({ year: 0, month: 0, matrix: [] }, { status: 401 });
  }

  const url = new URL(request.url);
  const year = url.searchParams.get("year");
  const month = url.searchParams.get("month");
  const target = `${backendUrl}?year=${year ?? ""}&month=${month ?? ""}`;

  const response = await fetch(target, {
    headers: {
      "x-session-id": session,
    },
    cache: "no-store",
  });
  const data = await response.json();
  return NextResponse.json(data, { status: response.status });
}
