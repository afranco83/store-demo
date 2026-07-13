import { expect, test } from "@playwright/test";

const API_URL = "http://localhost:4000";

interface ApiProduct {
  slug: string;
  name: string;
  stock: number;
}

interface ApiCategory {
  slug: string;
  name: string;
}

test("browses the catalog, filters by category and adds a product to the cart", async ({
  page,
  request,
}) => {
  const categoriesResponse = await request.get(`${API_URL}/api/categories`);
  const { data: categories }: { data: ApiCategory[] } = await categoriesResponse.json();
  const category = categories[0];
  if (!category) {
    throw new Error("El seed no tiene categorías, no se puede probar el filtro de catálogo");
  }

  await page.goto("/products");
  // Scoped al nav de filtros: el footer (presente en toda la app) también
  // enlaza a cada categoría por nombre desde su columna "Tienda", así que
  // buscar el link sin scope es ambiguo desde que existe.
  await page
    .getByRole("navigation", { name: "Filtrar por categoría" })
    .getByRole("link", { name: category.name })
    .click();
  await expect(page).toHaveURL(`/products?category=${category.slug}`);

  const productsResponse = await request.get(
    `${API_URL}/api/products?categorySlug=${category.slug}`,
  );
  const { data: products }: { data: ApiProduct[] } = await productsResponse.json();
  const product = products.find((item) => item.stock > 0);

  test.skip(!product, "No hay producto con stock disponible en esta categoría");
  if (!product) return;

  await page.getByRole("link", { name: product.name }).click();
  // Espera la navegación explícitamente: la card del listado y la página de
  // detalle comparten el mismo texto de botón ("Añadir al carrito"), así que
  // buscarlo antes de que la navegación termine es ambiguo.
  await page.waitForURL(`/products/${product.slug}`);
  await expect(page.getByRole("heading", { name: product.name })).toBeVisible();

  // Scoped a main: la sección de "también te puede interesar" añade sus
  // propios botones "Añadir al carrito" por cada producto relacionado.
  await page.locator("main").getByRole("button", { name: "Añadir al carrito" }).click();

  const cartDrawer = page.getByRole("dialog", { name: "Carrito" });
  await expect(cartDrawer).toBeVisible();
  await expect(cartDrawer.getByText(product.name)).toBeVisible();
});

test("adds a product to the cart directly from the catalog grid, without navigating away", async ({
  page,
  request,
}) => {
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
  await expect(page).toHaveURL("/products");
});
