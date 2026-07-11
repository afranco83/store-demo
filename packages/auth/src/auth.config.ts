import { z } from "zod";
import type { NextAuthConfig } from "next-auth";
import { userRoleSchema } from "@store-demo/shared-types";
import "./types";

// Claims propios embebidos en el JWT de Auth.js (userId/role) — el token no
// se amplía por tipos (ver types.ts, next-auth/jwt no se pudo aumentar en
// este setup), así que se valida en runtime con Zod al leerlo en session()
// en vez de un `as` sin comprobación (AGENTS.md §2).
const jwtClaimsSchema = z.object({
  userId: z.string(),
  role: userRoleSchema,
});

// Config edge-safe: sin providers (Credentials/authorize vive solo en
// config.ts) ni callbacks que toquen next/headers — es lo único que
// middleware-guard.ts puede cargar en el Edge runtime. jwt()/session() no
// tocan I/O, así que son seguros aquí y se reusan desde config.ts.
export const authConfig = {
  session: { strategy: "jwt" },
  pages: { signIn: "/login" },
  providers: [],
  // Auth.js v5 rechaza el Host header salvo que confíe en la plataforma
  // (Vercel, etc.) o se le diga explícitamente — self-hosted en localhost
  // (`next start`/E2E, y despliegues detrás de un proxy propio) necesita
  // esto para no fallar con "UntrustedHost" en cada request de auth.
  trustHost: true,
  callbacks: {
    async jwt({ token, user }) {
      // Solo en el sign-in inicial (user presente): nunca se muta `token`
      // (AGENTS.md §2), se devuelve una copia con los claims añadidos.
      if (user && typeof user.id === "string") {
        const tokenWithClaims = { ...token, userId: user.id, role: user.role };
        return tokenWithClaims;
      }
      return token;
    },
    async session({ session, token }) {
      const claims = jwtClaimsSchema.safeParse(token);
      if (!claims.success) {
        return session;
      }
      // Copia de `session`/`session.user`, nunca mutación del parámetro
      // recibido (AGENTS.md §2).
      const sessionWithUser = {
        ...session,
        user: { ...session.user, id: claims.data.userId, role: claims.data.role },
      };
      return sessionWithUser;
    },
  },
} satisfies NextAuthConfig;
