import { z } from "zod";
import { userSchema } from "./user.schema";

export const loginRequestSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});
export type LoginRequest = z.infer<typeof loginRequestSchema>;

export const loginResponseSchema = z.object({
  token: z.string(),
  user: userSchema,
});
export type LoginResponse = z.infer<typeof loginResponseSchema>;

// Sin mensaje de error custom en password a propósito: ver el mismo
// comentario en shipping-address.schema.ts.
export const registerRequestSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().min(1),
});
export type RegisterRequest = z.infer<typeof registerRequestSchema>;

// El registro no devuelve token: el cliente hace signIn() (Auth.js) justo
// después, reusando el mismo flujo de login en vez de emitir sesión aquí.
export const registerResponseSchema = z.object({
  user: userSchema,
});
export type RegisterResponse = z.infer<typeof registerResponseSchema>;
