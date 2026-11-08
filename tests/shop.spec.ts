import { test, expect } from "@playwright/test";
test("portada responsive y capturas del DOM", async ({ page }) => {
  for (const [w, h] of [
    [1536, 1024],
    [768, 1024],
    [390, 844],
  ]) {
    await page.setViewportSize({ width: w, height: h });
    await page.goto("/");
    await page.evaluate(() => document.fonts.ready);
    await expect(
      page.getByRole("heading", { name: "Tu tarta. A tu manera." }),
    ).toBeVisible();
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    await page.screenshot({ path: `evidence/home-${w}.png`, fullPage: false });
    await page.screenshot({ path: `evidence/home-${w}-full.png`, fullPage: true });
  }
});
test("configuración, edición, persistencia, validación y consulta demo", async ({
  page,
}) => {
  await page.goto("/");
  await page
    .getByRole("button", { name: "Elegir", exact: true })
    .first()
    .click();
  await page.getByLabel("Mensaje sobre la tarta").fill("<b>Feliz día</b>");
  await page.getByLabel("Cantidad", { exact: true }).fill("2");
  await page.getByRole("button", { name: /Añadir a la cesta/ }).click();
  await page.getByRole("button", { name: "Cesta, 2 tartas" }).click();
  await expect(page.locator(".total")).toContainText("64,00");
  await expect(page.getByText(/<b>Feliz día<\/b>/)).toBeVisible();
  await page.reload();
  await page.getByRole("button", { name: "Cesta, 2 tartas" }).click();
  await page.getByRole("button", { name: "Editar", exact: true }).click();
  await page.getByLabel("Tamaño").selectOption("demo-chocolate-12");
  await page.getByRole("button", { name: /Guardar cambios/ }).click();
  await page.getByRole("button", { name: "Cesta, 2 tartas" }).click();
  await expect(page.getByText(/12 raciones/)).toBeVisible();
  await page.getByRole("button", { name: "Restar Chocolate" }).click();
  await page.getByLabel("Fecha", { exact: true }).selectOption({ index: 2 });
  await page.getByLabel("Entiendo que").check();
  await page.getByRole("button", { name: "Simular pedido" }).click();
  await expect(
    page.getByRole("heading", { name: "Pedido de demostración" }),
  ).toBeVisible();
  await page.screenshot({
    path: "evidence/demo-confirmation.png",
    fullPage: true,
  });
  await page.reload();
  await expect(
    page.getByRole("heading", { name: "Pedido de demostración" }),
  ).toBeVisible();
  const url = page.url();
  await page.goto(url.replace(/.$/, "z"));
  await page.reload();
  await expect(page.getByText("No hay acceso a este pedido")).toBeVisible();
});
test("filtro vacío y presupuesto independiente guardado", async ({ page }) => {
  await page.goto("/");
  await page
    .getByRole("button", { name: "Personalizadas", exact: true })
    .last()
    .click();
  await expect(
    page.getByText("No hay tartas en esta categoría."),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Solicitar presupuesto", exact: true })
    .click();
  await page.getByLabel("Fecha deseada").fill("2026-11-20");
  await page.getByLabel("Raciones orientativas").fill("20");
  await page
    .getByLabel("Describe tu idea")
    .fill("Tarta demo para una celebración");
  await page
    .getByRole("button", { name: "Solicitar presupuesto demo" })
    .click();
  await expect(page.getByText(/Solicitud demo guardada/)).toBeVisible();
  expect(
    await page.evaluate(
      () => JSON.parse(localStorage.getItem("vainelu-orders") || "[]").length,
    ),
  ).toBe(0);
  await page.goto("/admin");
  await expect(page.getByText("Tarta demo para una celebración")).toBeVisible();
});
test("API rechaza origen ajeno, recalcula importes y bloquea fecha inválida", async ({
  request,
}) => {
  const line = {
    productId: "demo-chocolate",
    variantId: "demo-chocolate-8",
    quantity: 1,
    message: "",
    price_cents: 1,
  };
  const headers = { origin: "http://localhost:3000" };
  expect(
    (
      await request.post("/api/demo", {
        data: { lines: [line] },
        headers: { origin: "https://otro.example" },
      })
    ).status(),
  ).toBe(403);
  const r = await request.post("/api/demo", {
    data: { lines: [line] },
    headers,
  });
  expect((await r.json()).total).toBe(3200);
  expect(
    (
      await request.post("/api/demo", {
        data: { lines: [line], date: "2020-01-01", slot: "demo-pickup-1200" },
        headers,
      })
    ).status(),
  ).toBe(400);
});
test("líneas diferentes, eliminación, cierre local y administración", async ({
  page,
}) => {
  await page.goto("/");
  for (const msg of ["Uno", "Dos"]) {
    await page
      .getByRole("button", { name: "Elegir", exact: true })
      .first()
      .click();
    await page.getByLabel("Mensaje sobre la tarta").fill(msg);
    await page.getByRole("button", { name: /Añadir a la cesta/ }).click();
  }
  await page.getByRole("button", { name: "Cesta, 2 tartas" }).click();
  await expect(page.locator(".cart-line")).toHaveCount(2);
  await page
    .getByRole("button", { name: "Eliminar Chocolate" })
    .first()
    .click();
  await expect(page.locator(".cart-line")).toHaveCount(1);
  const selected = await page
    .getByLabel("Fecha", { exact: true })
    .locator("option")
    .nth(3)
    .getAttribute("value");
  await page.getByLabel("Fecha", { exact: true }).selectOption(selected!);
  await page.getByLabel("Entiendo que").check();
  await page.evaluate(
    (d) => localStorage.setItem("vainelu-closed", d!),
    selected,
  );
  await page.getByRole("button", { name: "Simular pedido" }).click();
  await expect(page.locator(".error")).toContainText("La fecha está cerrada");
  await page.getByRole("button", { name: "Eliminar Chocolate" }).click();
  await expect(page.getByText("Aún no has elegido tu tarta.")).toBeVisible();
});
test("endpoints conectados cerrados sin configuración", async ({ request }) => {
  expect(
    (await request.post("/api/stripe/webhook", { data: "{}" })).status(),
  ).toBe(503);
  expect((await request.post("/api/reconcile")).status()).toBe(401);
});
