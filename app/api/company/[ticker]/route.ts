import { NextResponse } from "next/server";
import { getCompany } from "@/lib/screen";

export const dynamic = "force-dynamic";
export const maxDuration = 30;

export async function GET(
  request: Request,
  { params }: { params: { ticker: string } },
) {
  const force = new URL(request.url).searchParams.get("refresh") === "1";
  const data = await getCompany(params.ticker, force);
  if (!data) {
    return NextResponse.json({ error: "Unknown ticker" }, { status: 404 });
  }
  return NextResponse.json(data);
}
