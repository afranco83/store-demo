import { expect, test } from "@playwright/test";

const API_URL = "http://localhost:4000";
const DEMO_CUSTOMER_EMAIL = "customer2@store-demo.test";
const DEMO_CUSTOMER_PASSWORD = "Password123!";

interface ApiProduct {
  slug: string;
  name: string;
  stock: number;
}

// customer2 (no customer1, usado en auth.spec.ts) para no compartir estado
// de carrito entre specs que puedan correr en el mismo run.
test("preserves a guest's cart items after logging in", async ({ page, request }) => {
  const productsResponse = await request.get(`${API_URL}/api/products`);
  const { data: products }: { data: ApiProduct[] } = await productsResponse.json();
  const product = products.find((item) => item.stock > 0);
  test.skip(!product, "No hay producto con stock disponible en el catálogo");
  if (!product) return;

  await page.goto("/products");
  const card = page.getByRole("link", { name: product.name }).locator("xpath=..");
  await card.getByRole("button", { name: "Añadir al carrito" }).click();

  const cartDrawer = page.getByRole("dialog", { name: "Carrito" });
  await expect(cartDrawer).toBeVisible();
  await expect(cartDrawer.getByText(product.name)).toBeVisible();
  await page.keyboard.press("Escape");

  await page.goto("/login");
  await page.getByLabel("Email").fill(DEMO_CUSTOMER_EMAIL);
  await page.getByLabel("Contraseña").fill(DEMO_CUSTOMER_PASSWORD);
  await page.getByRole("button", { name: "Iniciar sesión" }).click();
  await page.waitForURL("/account");

  await page.goto("/");
  await page.getByRole("button", { name: "Abrir carrito" }).click();
  await expect(page.getByRole("dialog", { name: "Carrito" }).getByText(product.name)).toBeVisible();
});
