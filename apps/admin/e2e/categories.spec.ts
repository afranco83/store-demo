import { expect, test } from "@playwright/test";

test("creates, edits and deletes a category", async ({ page }) => {
  const uniqueSlug = `e2e-category-${Date.now()}`;

  await page.goto("/categories");
  await page.getByRole("link", { name: "Nueva categoría" }).click();

  await page.getByLabel("Slug").fill(uniqueSlug);
  await page.getByLabel("Nombre").fill("E2E Test Category");
  await page.getByRole("button", { name: "Crear categoría" }).click();

  await page.waitForURL("/categories");
  await expect(page.getByRole("cell", { name: "E2E Test Category" })).toBeVisible();

  await page
    .getByRole("row", { name: /E2E Test Category/ })
    .getByRole("link", { name: "Editar" })
    .click();
  await page.waitForURL(`/categories/${uniqueSlug}/edit`);
  await page.getByLabel("Nombre").fill("E2E Test Category Updated");
  await page.getByRole("button", { name: "Guardar cambios" }).click();

  await page.waitForURL("/categories");
  await expect(page.getByRole("cell", { name: "E2E Test Category Updated" })).toBeVisible();

  await page
    .getByRole("row", { name: /E2E Test Category Updated/ })
    .getByRole("button", { name: "Eliminar" })
    .click();
  await page.getByRole("dialog").getByRole("button", { name: "Eliminar" }).click();

  await expect(page.getByRole("cell", { name: "E2E Test Category Updated" })).not.toBeVisible();
});
