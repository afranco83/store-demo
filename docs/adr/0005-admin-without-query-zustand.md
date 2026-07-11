# 0005. `apps/admin` sin TanStack Query ni Zustand

- **Estado**: Aceptada
- **Fecha**: 2026-07-10/11 (Fase 7)

## Contexto

`docs/ARCHITECTURE.md §5` fija TanStack Query para estado de servidor y Zustand para estado de cliente mutable con lógica de actualización, ya en uso en `apps/storefront` desde la Fase 4. Al construir `apps/admin` (CRUD de productos/categorías, gestión de pedidos), cabía replicar el mismo stack 1:1 con `apps/storefront`.

## Decisión

`apps/admin` no incluye `@tanstack/react-query` ni `zustand`. El CRUD completo de esta fase se resuelve con Server Actions + `revalidatePath`/`router.refresh()`/`router.push()` — mismo patrón que ya usaba `EditProfileForm` en `apps/storefront` desde la Fase 5.

## Alternativas consideradas

- **Replicar el stack de `apps/storefront` 1:1** (TanStack Query + Zustand): descartada por YAGNI — ninguna pantalla de esta fase necesita caché cliente-servidor sincronizada entre vistas distintas (el patrón que justifica TanStack Query) ni estado de UI con lógica de actualización compartida entre componentes (el patrón que justifica Zustand). Un CRUD con Server Actions + revalidación cubre el alcance real sin las dos dependencias.

## Consecuencias

- Si en el futuro aparece una necesidad real (p. ej. una vista con datos que se re-consultan con frecuencia sin recargar la página, o estado de UI compartido complejo), se añadiría entonces — no antes.
- `apps/admin` y `apps/storefront` no son intercambiables como referencia de patrón de estado: cualquiera que lea uno para replicar en el otro debe confirmar cuál aplica a su caso, no asumir que ambos siguen el mismo stack.
