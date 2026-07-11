import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";

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

test.describe("private routes (admin session)", () => {
  // Reutiliza el storageState del proyecto "setup" (playwright.config.ts),
  // ya autenticado como admin.

  test("has no serious accessibility violations on the dashboard", async ({ page }) => {
    await page.goto("/");
    await expectNoSeriousViolations(page);
  });

  test("has no serious accessibility violations on the products list", async ({ page }) => {
    await page.goto("/products");
    await expectNoSeriousViolations(page);
  });

  test("has no serious accessibility violations on the new product page", async ({ page }) => {
    await page.goto("/products/new");
    await expectNoSeriousViolations(page);
  });

  test("has no serious accessibility violations on the edit product page", async ({ page }) => {
    await page.goto("/products");
    await page.getByRole("link", { name: "Editar" }).first().click();
    await page.waitForURL(/\/products\/.+\/edit/);

    await expectNoSeriousViolations(page);
  });

  test("has no serious accessibility violations on the categories list", async ({ page }) => {
    await page.goto("/categories");
    await expectNoSeriousViolations(page);
  });

  test("has no serious accessibility violations on the new category page", async ({ page }) => {
    await page.goto("/categories/new");
    await expectNoSeriousViolations(page);
  });

  test("has no serious accessibility violations on the edit category page", async ({ page }) => {
    await page.goto("/categories");
    await page.getByRole("link", { name: "Editar" }).first().click();
    await page.waitForURL(/\/categories\/.+\/edit/);

    await expectNoSeriousViolations(page);
  });

  test("has no serious accessibility violations on the orders list", async ({ page }) => {
    await page.goto("/orders");
    await expectNoSeriousViolations(page);
  });
});

test.describe("public routes (no session)", () => {
  // Casos sin sesión, igual que auth.spec.ts: no reutilizan el storageState
  // de admin ya autenticado del proyecto "chromium".
  test.use({ storageState: { cookies: [], origins: [] } });

  test("has no serious accessibility violations on the login page", async ({ page }) => {
    await page.goto("/login");
    await expectNoSeriousViolations(page);
  });

  test("has no serious accessibility violations on the 403 page", async ({ page }) => {
    await page.goto("/403");
    await expectNoSeriousViolations(page);
  });
});
