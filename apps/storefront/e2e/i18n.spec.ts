import { expect, test } from "@playwright/test";

test("switches to English via the footer locale switcher and back to Spanish", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "Streetwear con estilo" })).toBeVisible();

  // Grupo de idioma del footer, scoped: sin esto "EN"/"ES" hacen match por
  // substring (case-insensitive) contra nombres de producto normales (p. ej.
  // "Licensed Bronze T-Shirt" contiene "en", "Generic Steel Cap" también).
  await page
    .getByRole("group", { name: "Idioma" })
    .getByRole("link", { name: "EN", exact: true })
    .click();
  await page.waitForURL("/en");

  await expect(page.getByRole("heading", { name: "Stylish streetwear" })).toBeVisible();
  // Scoped al nav ("banner"): "Catalog" también matchea el botón "View
  // catalog" del Hero y el enlace del footer.
  await expect(
    page.getByRole("banner").getByRole("link", { name: "Catalog", exact: true }),
  ).toBeVisible();

  await page
    .getByRole("group", { name: "Language" })
    .getByRole("link", { name: "ES", exact: true })
    .click();
  await page.waitForURL("/");

  await expect(page.getByRole("heading", { name: "Streetwear con estilo" })).toBeVisible();
});

test("shows the curated English translation for a known product's content", async ({ page }) => {
  await page.goto("/en/products/camisetas-small-rubber-t-shirt-0");

  await expect(page.getByRole("heading", { name: "Sleek Rubber-Print Tee" })).toBeVisible();
  await expect(
    page.getByText(
      "A soft cotton tee finished with a durable rubber-textured print, ready for everyday wear.",
    ),
  ).toBeVisible();
});

test("keeps a protected route's locale prefix through the login redirect", async ({ page }) => {
  await page.goto("/en/account");

  await page.waitForURL(/\/en\/login/);
  await expect(page.getByRole("heading", { name: "Log in" })).toBeVisible();
});

test("keeps the active category filter when switching locale", async ({ page }) => {
  await page.goto("/products?category=camisetas");

  await page
    .getByRole("group", { name: "Idioma" })
    .getByRole("link", { name: "EN", exact: true })
    .click();

  await page.waitForURL("/en/products?category=camisetas");
});

test("shows the curated English translation for a product just added to the cart", async ({
  page,
}) => {
  await page.goto("/en/products/camisetas-small-rubber-t-shirt-0");

  // Scoped a main: la sección de "también te puede interesar" añade sus
  // propios botones "Add to cart" por cada producto relacionado.
  await page.locator("main").getByRole("button", { name: "Add to cart" }).click();

  await expect(page.getByRole("dialog").getByText("Sleek Rubber-Print Tee")).toBeVisible();
});
