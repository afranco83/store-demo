import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";

const DEMO_CUSTOMER_EMAIL = "customer1@store-demo.test";
const DEMO_CUSTOMER_PASSWORD = "Password123!";
const API_URL = "http://localhost:4000";

// Auditoría de accesibilidad a nivel de ruta real renderizada (no de
// componente aislado, eso ya lo cubre vitest-axe en packages/ui) —
// complementa los specs funcionales existentes. Objetivo del proyecto:
// WCAG 2.1 AA (AGENTS.md §8), cero violaciones critical/serious.
async function expectNoSeriousViolations(page: Page) {
  const results = await new AxeBuilder({ page }).analyze();
  const seriousOrWorse = results.violations.filter(
    (violation) => violation.impact === "critical" || violation.impact === "serious",
  );

  expect(seriousOrWorse, JSON.stringify(seriousOrWorse, null, 2)).toEqual([]);
}

// Storefront no tiene un proyecto "setup"/storageState compartido (a
// diferencia de apps/admin, ver playwright.config.ts) — mismo patrón de
// login manual por test que ya usan auth.spec.ts/checkout.spec.ts.
async function signInAsCustomer(page: Page) {
  await page.goto("/login");
  await page.getByLabel("Email").fill(DEMO_CUSTOMER_EMAIL);
  await page.getByLabel("Contraseña").fill(DEMO_CUSTOMER_PASSWORD);
  await page.getByRole("button", { name: "Iniciar sesión" }).click();
  await page.waitForURL("/account");
}

test.describe("public routes", () => {
  test("has no serious accessibility violations on the home page", async ({ page }) => {
    await page.goto("/");
    await expectNoSeriousViolations(page);
  });

  test("has no serious accessibility violations on the catalog page", async ({ page }) => {
    await page.goto("/products");
    await expectNoSeriousViolations(page);
  });

  test("has no serious accessibility violations on a product detail page", async ({ page }) => {
    await page.goto("/products");
    const firstProductLink = page.locator("main a[href^='/products/']").first();
    await firstProductLink.click();
    await page.waitForURL(/\/products\/.+/);

    await expectNoSeriousViolations(page);
  });

  test("has no serious accessibility violations on the login page", async ({ page }) => {
    await page.goto("/login");
    await expectNoSeriousViolations(page);
  });

  test("has no serious accessibility violations on the register page", async ({ page }) => {
    await page.goto("/register");
    await expectNoSeriousViolations(page);
  });
});

test.describe("private routes (customer session)", () => {
  test("has no serious accessibility violations on the account page", async ({ page }) => {
    await signInAsCustomer(page);
    await expectNoSeriousViolations(page);
  });

  test("has no serious accessibility violations on the order history page", async ({ page }) => {
    await signInAsCustomer(page);
    await page.goto("/account/orders");
    await expectNoSeriousViolations(page);
  });

  test("has no serious accessibility violations on the checkout page", async ({
    page,
    request,
  }) => {
    await signInAsCustomer(page);

    // /checkout con el carrito vacío solo renderiza un EmptyState (ver
    // CheckoutWizard.tsx) — para auditar el wizard real (el paso "Envío")
    // hace falta un producto en el carrito primero, mismo patrón que
    // checkout.spec.ts.
    const productsResponse = await request.get(`${API_URL}/api/products`);
    const { data: products }: { data: { name: string; stock: number }[] } =
      await productsResponse.json();
    const product = products.find((item) => item.stock > 0);
    test.skip(!product, "No hay producto con stock disponible en el catálogo");
    if (!product) {
      throw new Error("unreachable: test.skip above stops execution");
    }

    await page.goto("/products");
    const card = page.getByRole("link", { name: product.name }).locator("xpath=..");
    await card.getByRole("button", { name: "Añadir al carrito" }).click();
    await expect(page.getByRole("dialog", { name: "Carrito" })).toBeVisible();

    await page.goto("/checkout");
    // Confirma que aterriza en el paso "Envío" del wizard (no en el
    // EmptyState de carrito vacío) antes de auditar la ruta.
    await expect(page.getByLabel("Nombre completo")).toBeVisible();
    await expectNoSeriousViolations(page);

    // El paso "Envío" completado renderiza el círculo de WizardSteps con
    // bg-accent-soft/text-accent (mismo token que el Badge "Pagado" cuyo
    // contraste se corrigió en esta fase) — auditado aquí también, no solo
    // en el paso inicial, para no dejar sin verificar el otro consumidor
    // real del token.
    await page.getByLabel("Nombre completo").fill("Cliente E2E");
    await page.getByLabel("Dirección", { exact: true }).fill("Calle del Test 42");
    await page.getByLabel("Ciudad").fill("Madrid");
    await page.getByLabel("Código postal").fill("28080");
    await page.getByLabel("País").fill("ES");
    await page.getByRole("button", { name: "Continuar a pago" }).click();
    await expect(page.getByLabel("Nombre del titular")).toBeVisible();
    await expectNoSeriousViolations(page);
  });
});
