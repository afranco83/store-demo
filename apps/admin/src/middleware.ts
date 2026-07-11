import { withAuthGuard } from "@store-demo/auth/middleware-guard";

// Toda la app exige sesión con rol admin, salvo login/403/las rutas técnicas
// excluidas por el matcher — a diferencia de apps/storefront (rutas privadas
// puntuales), apps/admin es privada por completo (ROADMAP.md Fase 7).
export default withAuthGuard({ protectedPaths: ["/"], requiredRole: "admin" });

export const config = {
  // Cada exclusión está anclada al segmento de ruta completo (seguida de
  // "/" o fin de cadena) — sin eso, la negative lookahead es un simple
  // prefijo de subcadena: "/login-audit" o "/api/authenticate" habrían
  // matcheado el prefijo "login"/"api/auth" y quedado, en silencio, fuera
  // del middleware (sin protección) si alguna vez se añade una ruta con
  // ese prefijo literal.
  matcher: ["/((?!login(?:/|$)|403(?:/|$)|api/auth(?:/|$)|_next(?:/|$)|favicon\\.ico$).*)"],
};
