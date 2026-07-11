import { faker } from "@faker-js/faker";
import { calculateShippingCents } from "@store-demo/shared-types";
import { prisma } from "../src/lib/prisma";
import { hashPassword } from "../src/lib/password";

// Compartido entre seed.ts (fotos reales vía Unsplash+Cloudinary, para
// desarrollo/demo local) y seed-lighthouse.ts (imagen fija, sin llamadas de
// red externas, para el workflow de Lighthouse CI — ver ROADMAP.md Fase 8).
// Solo difiere seedProducts: el resto (categorías, usuarios, carrito, pedido)
// es idéntico y debe seguir siéndolo, de ahí la extracción en vez de dos
// copias completas del archivo.
export const SEED = 20260707;
export const PRODUCTS_PER_CATEGORY = 5;
export const DEMO_PASSWORD = "Password123!";

export const CATEGORIES = [
  {
    slug: "camisetas",
    name: "Camisetas",
    description: "Camisetas para cualquier ocasión",
    searchQuery: "t-shirt",
    productNoun: "T-Shirt",
  },
  {
    slug: "gorras",
    name: "Gorras",
    description: "Gorras y sombreros de temporada",
    searchQuery: "baseball cap",
    productNoun: "Cap",
  },
  {
    slug: "zapatillas",
    name: "Zapatillas",
    description: "Calzado deportivo y casual",
    searchQuery: "sneakers",
    productNoun: "Sneakers",
  },
] as const;

export function toSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

// Campos deterministas de un producto (nombre/slug/descripción/precio/stock)
// — idénticos entre seed.ts y seed-lighthouse.ts, a diferencia de cómo se
// resuelve `imageUrl` (Unsplash+Cloudinary real vs. imagen de muestra fija),
// que sí difiere en forma async y se queda en cada archivo.
export function buildProductFields({
  category,
  index,
}: {
  category: (typeof CATEGORIES)[number];
  index: number;
}) {
  const name = `${faker.commerce.productAdjective()} ${faker.commerce.productMaterial()} ${category.productNoun}`;
  const slug = `${category.slug}-${toSlug(name)}-${index}`;

  return {
    name,
    slug,
    description: faker.commerce.productDescription(),
    priceCents: faker.number.int({ min: 999, max: 29999 }),
    stock: faker.number.int({ min: 0, max: 50 }),
  };
}

export async function seedCategories() {
  const categories = [];
  for (const { slug, name, description } of CATEGORIES) {
    categories.push(
      await prisma.category.upsert({
        where: { slug },
        create: { slug, name, description },
        update: { name, description },
      }),
    );
  }
  return categories;
}

export async function seedUsers() {
  const passwordHash = await hashPassword(DEMO_PASSWORD);

  const admin = await prisma.user.upsert({
    where: { email: "admin@store-demo.test" },
    create: { email: "admin@store-demo.test", passwordHash, name: "Demo Admin", role: "admin" },
    update: {},
  });

  const customerOne = await prisma.user.upsert({
    where: { email: "customer1@store-demo.test" },
    create: {
      email: "customer1@store-demo.test",
      passwordHash,
      name: "Demo Customer One",
      role: "customer",
    },
    update: {},
  });

  const customerTwo = await prisma.user.upsert({
    where: { email: "customer2@store-demo.test" },
    create: {
      email: "customer2@store-demo.test",
      passwordHash,
      name: "Demo Customer Two",
      role: "customer",
    },
    update: {},
  });

  return { admin, customerOne, customerTwo };
}

export async function seedCartForCustomerTwo({
  userId,
  products,
}: {
  userId: string;
  products: Array<{ id: string }>;
}) {
  const [firstProduct, secondProduct] = products;
  if (!firstProduct || !secondProduct) {
    return;
  }

  await prisma.cartItem.upsert({
    where: { userId_productId: { userId, productId: firstProduct.id } },
    create: { userId, productId: firstProduct.id, quantity: 1 },
    update: { quantity: 1 },
  });
  await prisma.cartItem.upsert({
    where: { userId_productId: { userId, productId: secondProduct.id } },
    create: { userId, productId: secondProduct.id, quantity: 2 },
    update: { quantity: 2 },
  });
}

export async function seedOrderForCustomerOne({
  userId,
  products,
}: {
  userId: string;
  products: Array<{ id: string; priceCents: number }>;
}) {
  const existingOrder = await prisma.order.findFirst({ where: { userId } });
  if (existingOrder) {
    return;
  }

  const orderProducts = products.slice(0, 2);
  const subtotalCents = orderProducts.reduce((sum, product) => sum + product.priceCents, 0);
  const shippingCents = calculateShippingCents(subtotalCents);

  await prisma.order.create({
    data: {
      userId,
      status: "paid",
      totalCents: subtotalCents + shippingCents,
      shippingFullName: "Cliente Uno",
      shippingAddressLine1: "Calle Falsa 123",
      shippingAddressLine2: null,
      shippingCity: "Madrid",
      shippingPostalCode: "28080",
      shippingCountry: "ES",
      shippingCents,
      paymentSimulatedSuccess: true,
      items: {
        create: orderProducts.map((product) => ({
          productId: product.id,
          quantity: 1,
          unitPriceCents: product.priceCents,
        })),
      },
    },
  });
}

export { faker, prisma };
