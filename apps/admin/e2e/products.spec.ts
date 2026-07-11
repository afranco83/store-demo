import { expect, test } from "@playwright/test";

test("creates, edits and deletes a product", async ({ page }) => {
  const uniqueSlug = `e2e-product-${Date.now()}`;

  await page.goto("/products");
  await page.getByRole("link", { name: "Nuevo producto" }).click();

  await page.getByLabel("Slug").fill(uniqueSlug);
  await page.getByLabel("Nombre").fill("E2E Test Shirt");
  await page.getByLabel("Descripción").fill("Created by an E2E test");
  await page.getByLabel("Precio (céntimos)").fill("1999");
  await page.getByLabel("Stock").fill("5");
  await page.getByLabel("Categoría").selectOption({ index: 1 });
  await page
    .getByLabel("URL de la imagen")
    .fill("https://res.cloudinary.com/demo/image/upload/v1/x.jpg");
  await page.getByRole("button", { name: "Crear producto" }).click();

  await page.waitForURL("/products");
  await expect(page.getByRole("cell", { name: "E2E Test Shirt" })).toBeVisible();

  await page
    .getByRole("row", { name: /E2E Test Shirt/ })
    .getByRole("link", { name: "Editar" })
    .click();
  await page.waitForURL(`/products/${uniqueSlug}/edit`);
  await page.getByLabel("Nombre").fill("E2E Test Shirt Updated");
  await page.getByRole("button", { name: "Guardar cambios" }).click();

  await page.waitForURL("/products");
  await expect(page.getByRole("cell", { name: "E2E Test Shirt Updated" })).toBeVisible();

  await page
    .getByRole("row", { name: /E2E Test Shirt Updated/ })
    .getByRole("button", { name: "Eliminar" })
    .click();
  await page.getByRole("dialog").getByRole("button", { name: "Eliminar" }).click();

  await expect(page.getByRole("cell", { name: "E2E Test Shirt Updated" })).not.toBeVisible();
});

test("shows a validation error and does not submit an incomplete product", async ({ page }) => {
  await page.goto("/products/new");

  await page.getByRole("button", { name: "Crear producto" }).click();

  await expect(page.getByRole("alert").first()).toBeVisible();
  await expect(page).toHaveURL("/products/new");
});
