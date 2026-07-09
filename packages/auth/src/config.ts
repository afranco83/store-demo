import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { cookies } from "next/headers";
import { ApiClientError, login, mergeGuestCart } from "@store-demo/api-client";
import { loginRequestSchema, GUEST_CART_COOKIE } from "@store-demo/shared-types";
import { authConfig } from "./auth.config";
import {
  API_TOKEN_COOKIE,
  API_TOKEN_COOKIE_MAX_AGE_SECONDS,
  ownHttpOnlyCookieOptions,
} from "./cookies";

const INVALID_CREDENTIALS_STATUS = 401;

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
        } catch (error) {
          // Solo un 401 real de apps/api son credenciales inválidas — un
          // fallo de red/servicio no debe mostrarse como "email o
          // contraseña incorrectos" (mensaje engañoso que invita a
          // reintentar/cambiar la contraseña sin sentido). Se deja
          // propagar cualquier otro error; login.action.ts distingue
          // CredentialsSignin de cualquier otro AuthError.
          if (error instanceof ApiClientError && error.status === INVALID_CREDENTIALS_STATUS) {
            return null;
          }
          throw error;
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
      cookieStore.set(
        API_TOKEN_COOKIE,
        user.apiToken,
        ownHttpOnlyCookieOptions(API_TOKEN_COOKIE_MAX_AGE_SECONDS),
      );

      const guestId = cookieStore.get(GUEST_CART_COOKIE)?.value;
      if (guestId) {
        try {
          await mergeGuestCart({ token: user.apiToken, guestId });
          // Solo se borra la cookie de invitado si la fusión tuvo éxito: si
          // falla (p.ej. apps/api caída momentáneamente) y se borrara
          // igualmente, esos CartItem quedarían huérfanos para siempre (sin
          // cookie que los referencie, un guestId nuevo los reemplaza en la
          // próxima visita) — no bloquea el login, pero conserva la
          // posibilidad de reintentar la fusión en un login posterior.
          cookieStore.delete(GUEST_CART_COOKIE);
        } catch {
          // No bloquear el login si la fusión falla: el usuario conserva el
          // acceso a su cuenta, y el carrito de invitado sigue recuperable
          // (la cookie sigue ahí) la próxima vez que inicie sesión.
        }
      }

      return true;
    },
  },
});
