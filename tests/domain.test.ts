import { test } from "node:test";
import assert from "node:assert/strict";
import { DateTime } from "luxon";
import { price, validateDate, requireDemo } from "../lib/domain";
const line = {
  productId: "demo-chocolate",
  variantId: "demo-chocolate-8",
  quantity: 2,
  message: "Hola",
};
test("el precio canónico ignora importes manipulados y conserva opciones", () => {
  const p = price([{ ...line, total: 1, price_cents: 1 } as typeof line]);
  assert.equal(p.total, 6400);
  assert.equal(p.servings, 16);
  assert.equal(p.items[0].message, "Hola");
});
test("rechaza variantes ajenas, cantidades fraccionarias y mensajes excesivos", () => {
  for (const l of [
    { ...line, variantId: "demo-pistacho-8" },
    { ...line, quantity: -1 },
    { ...line, quantity: 1.5 },
    { ...line, message: "a".repeat(41) },
  ])
    assert.throws(() => price([l]));
});
test("48 horas exactas y límite de horizonte en Madrid", () => {
  const now = DateTime.fromISO("2026-11-07T12:00:00", {
    zone: "Europe/Madrid",
  });
  assert.doesNotThrow(() =>
    validateDate("2026-11-09", "demo-pickup-1200", now),
  );
  assert.throws(() =>
    validateDate(
      "2026-11-09",
      "demo-pickup-1200",
      now.plus({ milliseconds: 1 }),
    ),
  );
  assert.doesNotThrow(() =>
    validateDate("2026-12-06", "demo-pickup-1200", now),
  );
  assert.throws(() => validateDate("2026-12-07", "demo-pickup-1200", now));
  assert.throws(() =>
    validateDate("2026-11-09", "demo-pickup-1200", now, ["2026-11-09"]),
  );
});
test("cambio de hora primavera: dos días naturales no equivalen a 48 horas", () => {
  const now = DateTime.fromISO("2026-03-27T12:00:00", {
    zone: "Europe/Madrid",
  });
  assert.throws(() => validateDate("2026-03-29", "demo-pickup-1200", now));
  assert.doesNotThrow(() =>
    validateDate("2026-03-29", "demo-pickup-1700", now),
  );
});
test("cambio de hora otoño: valida horas transcurridas", () => {
  const now = DateTime.fromISO("2026-10-23T13:00:00", {
    zone: "Europe/Madrid",
  });
  assert.doesNotThrow(() =>
    validateDate("2026-10-25", "demo-pickup-1200", now),
  );
  assert.throws(() =>
    validateDate(
      "2026-10-25",
      "demo-pickup-1200",
      now.plus({ milliseconds: 1 }),
    ),
  );
});
test("modo test nunca cae silenciosamente a demo", () => {
  process.env.APP_MODE = "test";
  assert.throws(requireDemo);
  delete process.env.APP_MODE;
  assert.doesNotThrow(requireDemo);
});
