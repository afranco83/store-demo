import { expect, test } from "@playwright/test";

const API_URL = "http://localhost:4000";

interface ApiProduct {
  slug: string;
  name: string;
  stock: number;
}

async function registerAndSignIn(page: import("@playwright/test").Page, name: string) {
  const uniqueEmail = `e2e-checkout-${Date.now()}-${Math.random().toString(36).slice(2)}@store-demo.test`;

  await page.goto("/register");
  await page.getByLabel("Nombre").fill(name);
  await page.getByLabel("Email").fill(uniqueEmail);
  await page.getByLabel("Contraseña").fill("Password123!");
  await page.getByRole("button", { name: "Crear cuenta" }).click();
  await page.waitForURL("/account");
}

async function addFirstInStockProductToCart(
  page: import("@playwright/test").Page,
  request: import("@playwright/test").APIRequestContext,
): Promise<ApiProduct> {
  const productsResponse = await request.get(`${API_URL}/api/products`);
  const { data: products }: { data: ApiProduct[] } = await productsResponse.json();
  const product = products.find((item) => item.stock > 0);
  test.skip(!product, "No hay producto con stock disponible en el catálogo");
  if (!product) {
    throw new Error("unreachable: test.skip above stops execution");
  }

  await page.goto("/products");
  const card = page.getByRole("link", { name: product.name }).locator("xpath=..");
  await card.getByRole("button", { name: "Añadir al carrito" }).click();
  await expect(page.getByRole("dialog", { name: "Carrito" })).toBeVisible();

  return product;
}

async function goToCheckoutFromCartDrawer(page: import("@playwright/test").Page) {
  // Entrada real al checkout (no un `page.goto` directo): el botón vive
  // dentro del drawer del carrito, ver CartDrawerContainer.tsx.
  await page.getByRole("link", { name: "Finalizar compra" }).click();
  await page.waitForURL("/checkout");
}

async function fillShippingStep(page: import("@playwright/test").Page) {
  await page.getByLabel("Nombre completo").fill("Cliente E2E");
  await page.getByLabel("Dirección", { exact: true }).fill("Calle del Test 42");
  await page.getByLabel("Ciudad").fill("Madrid");
  await page.getByLabel("Código postal").fill("28080");
  await page.getByLabel("País").fill("ES");
  await page.getByRole("button", { name: "Continuar a pago" }).click();
}

async function fillPaymentStep(page: import("@playwright/test").Page, cardNumber: string) {
  await page.getByLabel("Nombre del titular").fill("Cliente E2E");
  await page.getByLabel("Número de tarjeta").fill(cardNumber);
  await page.getByLabel("Mes de caducidad").fill("12");
  await page.getByLabel("Año de caducidad").fill("2030");
  await page.getByLabel("CVC").fill("123");
}

test("completes checkout end to end with a valid card and sees the order in the history", async ({
  page,
  request,
}) => {
  await registerAndSignIn(page, "Cliente E2E Éxito");
  const product = await addFirstInStockProductToCart(page, request);
  await goToCheckoutFromCartDrawer(page);

  await fillShippingStep(page);
  await fillPaymentStep(page, "4242424242424242");
  await page.getByRole("button", { name: "Continuar a revisión" }).click();

  await expect(page.getByText(product.name)).toBeVisible();
  await expect(page.getByText("Cliente E2E")).toBeVisible();
  await expect(page.getByText("•••• 4242")).toBeVisible();

  await page.getByRole("button", { name: "Confirmar pedido" }).click();
  await expect(page.getByText("¡Gracias por tu pedido!")).toBeVisible();

  // apps/api vació el carrito dentro de la misma transacción del pedido; el
  // navbar debe reflejarlo tras invalidar la caché de TanStack Query (ver
  // ReviewStep.tsx), no seguir mostrando los artículos ya comprados.
  await page.goto("/");
  await page.getByRole("button", { name: "Abrir carrito" }).click();
  await expect(page.getByText("Tu carrito está vacío")).toBeVisible();
  await page.keyboard.press("Escape");

  await page.goto("/account/orders");
  await expect(page.getByText("Pendiente").first()).toBeVisible();
});

test("shows a decline error for the magic card and allows fixing it without losing entered data", async ({
  page,
  request,
}) => {
  await registerAndSignIn(page, "Cliente E2E Rechazo");
  await addFirstInStockProductToCart(page, request);
  await goToCheckoutFromCartDrawer(page);

  await fillShippingStep(page);
  // Tarjeta "mágica" (ver payment.schema.ts): termina en el dígito que fuerza
  // un fallo simulado en el servidor.
  await fillPaymentStep(page, "4242424242424241");
  await page.getByRole("button", { name: "Continuar a revisión" }).click();
  await page.getByRole("button", { name: "Confirmar pedido" }).click();

  await expect(
    page.getByText("Pago rechazado. Comprueba los datos de tu tarjeta e inténtalo de nuevo."),
  ).toBeVisible();
  // Sigue en revisión, no navegó a la vista de confirmación.
  await expect(page.getByText("¡Gracias por tu pedido!")).toHaveCount(0);

  await page.getByRole("button", { name: "Editar" }).nth(1).click();
  await expect(page.getByLabel("Nombre del titular")).toHaveValue("Cliente E2E");

  await page.getByLabel("Número de tarjeta").fill("4242424242424242");
  await page.getByRole("button", { name: "Continuar a revisión" }).click();
  await page.getByRole("button", { name: "Confirmar pedido" }).click();

  await expect(page.getByText("¡Gracias por tu pedido!")).toBeVisible();
});
