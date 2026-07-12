# @store-demo/api

Backend fake (`:4000`) — Next.js Route Handlers + Prisma + SQLite (vía libSQL), en vez de mocks estáticos. No es un microservicio real de producción: existe para que `apps/storefront`/`apps/admin` consuman datos reales tipados de extremo a extremo (Zod en el borde, ver `AGENTS.md §1.1`).

Identidad derivada siempre de un JWT propio verificado server-side (`Authorization: Bearer`, `src/lib/jwt.ts`) — nunca de un `userId` que el cliente ponga en la URL/body. `src/lib/guard.ts` centraliza `requireUser`/`requireAdmin`/`resolveCartIdentity` (usuario o invitado) y el guard de administración de `products`/`categories` (Fase 7).

## Rutas

`auth/{login,register}`, `products`, `products/[slug]`, `categories`, `categories/[slug]`, `cart`, `cart/[productId]`, `cart/merge`, `orders`, `orders/[orderId]`, `users/me`, `health`.

## Base de datos

SQLite local en fichero (`dev.db`, gitignored) vía el adapter de Prisma `@prisma/adapter-libsql` (`src/lib/prisma.ts`). Migraciones con Prisma.

```bash
cp apps/api/.env.example apps/api/.env
# UNSPLASH_ACCESS_KEY / CLOUDINARY_*: solo hacen falta para el seed "real"
# (fotos de producto reales) — ver prisma/seed.ts.

pnpm --filter @store-demo/api exec prisma migrate dev
pnpm --filter @store-demo/api run db:seed              # seed real (Unsplash + Cloudinary)
# o, sin credenciales externas (usado por el workflow de Lighthouse CI):
pnpm --filter @store-demo/api run db:seed:lighthouse
```

**Contra Turso (demo pública en Vercel)**: el mismo `@libsql/client` abre tanto `file:./dev.db` (local) como una URL remota `libsql://...-turso.io` sin cambiar código — solo hace falta fijar `DATABASE_URL` a la URL de Turso y `DATABASE_AUTH_TOKEN` al token generado (`turso db tokens create`). **`prisma migrate deploy`/`db seed` no funcionan contra `libsql://`** (el motor de migraciones de Prisma no reconoce ese esquema, solo el adapter de runtime lo hace) — para aplicar migraciones nuevas a Turso hay que ejecutar cada `migration.sql` directamente contra la base vía `@libsql/client`, no con los scripts `db:migrate`/`db:seed` de este `package.json`. Ver `docs/ARCHITECTURE.md §7` y la adenda de Fase 8 en `docs/ROADMAP.md` para el detalle de la decisión y el runbook completo.

`prisma/seed-shared.ts` centraliza categorías/usuarios/carrito/pedido de ejemplo, compartidos entre `seed.ts` (fotos reales) y `seed-lighthouse.ts` (imagen de muestra fija, sin llamadas externas).

## Cómo arrancar

```bash
pnpm turbo dev --filter=@store-demo/api
```

## Cómo verificar

```bash
pnpm turbo lint typecheck test build --filter=@store-demo/api
```

Cobertura de test: umbral 80% en `src/lib/guard.ts` (lógica de autorización). Los Route Handlers en sí se cubren por los specs E2E de `apps/storefront`/`apps/admin` contra esta API real, no por test unitario aislado.
