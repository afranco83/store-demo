import { expect, test } from "@playwright/test";

test("loads the home page", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByRole("heading", { name: "Store Demo" })).toBeVisible();
});

test("loads the catalog page", async ({ page }) => {
  await page.goto("/products");

  await expect(page.getByRole("navigation", { name: "Filtrar por categoría" })).toBeVisible();
});

test("loads a product detail page from the catalog", async ({ page }) => {
  await page.goto("/products");

  const firstProductLink = page.locator("main a[href^='/products/']").first();
  await firstProductLink.click();

  await expect(page.getByRole("button", { name: "Añadir al carrito" })).toBeVisible();
});
