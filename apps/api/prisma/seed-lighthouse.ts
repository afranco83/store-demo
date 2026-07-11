import "dotenv/config";
import {
  buildProductFields,
  CATEGORIES,
  faker,
  PRODUCTS_PER_CATEGORY,
  prisma,
  SEED,
  seedCartForCustomerTwo,
  seedCategories,
  seedOrderForCustomerOne,
  seedUsers,
} from "./seed-shared";

// Variante ligera de seed.ts para el workflow de Lighthouse CI (Fase 8):
// mismas categorías/usuarios/carrito/pedido, pero sin llamadas reales a
// Unsplash/Cloudinary (evita depender de secretos nuevos en GitHub Actions
// y de la cuota de Unsplash en cada run) — usa la imagen de muestra pública
// que el propio Cloudinary expone en su cuenta "demo", sin autenticación.
const SAMPLE_IMAGE_URL = "https://res.cloudinary.com/demo/image/upload/sample.jpg";

async function seedProducts(categories: Awaited<ReturnType<typeof seedCategories>>) {
  const products = [];

  for (const category of categories) {
    const categoryConfig = CATEGORIES.find((candidate) => candidate.slug === category.slug);
    if (!categoryConfig) {
      throw new Error(`Missing naming config for category "${category.slug}"`);
    }

    for (let index = 0; index < PRODUCTS_PER_CATEGORY; index += 1) {
      const { name, slug, description, priceCents, stock } = buildProductFields({
        category: categoryConfig,
        index,
      });

      products.push(
        await prisma.product.upsert({
          where: { slug },
          create: {
            slug,
            name,
            description,
            priceCents,
            imageUrl: SAMPLE_IMAGE_URL,
            stock,
            categoryId: category.id,
          },
          update: { name, description, imageUrl: SAMPLE_IMAGE_URL },
        }),
      );
    }
  }
  return products;
}

async function main() {
  faker.seed(SEED);

  const categories = await seedCategories();
  const products = await seedProducts(categories);
  const { customerOne, customerTwo } = await seedUsers();

  await seedCartForCustomerTwo({ userId: customerTwo.id, products });
  await seedOrderForCustomerOne({ userId: customerOne.id, products });

  console.log(
    `Seeded ${categories.length} categories and ${products.length} products (Lighthouse CI).`,
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
