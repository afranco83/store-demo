import { expect, test } from "@playwright/test";

test("loads the home page", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByRole("heading", { name: "Streetwear con estilo" })).toBeVisible();
});

test("loads the catalog page", async ({ page }) => {
  await page.goto("/products");

  await expect(page.getByRole("navigation", { name: "Filtrar por categoría" })).toBeVisible();
});

test("loads a product detail page from the catalog", async ({ page }) => {
  await page.goto("/products");

  const firstProductLink = page.locator("main a[href^='/products/']").first();
  await firstProductLink.click();
  // Espera la navegación explícitamente: la card del listado y la página de
  // detalle comparten el mismo texto de botón ("Añadir al carrito"), así que
  // buscarlo antes de que la navegación termine es ambiguo (matchea las 15
  // cards del listado a la vez).
  await page.waitForURL(/\/products\/.+/);

  await expect(page.getByRole("button", { name: "Añadir al carrito" })).toBeVisible();
});
