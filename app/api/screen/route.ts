import { NextResponse } from "next/server";
import { anyLiveData, getScreen } from "@/lib/screen";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function GET(request: Request) {
  const force = new URL(request.url).searchParams.get("refresh") === "1";
  const data = await getScreen(force);
  return NextResponse.json({
    asOf: new Date().toISOString(),
    live: anyLiveData(data),
    count: data.length,
    companies: data,
  });
}
