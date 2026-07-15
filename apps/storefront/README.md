# @store-demo/storefront

Tienda pública (`:3000`) — primera app de negocio del monorepo. Catálogo (filtro por categoría), carrito (invitado o con sesión, fusión automática al loguearse), cuenta (login/registro/edición de perfil, historial de pedidos) y checkout de 3 pasos (envío → pago simulado → confirmación).

**Demo pública**: [store-demo-storefront-kappa.vercel.app](https://store-demo-storefront-kappa.vercel.app)

Organización por dominio (`src/features/{products,cart,auth,account,orders,checkout}`, `§Principios` (9, organización por dominio) del canon), Server Components por defecto, TanStack Query para estado de servidor y Zustand para estado de UI del carrito/wizard de checkout (`docs/ARCHITECTURE.md §5`).

## Qué puedes probar

- **Catálogo**: `/products`, filtrado por categoría, `/products/[slug]`.
- **Carrito**: añadir productos sin sesión (invitado) o logueado; se fusiona automáticamente al iniciar sesión.
- **Cuenta**: `/register` / `/login`, edición de nombre/email, historial de pedidos en `/account/orders`.
- **Checkout**: `/checkout` — dirección de envío, pago simulado (cualquier tarjeta de 16 dígitos vale, salvo que termine en `1`, que fuerza un rechazo simulado a propósito) y confirmación.

Usuarios demo (contraseña `Password123!`): `customer1@store-demo.test`, `customer2@store-demo.test`.

## Cómo arrancar

```bash
cp apps/storefront/.env.example apps/storefront/.env
# AUTH_SECRET: genera uno con `npx auth secret` o `openssl rand -base64 32`

pnpm turbo dev --filter=@store-demo/api          # backend fake en :4000, requisito
pnpm turbo dev --filter=@store-demo/storefront   # :3000
```

## Cómo verificar

```bash
pnpm turbo lint typecheck test build --filter=@store-demo/storefront
pnpm --filter @store-demo/storefront exec playwright test          # E2E, requiere apps/api levantado
pnpm --filter @store-demo/storefront exec lhci autorun              # Lighthouse, requiere build de producción + apps/api
pnpm --filter @store-demo/storefront run analyze                    # bundle real (next experimental-analyze)
```

Cobertura de test (`§Testing` del canon): umbral ≥80% en `src/features/**/{hooks,services,store,lib,schemas}`; páginas y componentes de composición Server/Client se cubren por integración/E2E, no por cobertura unitaria exhaustiva.
