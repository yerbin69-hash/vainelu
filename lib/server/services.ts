import "server-only";
import { createClient } from "@supabase/supabase-js";
import Stripe from "stripe";
import { createHash, timingSafeEqual } from "node:crypto";
export function testServices() {
  if (process.env.APP_MODE !== "test")
    throw Error("Servicios conectados disponibles solo en test.");
  const key = process.env.STRIPE_SECRET_KEY;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const secret = process.env.SUPABASE_SECRET_KEY;
  if (!key || !/^([sr]k)_test_/.test(key) || !url || !secret)
    throw Error("Faltan credenciales de pruebas.");
  return {
    stripe: new Stripe(key),
    db: createClient(url, secret, {
      auth: { persistSession: false, autoRefreshToken: false },
    }),
  };
}
export const hashToken = (token: string) =>
  createHash("sha256").update(token).digest("hex");
export function authorizedJob(header: string | null) {
  const secret = process.env.JOBS_AUTH_SECRET;
  if (!secret || secret.length < 32 || !header) return false;
  const a = Buffer.from(header),
    b = Buffer.from(`Bearer ${secret}`);
  return a.length === b.length && timingSafeEqual(a, b);
}
export async function requireStaff(accessToken: string) {
  const { db } = testServices();
  const { data, error } = await db.auth.getUser(accessToken);
  if (error || !data.user) throw Error("Unauthorized");
  const member = await db
    .from("staff_members")
    .select("user_id")
    .eq("user_id", data.user.id)
    .eq("active", true)
    .maybeSingle();
  if (member.error || !member.data) throw Error("Forbidden");
  return { db, user: data.user };
}
export async function applySession(
  session: Stripe.Checkout.Session,
  eventId: string,
) {
  const { db } = testServices();
  if (session.livemode) throw Error("Live mode rejected");
  if (session.payment_status !== "paid") return;
  const oid = session.metadata?.order_id;
  if (!oid || !session.amount_total || !session.currency)
    throw Error("Missing payment association");
  const { error } = await db.rpc("apply_paid_session", {
    p_event: eventId,
    p_session: session.id,
    p_order: oid,
    p_amount: session.amount_total,
    p_currency: session.currency,
    p_live: session.livemode,
  });
  if (error) throw Error("Payment persistence failed");
}
// Sin exponer una ruta de checkout hasta verificar migración, permisos y configuración.
// Llamar solo DESPUÉS de create_reserved_order; conservar la misma clave al reintentar.
export async function createTestSession(orderId: string) {
  if (process.env.PAYMENTS_ENABLED !== "true")
    throw Error("Pagos de prueba desactivados.");
  const { stripe, db } = testServices();
  const { data: order, error } = await db
    .from("orders")
    .select("id,total_cents,currency,created_at")
    .eq("id", orderId)
    .single();
  if (error || !order) throw Error("Order unavailable");
  const configuration = process.env.STRIPE_CARD_PAYMENT_CONFIGURATION;
  const origin = process.env.NEXT_PUBLIC_APP_URL;
  if (!configuration || !origin)
    throw Error("Falta configuración Stripe limitada a tarjetas o APP_URL.");
  const session = await stripe.checkout.sessions.create(
    {
      mode: "payment",
      expires_at: Math.floor(Date.parse(order.created_at) / 1000) + 1800,
      payment_method_configuration: configuration,
      integration_identifier: "vainelu_test_qfzkmwpa",
      client_reference_id: order.id,
      metadata: { order_id: order.id },
      line_items: [
        {
          price_data: {
            currency: order.currency,
            unit_amount: order.total_cents,
            product_data: { name: "Pedido Vainelú · pruebas" },
          },
          quantity: 1,
        },
      ],
      success_url: `${origin}/?payment=return`,
      cancel_url: `${origin}/?payment=cancelled`,
    },
    { idempotencyKey: `checkout:${order.id}` },
  );
  if (session.livemode) throw Error("Live session rejected");
  const result = await db
    .from("payment_attempts")
    .update({
      session_id: session.id,
      state: "open",
      expires_at: new Date(session.expires_at * 1000).toISOString(),
    })
    .eq("order_id", order.id);
  if (result.error)
    throw Error(
      "Session binding failed; retain capacity and retry same operation.",
    );
  const hold = await db
    .from("capacity_reservations")
    .update({ expires_at: new Date(session.expires_at * 1000).toISOString() })
    .eq("order_id", order.id)
    .eq("state", "held");
  if (hold.error) throw Error("Hold alignment failed; retain capacity.");
  return session.url;
}
export async function reconcile() {
  const { stripe, db } = testServices();
  const attempts = await db
    .from("payment_attempts")
    .select("order_id,session_id,expires_at")
    .in("state", ["open", "creating"])
    .limit(100);
  if (attempts.error) throw Error("Database unavailable");
  let processed = 0,
    retained = 0;
  for (const a of attempts.data || []) {
    // Una sesión no vinculada requiere repetir createTestSession con la misma clave.
    if (!a.session_id) {
      retained++;
      continue;
    }
    try {
      let s = await stripe.checkout.sessions.retrieve(a.session_id);
      if (s.livemode) throw Error("Mode mismatch");
      if (s.payment_status === "paid") {
        await applySession(s, `reconcile:${s.id}:paid`);
        processed++;
        continue;
      }
      if (
        s.status === "open" &&
        a.expires_at &&
        Date.parse(a.expires_at) <= Date.now()
      )
        s = await stripe.checkout.sessions.expire(s.id);
      if (s.status === "expired" && s.payment_status === "unpaid") {
        const r = await db.rpc("release_expired_session", { p_session: s.id });
        if (r.error) throw r.error;
        processed++;
      } else retained++;
    } catch {
      retained++;
    }
  }
  return { processed, retained };
}
