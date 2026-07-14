import { z } from "zod";

export const userRoleSchema = z.enum(["customer", "admin"]);
export type UserRole = z.infer<typeof userRoleSchema>;

// Público: nunca incluye passwordHash (AGENTS.md §10, datos sensibles al cliente).
export const userSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  name: z.string(),
  role: userRoleSchema,
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});
export type User = z.infer<typeof userSchema>;

// Sin mensaje de error custom a propósito: ver el mismo comentario en
// shipping-address.schema.ts.
export const updateProfileRequestSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
});
export type UpdateProfileRequest = z.infer<typeof updateProfileRequestSchema>;
