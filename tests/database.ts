import EmbeddedPostgres from "embedded-postgres";
import { Client } from "pg";
import { readFile } from "node:fs/promises";
import { randomUUID, createHash } from "node:crypto";
import assert from "node:assert/strict";
async function main() {
  const pg = new EmbeddedPostgres({
    databaseDir: ".pg-test",
    user: "postgres",
    password: "local-test-only",
    port: 55439,
    persistent: false,
    onLog: () => {},
    onError: () => {},
  });
  let clients: Client[] = [];
  try {
    await pg.initialise();
    await pg.start();
    const connect = async () => {
      const c = new Client({
        host: "127.0.0.1",
        port: 55439,
        user: "postgres",
        password: "local-test-only",
        database: "postgres",
      });
      await c.connect();
      clients.push(c);
      return c;
    };
    const db = await connect();
    await db.query(
      `create role anon;create role authenticated;create role service_role;create schema auth;create table auth.users(id uuid primary key);create function auth.uid() returns uuid language sql as $$select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid$$;create schema storage;create table storage.buckets(id text primary key,name text,public boolean);`,
    );
    await db.query(await readFile("supabase/migrations/001_core.sql", "utf8"));
    console.log(
      "PASS SQL: migration applied on PostgreSQL " +
        (await db.query("show server_version")).rows[0].server_version +
        "; auth/storage schemas are local stubs, not Supabase integration.",
    );
    const p = randomUUID(),
      v = randomUUID(),
      slot = randomUUID();
    const token = "demo-private-token-for-local-test";
    const hash = createHash("sha256").update(token).digest("hex");
    const day = (
      await db.query(
        "select ((now() at time zone 'Europe/Madrid')::date+5)::text d",
      )
    ).rows[0].d;
    await db.query(
      "insert into products(id,slug,name,published,food_verified) values($1,$2,$3,true,true)",
      [p, "chocolate", "Chocolate"],
    );
    await db.query(
      "insert into product_variants(id,product_id,label,servings,price_cents) values($1,$2,$3,8,3200)",
      [v, p, "8 raciones"],
    );
    await db.query("insert into service_days(date,capacity) values($1,8)", [
      day,
    ]);
    await db.query(
      "insert into fulfillment_slots(id,date,start_at,end_at) values($1,$2,($2::date+time '12:00') at time zone 'Europe/Madrid',($2::date+time '13:00') at time zone 'Europe/Madrid')",
      [slot, day],
    );
    const lines = JSON.stringify([
      {
        productId: p,
        variantId: v,
        quantity: 1,
        message: "Hola",
        price_cents: 1,
      },
    ]);
    const reserve = async (c: Client, key: string, amount = 3200) =>
      c.query("select create_reserved_order($1,$2,$3,$4,$5,$6,$7) id", [
        key,
        hash,
        lines,
        day,
        slot,
        JSON.stringify({ name: "Demo" }),
        amount,
      ]);
    await assert.rejects(() => reserve(db, randomUUID(), 1), /price changed/);
    console.log("PASS PRE: manipulated accepted total rejected.");
    const a = await connect(),
      b = await connect();
    const keys = [randomUUID(), randomUUID()];
    const result = await Promise.allSettled([
      reserve(a, keys[0]),
      reserve(b, keys[1]),
    ]);
    assert.equal(result.filter((r) => r.status === "fulfilled").length, 1);
    const idx = result.findIndex((r) => r.status === "fulfilled");
    const id = (result[idx] as PromiseFulfilledResult<any>).value.rows[0].id;
    console.log(
      "PASS CUP: two concurrent connections compete for eight servings; one succeeds.",
    );
    assert.equal((await reserve(db, keys[idx])).rows[0].id, id);
    await assert.rejects(
      () => reserve(db, keys[idx], 4200),
      /idempotency conflict/,
    );
    console.log(
      "PASS RED: duplicate operation returns same order; changed payload rejected.",
    );
    assert.equal(
      (await db.query("select count(*)::int n from orders")).rows[0].n,
      1,
    );
    const good = await db.query("select guest_order($1,$2) data", [id, hash]);
    assert.equal(good.rows[0].data.id, id);
    assert.equal(
      (await db.query("select guest_order($1,$2) data", [id, "wrong"])).rows[0]
        .data,
      null,
    );
    console.log("PASS ORD: wrong token hash returns no order.");
    await db.query(
      "update payment_attempts set session_id=$1,state=$2 where order_id=$3",
      ["cs_local_test", "open", id],
    );
    await assert.rejects(
      () =>
        db.query(
          "select apply_paid_session('evt_bad','cs_local_test',$1,1,'eur',false)",
          [id],
        ),
      /payment mismatch/,
    );
    await db.query(
      "select apply_paid_session('evt_one','cs_local_test',$1,3200,'eur',false)",
      [id],
    );
    await db.query(
      "select apply_paid_session('evt_one','cs_local_test',$1,3200,'eur',false)",
      [id],
    );
    await db.query(
      "select apply_paid_session('evt_two','cs_local_test',$1,3200,'eur',false)",
      [id],
    );
    await db.query("select release_expired_session('cs_local_test')");
    assert.equal(
      (await db.query("select status from orders where id=$1", [id])).rows[0]
        .status,
      "confirmed",
    );
    assert.equal(
      (await db.query("select count(*)::int n from notification_outbox"))
        .rows[0].n,
      1,
    );
    assert.equal(
      (
        await db.query(
          "select state from capacity_reservations where order_id=$1",
          [id],
        )
      ).rows[0].state,
      "committed",
    );
    console.log(
      "PASS PAG: repeated events do not duplicate fulfillment or notification; release cannot reverse paid reservation.",
    );
    await db.query("update products set name=$1 where id=$2", [
      "Nuevo nombre",
      p,
    ]);
    assert.equal(
      (
        await db.query("select snapshot from order_items where order_id=$1", [
          id,
        ])
      ).rows[0].snapshot.name,
      "Chocolate",
    );
    console.log("PASS OPE: catalog changes preserve historical snapshot.");
    // A second date exercises release and late paid events.
    await db.query("update service_days set capacity=16 where date=$1", [day]);
    const late = (await reserve(db, randomUUID())).rows[0].id;
    await db.query(
      "update payment_attempts set session_id='cs_late',state='open' where order_id=$1",
      [late],
    );
    await db.query("select release_expired_session('cs_late')");
    await db.query("select release_expired_session('cs_late')");
    await db.query(
      "select apply_paid_session('evt_late','cs_late',$1,3200,'eur',false)",
      [late],
    );
    assert.equal(
      (await db.query("select status from orders where id=$1", [late])).rows[0]
        .status,
      "review",
    );
    console.log(
      "PASS RES/PAG: release idempotent; payment after release requires review. Provider terminal state itself is NOT tested here.",
    );
    await db.query(
      "grant usage on schema public,auth to anon,authenticated;grant select on all tables in schema public to anon,authenticated",
    );
    await db.query("set role anon");
    assert.equal(
      (await db.query("select count(*)::int n from orders")).rows[0].n,
      0,
    );
    await assert.rejects(
      () => db.query("select guest_order($1,$2)", [id, hash]),
      /permission denied/,
    );
    await db.query("reset role");
    const uid = randomUUID();
    await db.query("insert into auth.users values($1)", [uid]);
    await db.query("insert into staff_members values($1,true)", [uid]);
    await db.query("select set_config('request.jwt.claim.sub',$1,false)", [
      uid,
    ]);
    await db.query("set role authenticated");
    assert.equal(
      (await db.query("select count(*)::int n from orders")).rows[0].n,
      2,
    );
    await db.query("reset role");
    await db.query("update staff_members set active=false where user_id=$1", [
      uid,
    ]);
    await db.query("set role authenticated");
    assert.equal(
      (await db.query("select count(*)::int n from orders")).rows[0].n,
      0,
    );
    await db.query("reset role");
    console.log(
      "PASS RLS: anonymous reads denied, staff reads allowed, revoked staff denied; no real Supabase JWT was used.",
    );
  } finally {
    for (const c of clients) await c.end();
    await pg.stop();
  }
}
main().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});
