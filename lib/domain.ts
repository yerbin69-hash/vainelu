import { DateTime } from "luxon";
import catalog from "../config/catalogo.demo.json";
import settings from "../config/demo.settings.json";
export const products = catalog.products;
type DemoProduct = (typeof products)[number];
export type CatalogProduct = Pick<
  DemoProduct,
  "id" | "name" | "description" | "category_ids" | "published_in_demo"
> & {
  photo: string;
  variants: (Pick<
    DemoProduct["variants"][number],
    "id" | "label" | "servings" | "price_cents"
  > & { available?: boolean })[];
};
export type PricedProduct = Pick<
  CatalogProduct,
  "id" | "name" | "published_in_demo" | "variants"
>;
export const money = (n: number) =>
  new Intl.NumberFormat("es-ES", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 2,
  }).format(n / 100);
export type Line = {
  productId: string;
  variantId: string;
  quantity: number;
  message: string;
};
export function price(
  lines: Line[],
  currentProducts: PricedProduct[] = products,
) {
  if (!Array.isArray(lines) || !lines.length || lines.length > 30)
    throw Error("La cesta está vacía o no es válida.");
  const items = lines.map((l) => {
    const p = currentProducts.find((p) => p.id === l.productId);
    const v = p?.variants.find((v) => v.id === l.variantId);
    if (
      !p ||
      !p.published_in_demo ||
      !v ||
      v.available === false ||
      !Number.isInteger(l.quantity) ||
      l.quantity < 1 ||
      l.quantity > 10 ||
      typeof l.message !== "string" ||
      l.message.length > 40
    )
      throw Error("Revisa las opciones y cantidades de la cesta.");
    return {
      ...l,
      name: p.name,
      variant: v.label,
      unit: v.price_cents,
      servings: v.servings,
      total: v.price_cents * l.quantity,
    };
  });
  return {
    items,
    total: items.reduce((s, l) => s + l.total, 0),
    servings: items.reduce((s, l) => s + l.servings * l.quantity, 0),
  };
}
export function validateDate(
  date: string,
  slot: string,
  now: DateTime = DateTime.utc(),
  closed: string[] = [],
) {
  const today = now.setZone(settings.time_zone).startOf("day");
  const selected = settings.availability.slots.find((s) => s.id === slot);
  if (!selected || !/^\d{4}-\d{2}-\d{2}$/.test(date))
    throw Error("Selecciona una fecha y una franja válidas.");
  const day = DateTime.fromISO(date, { zone: settings.time_zone });
  const start = DateTime.fromISO(`${date}T${selected.start_local}`, {
    zone: settings.time_zone,
  });
  if (
    !day.isValid ||
    day < today ||
    day.diff(today, "days").days >=
      settings.availability.booking_window.calendar_days ||
    [...settings.availability.closed_dates, ...closed].includes(date) ||
    start.toMillis() - now.toMillis() <
      settings.availability.minimum_notice.hours * 3600000
  )
    throw Error(
      "La fecha no está disponible. Se requieren 48 horas de antelación y un máximo de 30 fechas contando hoy.",
    );
  return start.toUTC().toISO();
}
export function availableDates(now: DateTime = DateTime.utc()) {
  return Array.from(
    { length: settings.availability.booking_window.calendar_days },
    (_, i) => now.setZone(settings.time_zone).plus({ days: i }).toISODate()!,
  ).filter((d) =>
    settings.availability.slots.some((s) => {
      try {
        validateDate(d, s.id, now);
        return true;
      } catch {
        return false;
      }
    }),
  );
}
export function requireDemo() {
  if ((process.env.APP_MODE || "demo") !== "demo")
    throw Error(
      "Integración de pruebas bloqueada: faltan servicios configurados y verificados. No se activa una demo como alternativa.",
    );
}
