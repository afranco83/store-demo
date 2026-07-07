import { faker } from "@faker-js/faker";
import { categorySchema } from "@store-demo/shared-types";
import type { Category } from "@store-demo/shared-types";

export function createCategoryFixture(overrides: Partial<Category> = {}): Category {
  const name = faker.commerce.department();
  return categorySchema.parse({
    id: faker.string.uuid(),
    slug: faker.helpers.slugify(name).toLowerCase(),
    name,
    description: faker.lorem.sentence(),
    createdAt: faker.date.past(),
    updatedAt: faker.date.recent(),
    ...overrides,
  });
}
