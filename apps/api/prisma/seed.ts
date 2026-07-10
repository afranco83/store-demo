import "dotenv/config";
import { faker } from "@faker-js/faker";
import { calculateShippingCents } from "@store-demo/shared-types";
import { prisma } from "../src/lib/prisma";
import { hashPassword } from "../src/lib/password";

const SEED = 20260707;
const PRODUCTS_PER_CATEGORY = 5;
const DEMO_PASSWORD = "Password123!";

// Catálogo enfocado en streetwear/apparel (no un e-commerce genérico): cada
// categoría lleva su propia búsqueda de Unsplash (fotos reales, moderadas por
// Unsplash — más fiables que un buscador de tags libre) y el sustantivo con
// el que se construyen los nombres de producto.
const CATEGORIES = [
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

function toSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

async function searchUnsplashPhotos({
  query,
  count,
}: {
  query: string;
  count: number;
}): Promise<string[]> {
  const accessKey = process.env.UNSPLASH_ACCESS_KEY;
  if (!accessKey) {
    throw new Error("UNSPLASH_ACCESS_KEY is not set");
  }

  const url = new URL("https://api.unsplash.com/search/photos");
  url.searchParams.set("query", query);
  url.searchParams.set("per_page", String(count));
  url.searchParams.set("client_id", accessKey);

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Unsplash search failed for "${query}": HTTP ${response.status}`);
  }

  const json = (await response.json()) as { results: Array<{ urls: { regular: string } }> };
  return json.results.map((result) => result.urls.regular);
}

async function uploadImageToCloudinary({
  slug,
  sourceUrl,
}: {
  slug: string;
  sourceUrl: string;
}): Promise<string> {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const uploadPreset = process.env.CLOUDINARY_UPLOAD_PRESET;
  if (!cloudName || !uploadPreset) {
    throw new Error("CLOUDINARY_CLOUD_NAME/CLOUDINARY_UPLOAD_PRESET are not set");
  }

  const formData = new FormData();
  formData.append("file", sourceUrl);
  formData.append("upload_preset", uploadPreset);
  formData.append("folder", "store-demo");

  const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    throw new Error(`Cloudinary upload failed for "${slug}": HTTP ${response.status}`);
  }

  const json = (await response.json()) as { secure_url: string };
  return json.secure_url;
}

async function seedCategories() {
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

async function seedProducts(categories: Awaited<ReturnType<typeof seedCategories>>) {
  const products = [];

  for (const category of categories) {
    const categoryConfig = CATEGORIES.find((candidate) => candidate.slug === category.slug);
    if (!categoryConfig) {
      throw new Error(`Missing image/naming config for category "${category.slug}"`);
    }

    const photoUrls = await searchUnsplashPhotos({
      query: categoryConfig.searchQuery,
      count: PRODUCTS_PER_CATEGORY,
    });

    for (let index = 0; index < PRODUCTS_PER_CATEGORY; index += 1) {
      const name = `${faker.commerce.productAdjective()} ${faker.commerce.productMaterial()} ${categoryConfig.productNoun}`;
      const slug = `${category.slug}-${toSlug(name)}-${index}`;
      const photoUrl = photoUrls[index];
      if (!photoUrl) {
        throw new Error(`Not enough Unsplash results for category "${category.slug}"`);
      }
      const imageUrl = await uploadImageToCloudinary({ slug, sourceUrl: photoUrl });
      const description = faker.commerce.productDescription();

      products.push(
        await prisma.product.upsert({
          where: { slug },
          create: {
            slug,
            name,
            description,
            priceCents: faker.number.int({ min: 999, max: 29999 }),
            imageUrl,
            stock: faker.number.int({ min: 0, max: 50 }),
            categoryId: category.id,
          },
          update: { name, description, imageUrl },
        }),
      );
    }
  }
  return products;
}

async function seedUsers() {
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

async function seedCartForCustomerTwo({
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

async function seedOrderForCustomerOne({
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

async function main() {
  faker.seed(SEED);

  const categories = await seedCategories();
  const products = await seedProducts(categories);
  const { customerOne, customerTwo } = await seedUsers();

  await seedCartForCustomerTwo({ userId: customerTwo.id, products });
  await seedOrderForCustomerOne({ userId: customerOne.id, products });

  console.log(`Seeded ${categories.length} categories and ${products.length} products.`);
  console.log(
    `Demo users (password: ${DEMO_PASSWORD}): admin@store-demo.test, customer1@store-demo.test, customer2@store-demo.test`,
  );
}

main()
  .catch((error: unknown) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
