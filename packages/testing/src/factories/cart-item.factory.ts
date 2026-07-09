import { faker } from "@faker-js/faker";
import { cartItemWithProductSchema } from "@store-demo/shared-types";
import type { CartItemWithProduct, Product } from "@store-demo/shared-types";
import { createProductFixture } from "./product.factory";

export function createCartItemFixture(
  overrides: Partial<Omit<CartItemWithProduct, "product">> & {
    product?: Partial<Product>;
  } = {},
): CartItemWithProduct {
  const { product: productOverrides, ...cartItemOverrides } = overrides;
  const product = createProductFixture(productOverrides);

  return cartItemWithProductSchema.parse({
    id: faker.string.uuid(),
    userId: faker.string.uuid(),
    guestId: null,
    productId: product.id,
    quantity: faker.number.int({ min: 1, max: 5 }),
    createdAt: faker.date.past(),
    updatedAt: faker.date.recent(),
    ...cartItemOverrides,
    product,
  });
}
