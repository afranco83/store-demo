import type { NextAuthConfig } from "next-auth";
import "./types";
import type { AppJwt } from "./types";

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
      const appToken = token as AppJwt<typeof token>;
      if (user) {
        appToken.userId = user.id as string;
        appToken.role = user.role;
      }
      return appToken;
    },
    async session({ session, token }) {
      const appToken = token as AppJwt<typeof token>;
      session.user.id = appToken.userId;
      session.user.role = appToken.role;
      return session;
    },
  },
} satisfies NextAuthConfig;
