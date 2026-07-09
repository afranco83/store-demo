import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { cookies } from "next/headers";
import { login, mergeGuestCart } from "@store-demo/api-client";
import { loginRequestSchema, GUEST_CART_COOKIE } from "@store-demo/shared-types";
import { authConfig } from "./auth.config";
import { API_TOKEN_COOKIE, API_TOKEN_COOKIE_MAX_AGE_SECONDS } from "./cookies";

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const parsed = loginRequestSchema.safeParse(credentials);
        if (!parsed.success) {
          return null;
        }

        try {
          const { token, user } = await login(parsed.data);
          return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
            apiToken: token,
          };
        } catch {
          return null;
        }
      },
    }),
  ],
  callbacks: {
    ...authConfig.callbacks,
    // Guarda el token de apps/api en su propia cookie httpOnly (fuera del
    // JWT de Auth.js, ver cookies.ts) y fusiona el carrito de invitado si
    // había uno — se ejecuta tanto tras login como tras registro (el
    // registro hace signIn() con las mismas credenciales justo después de
    // crear la cuenta).
    async signIn({ user }) {
      if (!user.apiToken) {
        return true;
      }

      const cookieStore = await cookies();
      cookieStore.set(API_TOKEN_COOKIE, user.apiToken, {
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        path: "/",
        maxAge: API_TOKEN_COOKIE_MAX_AGE_SECONDS,
      });

      const guestId = cookieStore.get(GUEST_CART_COOKIE)?.value;
      if (guestId) {
        try {
          await mergeGuestCart({ token: user.apiToken, guestId });
        } catch {
          // No bloquear el login si la fusión falla (p.ej. apps/api caída
          // momentáneamente): el usuario simplemente pierde el carrito de
          // invitado en ese caso raro, no su acceso a la cuenta.
        }
        cookieStore.delete(GUEST_CART_COOKIE);
      }

      return true;
    },
  },
});
