import { z } from "zod";

// Sin mensajes de error custom a propósito: el locale activo (es/en) fija el
// mapa de errores de Zod globalmente en el cliente (ver
// apps/storefront/src/components/ZodLocaleSync.tsx) — un mensaje hardcodeado
// aquí ganaría siempre a ese mapa y dejaría el campo sin traducir.
export const shippingAddressSchema = z.object({
  fullName: z.string().min(1),
  addressLine1: z.string().min(1),
  addressLine2: z.string().optional(),
  city: z.string().min(1),
  postalCode: z.string().min(1),
  country: z.string().min(1),
});
export type ShippingAddress = z.infer<typeof shippingAddressSchema>;
