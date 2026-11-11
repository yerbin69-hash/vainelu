import { loadCatalog } from "../../../lib/server/catalog";
import settings from "../../../config/demo.settings.json";
import { NextRequest, NextResponse } from "next/server";
import {
  availableDates,
  price,
  requireDemo,
  validateDate,
} from "../../../lib/domain";
export async function GET() {
  try {
    requireDemo();
    return NextResponse.json({ dates: availableDates(), mode: "demo" });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 503 });
  }
}
export async function POST(req: NextRequest) {
  try {
    requireDemo();
    if (
      req.headers.get("origin") !==
      `${req.nextUrl.protocol}//${req.headers.get("host")}`
    )
      return NextResponse.json(
        { error: "Origen no permitido" },
        { status: 403 },
      );
    const body = await req.json();
    const summary = price(body.lines, await loadCatalog());
    if (body.date) validateDate(body.date, body.slot);
    if (summary.servings > settings.capacity.daily_limit)
      throw Error("El pedido supera las 80 raciones de capacidad demo.");
    return NextResponse.json({ ...summary, mode: "demo", realOrder: false });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 400 });
  }
}
