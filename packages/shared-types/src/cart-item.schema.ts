import { z } from "zod";
import { productSchema } from "./product.schema";

export const cartItemSchema = z.object({
  id: z.string(),
  userId: z.string(),
  productId: z.string(),
  quantity: z.number().int().positive(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});
export type CartItem = z.infer<typeof cartItemSchema>;

export const cartItemWithProductSchema = cartItemSchema.extend({
  product: productSchema,
});
export type CartItemWithProduct = z.infer<typeof cartItemWithProductSchema>;

export const addCartItemSchema = z.object({
  productId: z.string().min(1),
  quantity: z.number().int().positive(),
});
export type AddCartItem = z.infer<typeof addCartItemSchema>;

export const updateCartItemSchema = z.object({
  quantity: z.number().int().positive(),
});
export type UpdateCartItem = z.infer<typeof updateCartItemSchema>;
