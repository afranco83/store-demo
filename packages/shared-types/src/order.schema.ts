import { z } from "zod";
import { shippingAddressSchema } from "./shipping-address.schema";
import { simulatedPaymentSchema } from "./payment.schema";

export const orderStatusSchema = z.enum(["pending", "paid", "shipped", "delivered", "cancelled"]);
export type OrderStatus = z.infer<typeof orderStatusSchema>;

export const orderItemSchema = z.object({
  id: z.string(),
  orderId: z.string(),
  productId: z.string(),
  quantity: z.number().int().positive(),
  unitPriceCents: z.number().int().nonnegative(),
});
export type OrderItem = z.infer<typeof orderItemSchema>;

export const orderSchema = z.object({
  id: z.string(),
  userId: z.string(),
  // Email de la cuenta que hizo el pedido, unido desde User (no un snapshot
  // como los campos shipping* de abajo) — el propio email puede cambiarse
  // desde "Mi cuenta" tras el pedido, y queremos siempre el valor vigente.
  // Necesario para que apps/admin identifique al cliente en el listado de
  // pedidos (Fase 7); antes solo hacía falta el propio userId (el customer
  // ya sabe que el pedido es suyo).
  userEmail: z.string().email(),
  status: orderStatusSchema,
  totalCents: z.number().int().nonnegative(),
  shippingFullName: z.string(),
  shippingAddressLine1: z.string(),
  shippingAddressLine2: z.string().nullable(),
  shippingCity: z.string(),
  shippingPostalCode: z.string(),
  shippingCountry: z.string(),
  shippingCents: z.number().int().nonnegative(),
  paymentSimulatedSuccess: z.boolean(),
  items: z.array(orderItemSchema),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});
export type Order = z.infer<typeof orderSchema>;

export const updateOrderStatusSchema = z.object({
  status: orderStatusSchema,
});
export type UpdateOrderStatus = z.infer<typeof updateOrderStatusSchema>;

// Body de POST /api/orders (Fase 6, checkout): la dirección de envío se
// persiste en el pedido; los datos de pago solo se usan server-side para
// decidir éxito/fallo simulado y nunca se persisten (ver payment.schema.ts).
export const checkoutRequestSchema = z.object({
  shippingAddress: shippingAddressSchema,
  payment: simulatedPaymentSchema,
});
export type CheckoutRequest = z.infer<typeof checkoutRequestSchema>;
