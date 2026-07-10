import { faker } from "@faker-js/faker";
import { orderSchema, orderItemSchema } from "@store-demo/shared-types";
import type { Order, OrderItem } from "@store-demo/shared-types";

export function createOrderItemFixture(overrides: Partial<OrderItem> = {}): OrderItem {
  return orderItemSchema.parse({
    id: faker.string.uuid(),
    orderId: faker.string.uuid(),
    productId: faker.string.uuid(),
    quantity: faker.number.int({ min: 1, max: 5 }),
    unitPriceCents: faker.number.int({ min: 500, max: 50000 }),
    ...overrides,
  });
}

export function createOrderFixture(overrides: Partial<Order> = {}): Order {
  const id = overrides.id ?? faker.string.uuid();
  const items = overrides.items ?? [createOrderItemFixture({ orderId: id })];
  const subtotalCents = items.reduce((sum, item) => sum + item.unitPriceCents * item.quantity, 0);
  const shippingCents = overrides.shippingCents ?? 0;
  const totalCents = overrides.totalCents ?? subtotalCents + shippingCents;

  return orderSchema.parse({
    id,
    userId: faker.string.uuid(),
    status: "pending",
    shippingFullName: faker.person.fullName(),
    shippingAddressLine1: faker.location.streetAddress(),
    shippingAddressLine2: null,
    shippingCity: faker.location.city(),
    shippingPostalCode: faker.location.zipCode(),
    shippingCountry: "ES",
    paymentSimulatedSuccess: true,
    createdAt: faker.date.past(),
    updatedAt: faker.date.recent(),
    ...overrides,
    items,
    shippingCents,
    totalCents,
  });
}
