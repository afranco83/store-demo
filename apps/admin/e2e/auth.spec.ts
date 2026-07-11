import { expect, test } from "@playwright/test";

const DEMO_CUSTOMER_EMAIL = "customer1@store-demo.test";
const DEMO_CUSTOMER_PASSWORD = "Password123!";

// Casos negativos de sesión: no reutilizan el storageState de admin ya
// autenticado (proyecto "chromium" de playwright.config.ts), cada test
// empieza sin sesión.
test.use({ storageState: { cookies: [], origins: [] } });

test("redirects to /login with a callbackUrl when visiting a private route without a session", async ({
  page,
}) => {
  await page.goto("/products");

  await page.waitForURL(/\/login/);
  expect(new URL(page.url()).searchParams.get("callbackUrl")).toBe("/products");
});

test("shows an error and does not sign in with invalid credentials", async ({ page }) => {
  await page.goto("/login");
  await page.getByLabel("Email").fill(DEMO_CUSTOMER_EMAIL);
  await page.getByLabel("Contraseña").fill("wrong-password");
  await page.getByRole("button", { name: "Iniciar sesión" }).click();

  await expect(page.getByText("Email o contraseña incorrectos.")).toBeVisible();
  await expect(page).toHaveURL("/login");
});

test("redirects a customer session to /403 instead of granting access", async ({ page }) => {
  await page.goto("/login");
  await page.getByLabel("Email").fill(DEMO_CUSTOMER_EMAIL);
  await page.getByLabel("Contraseña").fill(DEMO_CUSTOMER_PASSWORD);
  await page.getByRole("button", { name: "Iniciar sesión" }).click();

  // No se comprueba page.url() aquí a propósito: el redirect a /products del
  // signIn() de la Server Action aterriza en una navegación "soft" (RSC) que
  // el middleware vuelve a redirigir a /403 — el contenido servido y
  // renderizado ya es el de /403 (verificado también contra el servidor
  // real vía curl, con 307 Location: /403), pero Next.js no actualiza la URL
  // visible del navegador en ese encadenado de redirects. Una navegación
  // completa (goto) sí la actualiza, comprobado justo debajo.
  await expect(page.getByRole("heading", { name: "Sin permisos" })).toBeVisible();

  await page.goto("/products");
  await page.waitForURL(/\/403/);
});
