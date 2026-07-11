import { expect, test as setup } from "@playwright/test";

const ADMIN_EMAIL = "admin@store-demo.test";
const ADMIN_PASSWORD = "Password123!";
const AUTH_FILE = "playwright/.auth/admin.json";

// Login una sola vez (proyecto "setup" de playwright.config.ts) y se reutiliza
// el storageState entre specs — AGENTS.md §6: "para los flujos que requieren
// login (admin), se autentica una sola vez y se reutiliza el estado de
// sesión entre specs, en vez de repetir el login en cada test".
setup("authenticate as admin", async ({ page }) => {
  await page.goto("/login");
  await page.getByLabel("Email").fill(ADMIN_EMAIL);
  await page.getByLabel("Contraseña").fill(ADMIN_PASSWORD);
  await page.getByRole("button", { name: "Iniciar sesión" }).click();

  await page.waitForURL("/products");
  await expect(page.getByRole("heading", { name: "Productos" })).toBeVisible();

  await page.context().storageState({ path: AUTH_FILE });
});
