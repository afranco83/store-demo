import type { DefaultSession } from "next-auth";
import type { UserRole } from "@store-demo/shared-types";

// Amplía los tipos de Auth.js con nuestros campos custom. `apiToken`
// deliberadamente NO se declara en `Session`: solo authorize() y el
// callback `signIn` lo tocan (para guardarlo en su propia cookie httpOnly,
// ver cookies.ts/get-api-token.ts) — nunca llega a session()/useSession(),
// así que nunca se serializa hacia el cliente.
declare module "next-auth" {
  interface User {
    role: UserRole;
    apiToken: string;
  }

  interface Session {
    user: {
      id: string;
      role: UserRole;
    } & DefaultSession["user"];
  }
}

// No se aumenta "next-auth/jwt" (TS no resuelve la augmentation contra el
// re-export de @auth/core en este setup de pnpm/moduleResolution) — los
// claims custom del JWT (userId/role) se validan en runtime con Zod donde
// se leen (auth.config.ts), no se tipan por cast.
