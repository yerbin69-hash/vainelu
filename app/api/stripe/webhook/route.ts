import { NextRequest, NextResponse } from "next/server";
import { testServices, applySession } from "../../../../lib/server/services";
export async function POST(req: NextRequest) {
  let services;
  try {
    services = testServices();
  } catch {
    return NextResponse.json(
      { error: "Test integration unavailable" },
      { status: 503 },
    );
  }
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  const signature = req.headers.get("stripe-signature");
  if (!secret || !signature)
    return NextResponse.json({ error: "Signature required" }, { status: 400 });
  let event;
  try {
    event = services.stripe.webhooks.constructEvent(
      await req.text(),
      signature,
      secret,
    );
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }
  if (event.livemode)
    return NextResponse.json({ error: "Live event rejected" }, { status: 400 });
  try {
    if (
      event.type === "checkout.session.completed" ||
      event.type === "checkout.session.async_payment_succeeded"
    ) {
      const s = await services.stripe.checkout.sessions.retrieve(
        event.data.object.id,
      );
      await applySession(s, event.id);
    }
    return NextResponse.json({ received: true });
  } catch {
    return NextResponse.json({ error: "Retry required" }, { status: 500 });
  }
}
