# AGENTS.md

Convenciones de código y buenas prácticas para trabajar en este repositorio. Válido para cualquier agente de codificación (Claude Code, Codex, Cursor...) y para el propio desarrollador. El contexto de negocio/producto vive en `docs/PROJECT_SPECIFICATION.md` y `docs/ARCHITECTURE.md`; este documento es puramente operativo.

Si algo aquí contradice `docs/ARCHITECTURE.md`, gana `ARCHITECTURE.md` y este archivo debe corregirse.

---

## 1. Principios no negociables

1. **Type Safety First**: ningún `any`. Todo dato externo (respuesta de API, formulario, `env var`, query param) se valida con Zod en el borde del sistema; el tipo de TypeScript se infiere del schema (`z.infer<typeof X>`), nunca se escribe a mano en paralelo.
2. **Domain Driven, no Atomic, en las apps**: dentro de `apps/*/src`, la organización es por dominio (`features/products`, `features/cart`...). Atomic Design (`atoms/molecules/organisms`) se usa **solo** dentro de `packages/ui`.
3. **`packages/ui` es ciego al negocio**: no importa Zod, TanStack Query, Zustand, ni nada de `features/*`. Recibe todo por props.
4. **Server Components por defecto**: en Next.js App Router, un componente solo lleva `"use client"` si necesita estado, efectos, listeners de eventos o APIs del navegador. Se marca lo más abajo posible en el árbol de componentes, nunca en un layout completo si no hace falta.
5. **Server state vs. client state vs. contexto**: TanStack Query para cualquier dato que viva en el backend (`apps/api`). Zustand para estado de UI mutable con lógica de actualización. Context API de React solo para valores semi-estáticos de configuración/inyección de dependencias en un subárbol (sesión, tema), nunca como sustituto de Zustand si empieza a acumular lógica. Nunca se sincroniza el mismo dato en dos de estas tres herramientas. **Mutaciones sobre listas** (una fila de una tabla, un ítem de un carrito...): si una misma instancia de `useMutation` puede dispararse para varios elementos de forma solapada (p. ej. actualizar dos líneas del carrito casi a la vez), usar `mutateAsync` y encadenar sobre la promesa devuelta (`.then/.catch/.finally`), nunca los callbacks del segundo argumento de `mutate(variables, { onSuccess, onSettled })` — TanStack Query desengancha el observer de la mutación anterior en cuanto se llama a `mutate()` de nuevo sobre la misma instancia, así que esos callbacks nunca llegan a dispararse para la primera llamada. El `onSuccess`/`onError` pasados al propio `useMutation({...})` (no a `mutate()`) no tienen este problema, ya que son estáticos y se disparan siempre.
6. **Component-first, sin diseño previo**: no hay mockups de Figma. Antes de implementar cualquier página o template, se identifican y crean/reutilizan en `packages/ui` los átomos/moléculas/organismos necesarios. Nunca se maqueta UI ad-hoc dentro de una página que debería vivir en el design system, ni "para ir más rápido y refactorizar después".
7. **Readability First**: el código se lee muchas más veces de las que se escribe, así que se optimiza para el lector, no para el autor. Nombres de variables y funciones explícitos, código autoexplicativo antes que comentarios que narren qué hace ("qué" lo dice el nombre; un comentario solo se justifica para explicar un "por qué" no obvio), y formato consistente delegado a Prettier/ESLint en todo el repo, nunca a criterio individual.
8. **KISS (Keep It Simple, Stupid)**: se implementa la solución más simple que resuelva el problema actual, sin sobre-ingeniería ni optimización prematura. Ante dos soluciones igual de correctas, gana la fácil de entender sobre la ingeniosa; ninguna capa de indirección, patrón de diseño o configuración extra se justifica por "quedar bien" o por generalidad no pedida.
9. **DRY (Don't Repeat Yourself)**: la lógica común de negocio se extrae a funciones/hooks, los componentes reutilizables viven en `packages/ui` y las utilidades compartidas en `packages/core`; se evita el copy-paste programming. Matiz importante: solo se extrae duplicación real del mismo concepto de dominio; dos fragmentos que hoy se parecen pero representan conceptos distintos que pueden divergir no se extraen (duplicación incidental). Además, criterio AHA de Kent C. Dodds (["prefer duplication over the wrong abstraction"](https://kentcdodds.com/blog/aha-programming), vía Sandi Metz): ante duda, se prefiere duplicar una vez o dos y esperar a que el patrón real se repita y "grite" pidiendo abstracción, en vez de abstraer a la primera duplicación sin tener aún claros todos los casos de uso — una abstracción prematura y equivocada es más cara de deshacer que la duplicación que evitaba.
10. **YAGNI (You Aren't Gonna Need It)**: no se construyen funcionalidades ni abstracciones antes de que el requisito real las exija; se evita la generalidad especulativa. Se empieza por la implementación más simple y se refactoriza cuando la necesidad aparece de verdad, no antes. Ver también §11 "Qué NO hacer" para las aplicaciones concretas (sin abstracciones para un único caso de uso, sin manejo de errores para escenarios imposibles).
11. **Single Responsibility, aplicado a funciones/hooks/componentes**: cada función, hook o componente tiene una única razón para cambiar. Una función que valida y además transforma y además notifica se divide en tres; un componente que renderiza y además orquesta lógica de negocio delega esa lógica a un hook (ver `AGENTS.md` estructura de features). Dos consecuencias de este principio ya aplicadas en otras reglas de este documento: extender comportamiento vía composición/variantes en vez de modificar lo existente (`compoundVariants` de `cva`, ver §5) y depender de abstracciones, no de implementaciones concretas (`features/*` depende de `packages/api-client`, nunca hace `fetch` directo, ver §11).

## 2. TypeScript/JavaScript

Convenciones de lenguaje (naming, inmutabilidad, async/errores). Ver también `§1.1` (Zod en los bordes, ningún `any`) y `§11` (qué no hacer).

**Naming de variables**: descriptivo y explícito, nunca abreviaturas crípticas ni nombres de una letra (salvo índices de bucle).

```ts
// PASS
const marketSearchQuery = "election";
const isUserAuthenticated = true;
const totalRevenue = 1000;

// FAIL
const q = "election";
const flag = true;
const x = 1000;
```

**Naming de funciones**: patrón verbo-sustantivo que describe la acción, nunca un sustantivo solo.

```ts
// PASS
async function fetchMarketData(marketId: string) {}
function calculateSimilarity(a: number[], b: number[]) {}
function isValidEmail(email: string): boolean {}

// FAIL
async function market(id: string) {}
function similarity(a, b) {}
function email(e) {}
```

**Inmutabilidad (crítico)**: nunca se muta un objeto/array recibido por parámetro o leído de estado — React, TanStack Query y Zustand asumen inmutabilidad para detectar cambios. Siempre spread u operaciones que devuelven una copia.

```ts
// PASS
const updatedUser = { ...user, name: "New Name" };
const updatedArray = [...items, newItem];

// FAIL
user.name = "New Name"; // muta el objeto original
items.push(newItem); // muta el array original
```

**Manejo de errores**: toda llamada a `fetch` (siempre dentro de `packages/api-client`, ver §11) comprueba `response.ok` y relanza un error explícito con contexto; nunca se asume que una promesa resuelta implica éxito.

```ts
// PASS
async function fetchData(url: string) {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    console.error("Fetch failed:", error);
    throw new Error("Failed to fetch data");
  }
}

// FAIL: sin manejo de errores
async function fetchData(url) {
  const response = await fetch(url);
  return response.json();
}
```

**Async/await**: llamadas independientes entre sí se lanzan en paralelo con `Promise.all`; secuencial solo cuando una llamada depende del resultado de la anterior.

```ts
// PASS: ejecución en paralelo
const [users, markets, stats] = await Promise.all([fetchUsers(), fetchMarkets(), fetchStats()]);

// FAIL: secuencial sin necesidad
const users = await fetchUsers();
const markets = await fetchMarkets();
const stats = await fetchStats();
```

**Type Safety**: ningún `any` (principio 1 de §1). A diferencia del ejemplo original de la fuente (que usa un `interface` escrito a mano), aquí el tipo de dominio se infiere de un schema Zod, coherente con `§1.1`.

```ts
// PASS
const marketSchema = z.object({
  id: z.string(),
  name: z.string(),
  status: z.enum(["active", "resolved", "closed"]),
  created_at: z.date(),
});
type Market = z.infer<typeof marketSchema>;

function getMarket(id: string): Promise<Market> {
  // Implementation
}

// FAIL: usar 'any'
function getMarket(id: any): Promise<any> {
  // Implementation
}
```

**Casing e identificadores**: `PascalCase` para clases, interfaces, types y componentes React; `camelCase` para variables, funciones, parámetros y propiedades; `CONSTANT_CASE` solo para constantes globales verdaderamente inmutables. Las siglas se tratan como una palabra más (`loadHttpUrl`, no `loadHTTPURL`). Sin prefijo `$` ni `_` como prefijo/sufijo. Los booleanos nunca se nombran en negativo (`isNotEnabled`); siempre con prefijo `is`/`are`/`has` (`isUserAuthenticated`, no `enabled`/`flag`).

**`interface` vs. `type`**: `interface` para la forma de objetos y contratos que se extienden (props de componentes, entidades de dominio); `type` para uniones, tuplas, tipos derivados/mapeados y cualquier tipo que combine otros con `|`/`&`. Si el tipo ya sale de un schema Zod (`z.infer`), no se re-declara como `interface` en paralelo (redundante con `§1.1`).

**Nunca `enum` de TypeScript**: a diferencia de lo que recomiendan algunas de las fuentes consultadas (enums nativos para constantes), en este proyecto los valores fijos se modelan como unión de literales de string derivada de `z.enum(...)` en el schema Zod correspondiente, igual que `status` en el ejemplo de Type Safety de arriba. Evita el código extra en tiempo de ejecución y las peculiaridades de los enums numéricos, y mantiene una única fuente de verdad (el schema) en vez de dos (`enum` + schema). Para un conjunto fijo de valores que **no** sale de un schema Zod (constantes puramente de UI/lógica interna), tampoco se usa `enum`: se usa un objeto/array `as const` y el tipo se deriva de ahí. Este criterio coincide con la recomendación de [Matt Pocock (Total TypeScript)](https://www.totaltypescript.com/why-i-dont-like-typescript-enums): los enums numéricos generan un mapping bidireccional inconsistente con los de string, no son tipado estructural (dos enums con los mismos valores no son intercambiables) y no son "erasable" (no desaparecen limpiamente al compilar a JS), a diferencia del resto de las anotaciones de tipos.

**Parámetros de función**: máximo 2 parámetros posicionales; a partir de ahí, un único objeto desestructurado (`function createOrder({ userId, items, couponCode }: CreateOrderInput)`, no `function createOrder(userId, items, couponCode, notify, source)`). Facilita añadir/quitar campos sin romper la firma en cada call site y hace innecesario recordar el orden posicional.

**Aserciones y `@ts-ignore`**: nunca `x as T` ni `y!` (non-null assertion) para silenciar el compilador; si el tipo real no se puede garantizar de otro modo, se usa una comprobación en runtime (`instanceof`, chequeo de null/undefined, o el propio `.parse()`/`.safeParse()` de Zod) o el checkeo de exhaustividad de abajo. `@ts-ignore` nunca se usa: si el tipo falla, se corrige el tipo, no se silencia el error.

**Exhaustividad en uniones discriminadas**: todo `switch`/cadena de `if` sobre una unión de literales (p. ej. `status` de `Market`) termina en un caso `default`/`else` que asigna el valor a `never`, para que TypeScript avise en compilación si se añade un nuevo caso sin manejar.

```ts
function getStatusLabel(status: Market["status"]): string {
  switch (status) {
    case "active":
      return "Activo";
    case "resolved":
      return "Resuelto";
    case "closed":
      return "Cerrado";
    default:
      const _exhaustive: never = status;
      return _exhaustive;
  }
}
```

**Utility types**: `Pick`/`Omit`/`Partial`/`Record` para derivar variantes de un tipo ya existente (evita redefinir campos a mano, ver `§1.9` DRY). Si el tipo de origen viene de un schema Zod, se deriva con los métodos del propio schema (`schema.pick({...})`, `schema.omit({...})`, `schema.partial()`) para que la variante siga validándose en runtime, no solo a nivel de tipos.

**Imports de solo-tipo**: los imports que solo se usan como tipo se marcan con `import type { X } from '...'`. A diferencia de lo que sugiere una de las fuentes consultadas (evitar `import type`), en este proyecto Next.js compila cada archivo de forma aislada con SWC, que no siempre puede distinguir un import de tipo de uno de valor sin la anotación explícita; omitirla puede dejar imports fantasma en el bundle o romper la transpilación aislada.

**Rutas de import**: relativas (`./`, `../`) dentro del mismo paquete/feature; alias del workspace (`@repo/ui`, `@repo/shared-types`...) al cruzar de un paquete a otro. Nunca más de dos niveles de `../../` — si hace falta más, es señal de que el archivo está mal ubicado.

**Modo estricto**: `strict: true` (y por tanto `noImplicitAny`, `strictNullChecks`...) obligatorio en el `tsconfig.json` de cada app/paquete, sin excepciones locales.

**Control de flujo e iteración**: siempre `===`/`!==`, salvo `== null` para cubrir `null` y `undefined` a la vez. `switch` siempre con `default`. Para transformar datos, `.map`/`.filter`/`.reduce`; para iterar con efecto secundario, `for...of` en vez de `.forEach`.

**Magic numbers/strings**: ningún literal numérico o de string con significado de negocio suelto en el código; se extrae a una constante con nombre (`MAX_CART_ITEMS`, no un `10` sin contexto).

**Código de depuración**: ningún `debugger` ni `console.log` de depuración llega a una PR; `console.error`/`console.warn` deliberados (como en el ejemplo de manejo de errores de arriba) sí son aceptables.

## 3. Estructura y naming

- **Componentes**: `PascalCase.tsx`, un componente por archivo. Carpeta con el mismo nombre si tiene archivos asociados: `Button/Button.tsx`, `Button/Button.stories.tsx`, `Button/Button.test.tsx`, `Button/index.ts` (barrel que reexporta).
- **Hooks**: `camelCase.ts`, prefijo `use`. Ubicación según alcance:
  - Solo usado por un componente → junto al componente.
  - Usado dentro de una feature → `features/<dominio>/hooks/`.
  - Compartido entre features/apps → `packages/core/hooks/`.
- **Carpetas**: `kebab-case` salvo las de Next.js App Router que siguen su propia convención (`[slug]`, `(group)`, etc.).
- **Esquemas Zod**: `nombreEntidad.schema.ts`, exportando el schema y el tipo inferido juntos (`export const productSchema = z.object(...); export type Product = z.infer<typeof productSchema>;`).
- **Barrels (`index.ts`)**: uno por carpeta de feature/componente para exponer API pública; no reexportar internals no destinados a uso externo. Nunca un barrel sobre una librería de iconos u otra colección grande de terceros (`import { X } from 'my-icons'`) — el compilador tiene que parsear el barrel entero aunque solo se use un icono, lo que ralentiza el arranque de `next dev`; se importa directo desde el módulo específico del paquete (`my-icons/dist/X`).
- **Exports**: nombrado siempre, salvo en archivos que Next.js exige `default` (páginas, layouts, route handlers).

## 4. Formularios

- Siempre React Hook Form + `zodResolver` sobre el schema de dominio correspondiente (de `shared-types` si existe, o local a la feature si es puramente de UI).
- Nunca estado manual de formulario (`useState` por campo) cuando hay más de un campo.
- Mensajes de error de validación derivados del propio schema Zod (`.min(1, 'mensaje')`), no hardcodeados en el componente.

## 5. Estilos

- TailwindCSS utility-first exclusivamente. Sin CSS-in-JS, sin módulos CSS salvo caso excepcional justificado. Nunca `@apply` para crear pseudo-clases de componente (`.btn-primary { @apply ... }`): el mecanismo de extracción es el componente de React (`packages/ui`), no una capa CSS intermedia — es la misma regla de "no reconstruir lo que ya resuelve la herramienta", aplicada a Tailwind.
- Partimos de los tokens por defecto de Tailwind (paleta, tipografía, espaciado); solo se personaliza lo justificado (colores de marca puntuales, tipografía propia) vía `packages/tailwind-config`/`packages/design-tokens`. No se reconstruye la paleta completa desde cero ni se monta un pipeline de tokens multiplataforma.
- Ningún color/espaciado/tipografía "mágico" fuera del preset compartido. Los valores arbitrarios (`bg-[#316ff6]`, `top-[117px]`) son una válvula de escape para un ajuste puntual, no la norma; si el mismo valor arbitrario se repite más de una vez, es la señal de que debe promocionarse al preset (`packages/design-tokens`), no seguir copiado en cada sitio que lo necesita.
- Variantes de componente (tamaño, intención visual) gestionadas con `cva`, no con clases condicionales manuales repetidas. Para combinaciones de variantes con un caso especial (p. ej. `size="lg"` + `intent="danger"` necesita un ajuste que no se deduce de sumar ambas por separado), se usa `compoundVariants` de `cva`, no un `if` externo que parchea el resultado después.
- **Composición condicional (`cx`)**: para combinar clases con lógica (varios flags booleanos independientes, no solo un binario simple), se usa `cx` (re-exportado por `cva`, equivalente a `clsx`) en vez de concatenar strings o anidar template literals. Para un único condicional binario, un ternario simple en el `className` es preferible y más legible que `cx` con un solo flag.
- **Sobreescritura desde consumidores (`twMerge`)**: `cva` cubre las variantes ya previstas por el propio componente; `twMerge` es la vía para cuando el consumidor necesita personalizar algo que esas variantes **no** contemplan (vía un prop `className` que el componente acepta y fusiona con sus clases base). `twMerge` resuelve el conflicto de utilidades de Tailwind (gana la última clase en conflicto, p. ej. `p-3` sobre `px-2 py-1`) en vez de dejar ambas clases contradictorias en el DOM. Patrón estándar, centralizado en un único helper de `packages/ui`:

```ts
// packages/ui/utils/cn.ts
import { cx, type ClassValue } from "class-variance-authority";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(cx(...inputs));
}
```

- **Nunca clases Tailwind construidas por interpolación de datos dinámicos** (`` `bg-${color}-500` ``, con `color` viniendo de una API/BD): el compilador JIT de Tailwind solo detecta strings de clase completos de forma estática, así que esa clase se purga en producción y el estilo desaparece. Para valores realmente dinámicos (color de marca de un pedido, etc.) se usan variables CSS vía `style` inline (`style={{ '--bg-color': color }}` + clase `bg-(--bg-color)`), nunca interpolación directa en el nombre de la clase.
- **Variantes de tema (dark mode) a nivel de token, no de componente**: cuando un token necesita un valor distinto en dark mode (p. ej. el acento de marca, que no llega a AA sobre fondos oscuros), se redefine la custom property en `packages/design-tokens/src/tokens.css` dentro de `@media (prefers-color-scheme: dark)`, nunca añadiendo clases `dark:` sueltas por cada componente que use ese token — las utilidades de Tailwind ya apuntan a la custom property, así que heredan el cambio sin tocar `packages/ui`. Si una utilidad con modificador de opacidad (`bg-accent/10`) necesita una opacidad distinta según el tema, esa opacidad no puede variar con un modificador estático: se promociona a un token propio (`--color-accent-soft`) con su propio valor por tema, siguiendo el mismo criterio de "value se repite/diverge → sube al preset" de la regla de arriba.

## 6. Testing

**Modelo mental — Testing Trophy** ([Kent C. Dodds](https://kentcdodds.com/blog/write-tests)): de más a menos inversión, tests estáticos (TypeScript en modo estricto + ESLint, ver §2 — la capa más barata y ya obligatoria en este proyecto) → tests de integración (la inversión más grande: features completas con `renderWithProviders` + MSW) → tests unitarios (los justos, para lógica pura con muchos casos) → E2E (pocos, ver bullet de pirámide de E2E más abajo). Se prioriza integración sobre unitario porque "no importa que el componente `<A />` renderice `<B />` con las props correctas si `<B />` realmente rompe con una prop que falta" — un test unitario aislado no lo detectaría, uno de integración sí. Principio guía: cuanto más se parece el test a cómo se usa realmente la aplicación, más confianza da.

- Todo componente de `packages/ui` lleva test de render + verificación de accesibilidad básica (sin violaciones de axe).
- Todo hook de dominio (`features/*/hooks`) lleva test unitario con `renderHook`.
- Toda feature crítica de negocio (carrito, checkout, auth) lleva al menos un test de integración con MSW y un spec E2E en Playwright.
- Los fixtures de test se generan a partir de los mismos esquemas Zod de `shared-types` (vía `packages/testing`), nunca objetos literales inventados a mano que puedan divergir del contrato real. Los valores concretos se generan con Faker (`@faker-js/faker`) en vez de placeholders repetidos (`'test'`, `'foo'`), para que los datos se parezcan a los reales y el test no dependa de un valor mágico concreto.
- **Ubicación**: el test se crea y vive siempre junto al archivo que testea (`Button/Button.test.tsx` junto a `Button/Button.tsx`, ver §3), nunca en una carpeta `__tests__` separada ni centralizado al margen del código.
- **Alcance (caja negra)**: se testea lógica y comportamiento observable (entradas → salidas, cambios de estado, interacción de usuario), nunca estilos, CSS ni detalles internos de implementación (no se hacen aserciones sobre estado interno, funciones privadas o que "se llamó a tal función interna" si eso no forma parte del contrato público). La verificación de a11y (sin violaciones de axe) no es un test de estilo: comprueba semántica/ARIA, no apariencia visual, así que no contradice esta regla.
- **Cantidad**: se evitan tests redundantes (que verifiquen lo mismo dos veces) e innecesarios (sobre getters/wrappers triviales sin lógica) — mismo criterio que KISS/YAGNI (§1.8, §1.10) aplicado a los tests. Tampoco se construyen abstracciones/helpers de test propios más allá de los ya centralizados en `packages/testing` (`renderWithProviders`, factories); el código de test se mantiene plano y simple. Aplica también AHA Testing (§1.9): cierta duplicación entre tests (repetir un `render` + setup similar en dos casos parecidos) es preferible a una abstracción de test prematura que luego hay que llenar de parámetros condicionales para cubrir el siguiente caso que no encajaba.
- **Naming**: la descripción de cada test empieza por `should` y tiene tres partes — qué se testea, bajo qué escenario y qué resultado se espera —, nunca solo la implementación (`should throw an error when the email is invalid`, no `test email` o `email validation`).
- **Comentarios**: ninguno salvo estrictamente necesario; el nombre del test y las aserciones deben ser autoexplicativos (Readability First, §1.7).
- **Idioma**: código de test (nombres, `describe`/`it`, mensajes) siempre en inglés, igual que el resto del código de la base.
- **Definición de hecho**: un test o batería de tests no se da por terminado hasta que (a) el propio test/batería pasa en verde, (b) no hay errores de tipado ni de lint, y (c) el formato es correcto. Después se ejecuta la suite completa (`pnpm turbo lint typecheck test build`, ver `CLAUDE.md`) para confirmar que no se ha roto nada más.
- Si cualquiera de esas comprobaciones falla, se corrige de inmediato — nunca se deja un error de tipado, lint o test pendiente para después.
- **Selectores (Testing Library)**: prioriza `getByRole` y otros selectores accesibles (`getByLabelText`, `getByText`) sobre cualquier otro; refuerza el objetivo de accesibilidad de `§8`, ya que si `getByRole` no encuentra el elemento suele ser señal de un problema real de a11y. `data-testid` es el último recurso, solo cuando no hay rol ni texto accesible, con convención `data-testid="nombre-en-kebab-case"`. _Nota_: esto es una desviación deliberada de una de las fuentes consultadas (`javascript-testing-best-practices`), que recomienda `data-test-id` como selector principal — esa guía es agnóstica de framework/librería; aquí usamos específicamente React Testing Library, cuya filosofía (y la nuestra, dado el objetivo WCAG 2.1 AA de `§8`) es que un selector por rol/texto accesible es a la vez más resistente a refactors de UI y una prueba en sí misma de que el componente es accesible.
- **Renderizado real**: siempre que sea posible se renderiza el componente completo con sus dependencias reales (o `renderWithProviders` de `packages/testing`), evitando mocks parciales de componentes hijos — un mock parcial puede ocultar bugs de integración entre padre e hijo que sí ocurrirían en producción.
- **Esperas asíncronas**: nunca `setTimeout`/pausas arbitrarias para esperar una actualización; se usan las utilidades async de Testing Library (`findBy*`, `waitFor`) o de Playwright, que esperan la condición real en vez de un tiempo fijo.
- **Interacción**: siempre `userEvent`, nunca `fireEvent` — `userEvent` simula la secuencia real de eventos del navegador (p. ej. hover antes de click); `fireEvent` solo dispara el evento de forma aislada y puede dar falsos positivos.
- **Debug**: `screen.debug()` solo durante el desarrollo local del test, nunca en el código que se commitea (mismo criterio que el código de depuración de `§2`).
- **Stubs/spies sobre mocks pesados**: para dependencias externas lentas (llamadas a `apps/api`) se usan stubs (MSW, ver bullet de arriba) que simulan la respuesta real, no mocks que verifiquen "se llamó con estos argumentos" salvo que ese sea el comportamiento que realmente importa verificar.
- **Patrón AAA**: cada test se estructura en tres bloques — Arrange, Act, Assert — sin mezclar preparación y aserciones.

```ts
it('should increment the counter on click', async () => {
  // Arrange
  render(<Counter />)

  // Act
  await userEvent.click(screen.getByRole('button', { name: /increment/i }))

  // Assert
  expect(screen.getByText('Count: 1')).toBeInTheDocument()
})
```

- **Server Components asíncronos**: ningún test runner basado en Node (Vitest incluido) soporta hoy renderizar de forma aislada un Server Component async de Next.js; esos componentes se cubren con specs E2E de Playwright, no con tests unitarios/integración.
- **Mock de `next/navigation`**: si un componente usa `useRouter`/`usePathname` del App Router, se mockea explícitamente. Este proyecto usa **Vitest**, no Jest (ver `docs/PROJECT_SPECIFICATION.md`), así que es `vi.mock`/`vi.fn`, no `jest.mock`/`jest.fn`:

```ts
vi.mock("next/navigation", () => ({
  useRouter() {
    return { prefetch: () => null, push: vi.fn() };
  },
}));
```

- **Independencia**: ningún test depende del orden de ejecución ni de efectos secundarios dejados por otro test; `beforeEach`/`beforeAll` resetea mocks y estado (`vi.clearAllMocks()` o equivalente) antes de cada test. Cada test genera su propio dataset (vía las factories de `packages/testing`), nunca depende de fixtures globales compartidas y mutables entre tests.
- **Happy path + bordes**: además del caso feliz, todo test de integración de una feature crítica (ver bullet de MSW más arriba) cubre al menos un error de API, un estado de carga y una entrada de usuario inválida.
- **Pirámide de E2E**: los specs E2E de Playwright son pocos y de alto valor (flujos completos críticos, ver ARCHITECTURE.md §testing), no una réplica exhaustiva de los tests unitarios/integración a nivel de UI. Para los flujos que requieren login (admin), se autentica una sola vez y se reutiliza el estado de sesión (`storageState` de Playwright) entre specs, en vez de repetir el login en cada test.
- **Smoke test E2E**: además de los flujos críticos, un spec E2E ligero navega las rutas principales de cada app (storefront, admin) solo para detectar que ninguna rompe al desplegar, sin aserciones exhaustivas de contenido.
- **Cobertura**: umbral orientativo del ~80% en `packages/ui`, `packages/core` y `features/*/hooks`, exigido en CI (ver `ci.yml` en ARCHITECTURE.md); el número en sí no es el objetivo — ante un hueco de cobertura se revisa el reporte para ver si es una rama de error real sin cubrir, no solo para "subir el porcentaje".
- **Lint de tests**: `eslint-plugin-testing-library` y el plugin de ESLint para Vitest se incluyen en la config de lint (ver `§1.7`/`§2`) para detectar automáticamente selectores no accesibles, tests sin aserciones, tests con `.skip`/`.only` olvidados, etc.
- **Técnicas avanzadas (opcionales, no bloqueantes)**: para funciones puras con muchas combinaciones de entrada (p. ej. `calculateSimilarity` en `packages/core`), se puede usar property-based testing (`fast-check`) en vez de enumerar casos a mano. Mutation testing (Stryker) es una herramienta válida para auditar puntualmente si la suite realmente detecta bugs, no un requisito de cada PR.

## 7. Commits, ramas y worktrees

- Conventional Commits (`feat:`, `fix:`, `chore:`, `refactor:`, `test:`, `docs:`...), validado por commitlint.
- Una rama por feature/fase, PR (aunque sea de un solo revisor) antes de mergear a la rama principal.
- No usar `git commit --no-verify` ni saltarse hooks salvo excepción explícita y justificada.
- Trabajo en paralelo (varias fases/features/spikes a la vez) se hace con **git worktrees**, no cambiando de rama sobre el mismo directorio con cambios sin commitear a medias. Ver `ARCHITECTURE.md` §8.

## 8. Accesibilidad

- Objetivo WCAG 2.1 AA en todo componente interactivo de `packages/ui`: roles ARIA correctos, navegable por teclado, foco visible, contraste suficiente.
- Ningún componente interactivo se da por terminado sin pasar el addon a11y de Storybook en verde.

## 9. Performance

- **Imágenes**: siempre `next/image`, nunca `<img>` plano en código de aplicación — optimiza formato (WebP/AVIF), evita layout shift y hace lazy loading por defecto. La imagen principal visible sin scroll (candidata a LCP, p. ej. la imagen de producto en la página de detalle) lleva `priority` para que se cargue con prioridad alta, no lazy. Las imágenes de producto se alojan en **Cloudinary** (tier gratuito; ver `PROJECT_SPECIFICATION.md` §2); su dominio es el único declarado en `images.remotePatterns` de `next.config.js`, nunca con comodines abiertos. Se usa `next-cloudinary` (o el loader custom equivalente) en vez de reimplementar transformaciones de imagen a mano.
- **Fuentes**: `next/font`, nunca `<link>` a fuentes externas.
- **Code splitting**: explícito (`dynamic()`) para componentes pesados que no son parte del critical path (editores, gráficos, modales grandes).
- **Navegación**: siempre `<Link>` de `next/navigation` para enlaces internos, nunca `<a>` plano ni `router.push` cuando un enlace declarativo es suficiente — `<Link>` habilita el prefetch automático de la ruta.
- **Renderizado dinámico**: `cookies()`/`searchParams` fuerzan Dynamic Rendering de toda la ruta (o de toda la app si se usan en el layout raíz); su uso se aísla en el componente más pequeño posible y se envuelve en `<Suspense>` para no bloquear el resto de la página.
- **Escritura de cookies solo dentro de una invocación real**: `cookieStore.set()`/`.delete()` de `next/headers` solo funcionan dentro de una Server Action invocada de verdad (formulario o llamada desde un Client Component) o un Route Handler — nunca durante el render de un Server Component, aunque el archivo que se llama tenga `"use server"` en la cabecera. Llamar a una función `"use server"` directamente desde un `async function` Server Component (en vez de desde un evento/formulario) sigue contando como "render", no como invocación de acción, y revienta con `"Cookies can only be modified in a Server Action or Route Handler"`. jsdom no reproduce esta restricción, así que este bug no lo detectan los tests unitarios/integración — solo se ve corriendo la app de verdad (ver Fase 5, `docs/ROADMAP.md`).
- **Streaming**: `loading.tsx` + `<Suspense>` para servir UI progresivamente en rutas con un fetch lento, en vez de bloquear toda la ruta hasta que todos los datos estén listos.
- **Errores por ruta**: cada app tiene `error.tsx`/`not-found.tsx` en los segmentos que lo necesiten y un `global-error.tsx` en la raíz — ninguna ruta se queda sin una UI de error accesible.
- **Fetch entre servicios**: `apps/api` es una app Next.js independiente de `storefront`/`admin` (no el mismo proceso), así que sí se hace un fetch HTTP real desde Server Components hacia `apps/api` vía `packages/api-client`. La recomendación habitual de Next.js de "no llamar a tus propios Route Handlers desde Server Components" (para evitarse una vuelta de red) no aplica a esta arquitectura, precisamente porque aquí no son la misma app.
- **Caché de datos**: cada llamada de `packages/api-client` decide explícitamente su estrategia de caché/revalidación (`cache`/`next.revalidate` en la opción de `fetch`), nunca se deja el comportamiento por defecto sin decidirlo conscientemente.
- **Scripts de terceros**: siempre `next/script`, nunca `<script>` plano; la estrategia (`afterInteractive`, `lazyOnload`, `worker`) se elige según si el script es crítico o no. Scripts no críticos y pesados (analítica, ads) usan `strategy="worker"` para no bloquear el hilo principal.
- **Memoización** (`React.memo`/`useMemo`/`useCallback`): solo se aplica donde el profiler de React DevTools muestra un re-render costoso real, nunca por defecto ni especulativamente — mismo criterio KISS/YAGNI (§1.8, §1.10) aplicado al rendimiento: memoizar sin medir es la forma más común de sobre-ingeniería en React.
- **`useTransition`/`useDeferredValue`**: para actualizaciones de UI no urgentes disparadas por input rápido (filtros del catálogo, búsqueda), cuando el problema es de prioridad de render, no de frecuencia de llamadas.
- **Debounce**: operaciones costosas disparadas por input de usuario (búsqueda como-se-escribe) llevan debounce (~300 ms) antes de disparar la query.
- **Listas largas**: virtualización (`react-window` o equivalente) para listas de más de ~100 ítems (listado de catálogo, historial de pedidos), en vez de renderizar todos los nodos DOM de golpe.
- **Peso de dependencias**: antes de añadir una dependencia nueva se comprueba su peso (Bundlephobia/Import Cost). El bundle real se audita con `pnpm --filter <app> run analyze` (`next experimental-analyze -o`, nativo de Next.js) en `apps/storefront`/`apps/admin` cualquier momento que una dependencia se sienta pesada, no solo en la revisión final de Fase 8 — `@next/bundle-analyzer` (basado en Webpack) se evaluó en Fase 8 y se descartó por incompatible con Turbopack, el bundler de este proyecto (`§1`).
- **SEO/Metadata**: cada página pública de `storefront` usa la Metadata API (`export const metadata`/`generateMetadata`), nunca etiquetas `<head>` manuales.
- **Fuera de alcance deliberado**: no se implementa `useReportWebVitals` hacia un servicio de analítica — el proyecto excluye explícitamente "analítica de producto" (`PROJECT_SPECIFICATION.md` §1.1); Lighthouse CI (ya decidido en `ARCHITECTURE.md`) cubre la medición de Web Vitals sin necesitar analítica de producción.

## 10. Seguridad

- **Variables de entorno**: todo `.env*` en `.gitignore`; solo las variables realmente públicas llevan el prefijo `NEXT_PUBLIC_` (y por tanto acaban en el bundle del cliente) — el resto (secretos, tokens, connection strings) se queda exclusivamente en el servidor.
- **Defensa en profundidad**: cada mutación (Server Action o Route Handler de `apps/api`) revalida sesión/rol dentro de sí misma; el guard de middleware/página de `packages/auth` (ver `ARCHITECTURE.md` §4) es una capa adicional, no la única barrera de autorización.
- **Datos sensibles al cliente**: ninguna entidad con campos sensibles (p. ej. el hash de contraseña de `User`) se pasa completa a un Client Component ni se serializa en props; se proyecta al subconjunto público con `Pick`/`Omit` o el `.omit()` del schema Zod (ver §2) antes de cruzar el límite servidor→cliente.
- **CSP**: fuera de alcance obligatorio para v1 (demo sin datos reales ni usuarios, ver no-objetivos de `PROJECT_SPECIFICATION.md` §1.1); candidato de `ROADMAP.md` si en algún momento se decide reforzar la demo con esta capa de seguridad.

## 11. Qué NO hacer

- No introducir una abstracción nueva para un caso de uso único.
- No añadir manejo de errores/validación para escenarios que no pueden ocurrir dado el diseño del sistema.
- No mezclar lógica de negocio dentro de `packages/ui`.
- No hacer `fetch` directo fuera de `packages/api-client`.
- No dejar código muerto ni exports sin usar "por si acaso". Tampoco código comentado ("por si acaso lo necesito luego"): el historial de git ya es el registro de lo que existió; si hace falta recuperarlo, se busca ahí, no se deja comentado en el archivo.

## 12. Fuentes externas

Convenciones de este documento adaptadas (no copiadas literalmente) de fuentes externas. Se listan aquí, junto a la convención, para que quede trazado de dónde viene cada criterio cuando no es una decisión propia del proyecto.

| Sección                                  | Fuente                                                                                                                                                                                   |
| ---------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| §2 TypeScript/JavaScript                 | [ecc.tools](https://ecc.tools)                                                                                                                                                           |
| §2 TypeScript/JavaScript                 | [TypeScript Handbook — Do's and Don'ts](https://www.typescriptlang.org/docs/handbook/declaration-files/do-s-and-don-ts.html)                                                             |
| §2 TypeScript/JavaScript                 | [AWS Prescriptive Guidance — TypeScript best practices](https://docs.aws.amazon.com/es_es/prescriptive-guidance/latest/best-practices-cdk-typescript-iac/typescript-best-practices.html) |
| §2 TypeScript/JavaScript                 | [ts.dev — Style Guide](https://ts.dev/style/)                                                                                                                                            |
| §2 TypeScript/JavaScript                 | [Clean Code Principles for React + TypeScript (dev.to)](https://dev.to/dangkhoado43/clean-code-principles-code-conventions-for-react-typescript-3n7d)                                    |
| §2 TypeScript/JavaScript                 | [Buenas prácticas en TypeScript (Medium, S. Roldán)](https://medium.com/@_sroldan/buenas-pr%C3%A1cticas-en-typescript-tips-para-escribir-mejor-c%C3%B3digo-5b764f31bca4)                 |
| §2 TypeScript/JavaScript                 | [TypeScript code conventions (gist)](https://gist.github.com/anichitiandreea/e1d466022d772ea22db56399a7af576b)                                                                           |
| §6 Testing                               | [javascript-testing-best-practices (goldbergyoni)](https://github.com/goldbergyoni/javascript-testing-best-practices/blob/master/readme-es.md)                                           |
| §3 Estructura y naming                   | [Next.js — Local Development guide](https://nextjs.org/docs/app/guides/local-development)                                                                                                |
| §9 Performance                           | [Next.js — Production Checklist](https://nextjs.org/docs/app/guides/production-checklist)                                                                                                |
| §9 Performance                           | [Optimizing Performance in Next.js and React.js (dev.to)](https://dev.to/bhargab/optimizing-performance-in-nextjs-and-reactjs-best-practices-and-strategies-1j2a)                        |
| §9 Performance                           | [React Performance Optimization (softaims.com)](https://softaims.com/blog/react-performance-optimization)                                                                                |
| §10 Seguridad                            | [Next.js — Production Checklist](https://nextjs.org/docs/app/guides/production-checklist)                                                                                                |
| §5 Estilos                               | [Tailwind CSS — Styling with utility classes](https://tailwindcss.com/docs/styling-with-utility-classes)                                                                                 |
| §5 Estilos                               | [Tailwind CSS — Adding custom styles](https://tailwindcss.com/docs/adding-custom-styles)                                                                                                 |
| §5 Estilos                               | [class-variance-authority (cva) — docs](https://cva.style/docs)                                                                                                                          |
| §5 Estilos                               | [tailwind-merge — docs](https://github.com/dcastil/tailwind-merge#readme)                                                                                                                |
| §1 Principios / §6 Testing               | [AHA Programming — Kent C. Dodds](https://kentcdodds.com/blog/aha-programming)                                                                                                           |
| §6 Testing                               | [Write tests. Not too many. Mostly integration. (Testing Trophy) — Kent C. Dodds](https://kentcdodds.com/blog/write-tests)                                                               |
| §2 TypeScript/JavaScript                 | [Why I Don't Like TypeScript Enums — Matt Pocock (Total TypeScript)](https://www.totaltypescript.com/why-i-dont-like-typescript-enums)                                                   |
| §1 Principios / §2 TypeScript/JavaScript | [clean-code-javascript-es (trad. al español, difundido por midudev)](https://github.com/andersontr15/clean-code-javascript-es)                                                           |
