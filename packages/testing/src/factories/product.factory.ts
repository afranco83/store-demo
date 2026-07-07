import { faker } from "@faker-js/faker";
import { productSchema } from "@store-demo/shared-types";
import type { Product } from "@store-demo/shared-types";

export function createProductFixture(overrides: Partial<Product> = {}): Product {
  const name = faker.commerce.productName();
  return productSchema.parse({
    id: faker.string.uuid(),
    slug: faker.helpers.slugify(name).toLowerCase(),
    name,
    description: faker.commerce.productDescription(),
    priceCents: faker.number.int({ min: 500, max: 50000 }),
    imageUrl: faker.image.url(),
    stock: faker.number.int({ min: 0, max: 100 }),
    categoryId: faker.string.uuid(),
    createdAt: faker.date.past(),
    updatedAt: faker.date.recent(),
    ...overrides,
  });
}
