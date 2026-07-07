import { faker } from "@faker-js/faker";
import { userSchema } from "@store-demo/shared-types";
import type { User } from "@store-demo/shared-types";

export function createUserFixture(overrides: Partial<User> = {}): User {
  return userSchema.parse({
    id: faker.string.uuid(),
    email: faker.internet.email(),
    name: faker.person.fullName(),
    role: "customer",
    createdAt: faker.date.past(),
    updatedAt: faker.date.recent(),
    ...overrides,
  });
}
