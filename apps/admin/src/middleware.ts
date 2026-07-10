import { withAuthGuard } from "@store-demo/auth/middleware-guard";

// Toda la app exige sesión con rol admin, salvo login/403/las rutas técnicas
// excluidas por el matcher — a diferencia de apps/storefront (rutas privadas
// puntuales), apps/admin es privada por completo (ROADMAP.md Fase 7).
export default withAuthGuard({ protectedPaths: ["/"], requiredRole: "admin" });

export const config = {
  matcher: ["/((?!login|403|api/auth|_next|favicon.ico).*)"],
};
