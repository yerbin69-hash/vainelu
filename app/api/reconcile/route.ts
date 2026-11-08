import { NextRequest, NextResponse } from "next/server";
import { authorizedJob, reconcile } from "../../../lib/server/services";
export async function POST(req: NextRequest) {
  if (!authorizedJob(req.headers.get("authorization")))
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    return NextResponse.json(await reconcile());
  } catch {
    return NextResponse.json(
      { error: "Test services unavailable" },
      { status: 503 },
    );
  }
}
