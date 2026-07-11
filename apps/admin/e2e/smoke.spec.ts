import { expect, test } from "@playwright/test";

// Spec ligero que navega las rutas principales de la app solo para detectar
// que ninguna rompe al desplegar, sin aserciones exhaustivas de contenido
// (AGENTS.md §6).
test("navigates the main authenticated routes without errors", async ({ page }) => {
  await page.goto("/products");
  await expect(page.getByRole("heading", { name: "Productos" })).toBeVisible();

  await page.goto("/categories");
  await expect(page.getByRole("heading", { name: "Categorías" })).toBeVisible();

  await page.goto("/orders");
  await expect(page.getByRole("heading", { name: "Pedidos" })).toBeVisible();

  await page.goto("/products/new");
  await expect(page.getByRole("heading", { name: "Nuevo producto" })).toBeVisible();

  await page.goto("/categories/new");
  await expect(page.getByRole("heading", { name: "Nueva categoría" })).toBeVisible();
});
