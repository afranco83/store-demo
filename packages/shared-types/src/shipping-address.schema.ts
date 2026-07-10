import { z } from "zod";

export const shippingAddressSchema = z.object({
  fullName: z.string().min(1, "El nombre no puede estar vacío"),
  addressLine1: z.string().min(1, "La dirección no puede estar vacía"),
  addressLine2: z.string().optional(),
  city: z.string().min(1, "La ciudad no puede estar vacía"),
  postalCode: z.string().min(1, "El código postal no puede estar vacío"),
  country: z.string().min(1, "El país no puede estar vacío"),
});
export type ShippingAddress = z.infer<typeof shippingAddressSchema>;
