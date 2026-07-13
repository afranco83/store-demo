import "dotenv/config";
import {
  buildProductFields,
  CATEGORIES,
  DEMO_PASSWORD,
  PRODUCTS_PER_CATEGORY,
  prisma,
  SEED,
  seedCartForCustomerTwo,
  seedCategories,
  seedOrderForCustomerOne,
  seedUsers,
  faker,
} from "./seed-shared";

// Variante de seed.ts para el reset periódico de la demo pública (protección
// contra vandalismo desde el panel de admin en producción — ver
// ROADMAP.md, adenda "Reset periódico del dataset de demo"). Duplica
// searchUnsplashPhotos/uploadImageToCloudinary/seedProducts de seed.ts en vez
// de reusarlos (mismo criterio que seed-lighthouse.ts, ver seed-shared.ts):
// la demo pública debe conservar imágenes reales de producto tras cada
// reset, no la imagen de muestra fija de la variante de Lighthouse.
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
      const { name, slug, description, priceCents, stock } = buildProductFields({
        category: categoryConfig,
        index,
      });
      const photoUrl = photoUrls[index];
      if (!photoUrl) {
        throw new Error(`Not enough Unsplash results for category "${category.slug}"`);
      }
      const imageUrl = await uploadImageToCloudinary({ slug, sourceUrl: photoUrl });

      products.push(
        await prisma.product.create({
          data: { slug, name, description, priceCents, imageUrl, stock, categoryId: category.id },
        }),
      );
    }
  }
  return products;
}

// Borra solo lo que el panel de admin puede modificar (pedidos, carritos,
// productos, categorías) y respeta las FK de schema.prisma: Order.user y
// Product.category son Restrict, OrderItem.product es Restrict — de ahí el
// orden (pedidos primero, categorías al final). Los usuarios demo NO se
// borran: no hay gestión de usuarios en apps/admin (no hay superficie de
// vandalismo ahí) y conservarlos evita invalidar sesiones activas de otros
// visitantes de la demo a mitad de un reset.
async function wipeDemoData() {
  await prisma.order.deleteMany();
  await prisma.cartItem.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();
}

async function main() {
  faker.seed(SEED);

  await wipeDemoData();

  const categories = await seedCategories();
  const products = await seedProducts(categories);
  const { customerOne, customerTwo } = await seedUsers();

  await seedCartForCustomerTwo({ userId: customerTwo.id, products });
  await seedOrderForCustomerOne({ userId: customerOne.id, products });

  console.log(`Reset: ${categories.length} categorías y ${products.length} productos restaurados.`);
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
