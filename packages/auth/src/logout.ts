"use server";

import { cookies } from "next/headers";
import { signOut } from "./config";
import { API_TOKEN_COOKIE } from "./cookies";

// Server Action de logout: limpia la cookie propia del token de apps/api
// (signOut() de Auth.js solo gestiona su propia cookie de sesión) y delega
// el resto (borrar la sesión, redirigir) en Auth.js.
export async function logout(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(API_TOKEN_COOKIE);
  await signOut({ redirectTo: "/" });
}
