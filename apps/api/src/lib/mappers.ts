import { userRoleSchema, orderStatusSchema } from "@store-demo/shared-types";
import type { Category, Product, User, CartItemWithProduct, Order } from "@store-demo/shared-types";
import type {
  Category as CategoryModel,
  Product as ProductModel,
  User as UserModel,
  CartItem as CartItemModel,
  Order as OrderModel,
  OrderItem as OrderItemModel,
} from "../generated/prisma/client";

// Cada mapper construye la respuesta campo a campo desde el modelo de Prisma
// (nunca se reenvía el objeto de Prisma tal cual, ver validate-output.ts).

export function toCategoryDto(category: CategoryModel): Category {
  return {
    id: category.id,
    slug: category.slug,
    name: category.name,
    description: category.description,
    createdAt: category.createdAt,
    updatedAt: category.updatedAt,
  };
}

export function toProductDto(product: ProductModel): Product {
  return {
    id: product.id,
    slug: product.slug,
    name: product.name,
    description: product.description,
    priceCents: product.priceCents,
    imageUrl: product.imageUrl,
    stock: product.stock,
    categoryId: product.categoryId,
    createdAt: product.createdAt,
    updatedAt: product.updatedAt,
  };
}

export function toUserDto(user: UserModel): User {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: userRoleSchema.parse(user.role),
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}

export function toCartItemWithProductDto(
  cartItem: CartItemModel & { product: ProductModel },
): CartItemWithProduct {
  return {
    id: cartItem.id,
    userId: cartItem.userId,
    productId: cartItem.productId,
    quantity: cartItem.quantity,
    createdAt: cartItem.createdAt,
    updatedAt: cartItem.updatedAt,
    product: toProductDto(cartItem.product),
  };
}

export function toOrderDto(order: OrderModel & { items: OrderItemModel[] }): Order {
  return {
    id: order.id,
    userId: order.userId,
    status: orderStatusSchema.parse(order.status),
    totalCents: order.totalCents,
    items: order.items.map((item) => ({
      id: item.id,
      orderId: item.orderId,
      productId: item.productId,
      quantity: item.quantity,
      unitPriceCents: item.unitPriceCents,
    })),
    createdAt: order.createdAt,
    updatedAt: order.updatedAt,
  };
}
