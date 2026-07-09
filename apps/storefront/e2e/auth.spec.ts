import { expect, test } from "@playwright/test";

const DEMO_CUSTOMER_EMAIL = "customer1@store-demo.test";
const DEMO_CUSTOMER_PASSWORD = "Password123!";

test("redirects to /login with a callbackUrl when visiting a private route without a session", async ({
  page,
}) => {
  await page.goto("/account");

  await page.waitForURL(/\/login/);
  expect(new URL(page.url()).searchParams.get("callbackUrl")).toBe("/account");
});

test("logs in with a seeded demo user and can log out", async ({ page }) => {
  await page.goto("/login");
  await page.getByLabel("Email").fill(DEMO_CUSTOMER_EMAIL);
  await page.getByLabel("Contraseña").fill(DEMO_CUSTOMER_PASSWORD);
  await page.getByRole("button", { name: "Iniciar sesión" }).click();

  await page.waitForURL("/account");
  await expect(page.getByLabel("Email")).toHaveValue(DEMO_CUSTOMER_EMAIL);

  await page.getByRole("button", { name: "Cuenta" }).click();
  await page.getByRole("menuitem", { name: "Cerrar sesión" }).click();

  await page.waitForURL("/");
  await expect(page.getByRole("link", { name: "Login" })).toBeVisible();
});

test("shows an error and does not sign in with invalid credentials", async ({ page }) => {
  await page.goto("/login");
  await page.getByLabel("Email").fill(DEMO_CUSTOMER_EMAIL);
  await page.getByLabel("Contraseña").fill("wrong-password");
  await page.getByRole("button", { name: "Iniciar sesión" }).click();

  await expect(page.getByText("Email o contraseña incorrectos.")).toBeVisible();
  await expect(page).toHaveURL("/login");
});

test("registers a new account and lands on the account page already signed in", async ({
  page,
}) => {
  const uniqueEmail = `e2e-${Date.now()}@store-demo.test`;

  await page.goto("/register");
  await page.getByLabel("Nombre").fill("E2E Test User");
  await page.getByLabel("Email").fill(uniqueEmail);
  await page.getByLabel("Contraseña").fill("Password123!");
  await page.getByRole("button", { name: "Crear cuenta" }).click();

  await page.waitForURL("/account");
  await expect(page.getByLabel("Email")).toHaveValue(uniqueEmail);

  // Regresión: una cuenta recién creada (sin pedidos) no debe reventar
  // /account/orders — getOrdersAction/getApiToken intentaban escribir la
  // cookie api_token durante el render de un Server Component (solo
  // permitido en Server Actions/Route Handlers reales), lanzando "Cookies
  // can only be modified in a Server Action or Route Handler".
  await page.goto("/account/orders");
  await expect(page.getByText("Todavía no tienes pedidos")).toBeVisible();
});

test("edits the profile name and sees it persisted after a reload", async ({ page }) => {
  const uniqueEmail = `e2e-profile-${Date.now()}@store-demo.test`;

  await page.goto("/register");
  await page.getByLabel("Nombre").fill("Nombre Original");
  await page.getByLabel("Email").fill(uniqueEmail);
  await page.getByLabel("Contraseña").fill("Password123!");
  await page.getByRole("button", { name: "Crear cuenta" }).click();
  await page.waitForURL("/account");

  const nameInput = page.getByLabel("Nombre");
  await nameInput.fill("Nombre Actualizado");
  await page.getByRole("button", { name: "Guardar cambios" }).click();

  await expect(page.getByText("Cambios guardados.")).toBeVisible();
  await expect(nameInput).toHaveValue("Nombre Actualizado");

  // El nombre se pide fresco a apps/api en cada visita (no se cachea en la
  // sesión de Auth.js, ver ARCHITECTURE.md §4) — confirma que persiste de
  // verdad, no que sea solo estado local del formulario.
  await page.reload();
  await expect(page.getByLabel("Nombre")).toHaveValue("Nombre Actualizado");
});
