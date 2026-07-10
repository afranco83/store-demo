---
name: frontend-patterns
description: Recetario de patrones de implementación de React/Next.js (composición, hooks reutilizables, performance, formularios, animación, accesibilidad) y proceso de decisión de arquitectura (Server vs. Client, dónde vive el estado, qué componente de packages/ui reutilizar o crear) para un componente/feature no trivial. Usar al escribir código de UI no trivial, o antes de implementarlo si hay una decisión de patrón genuinamente abierta. AGENTS.md manda siempre sobre esta skill si algo la contradice.
metadata:
  origin: adaptado de affaan-m/ECC (github.com/affaan-m/ECC/blob/main/skills/frontend-patterns/SKILL.md), mismo origen ya citado en AGENTS.md §12 como fuente de §2. La sección "Decisiones de arquitectura" absorbe el agente frontend-architect (2026-07-10) — se fusionó porque su naturaleza consultiva/interactiva (preguntas abiertas al usuario) no se beneficiaba de aislar contexto en un subagente, a diferencia de test-reviewer/bug-hunter.
---

# Patrones de frontend

Esta skill cubre dos cosas relacionadas: un recetario de patrones de implementación de React/Next.js, y el proceso a seguir para decidir qué patrón aplicar en un caso concreto antes de implementarlo. Las convenciones obligatorias de este proyecto (reparto de estado, formularios, estilos, testing) viven en `AGENTS.md` y ganan siempre si algo de aquí las contradice.

## Cuándo usarla

- Antes de implementar un componente/feature no trivial: qué patrón de estado, Server vs. Client, qué se reutiliza de `packages/ui` (ver "Decisiones de arquitectura" abajo)
- Componer componentes (composición, patrón compound, render props)
- Extraer hooks reutilizables (toggle, debounce, lógica de UI pura)
- Optimizar rendimiento (memoización, code splitting, virtualización)
- Trabajar con formularios (siempre React Hook Form + Zod en este proyecto, ver abajo)
- Accesibilidad de patrones interactivos (dropdowns, modales, navegación por teclado)

## Decisiones de arquitectura, antes de implementar

Para un componente o feature no trivial, antes de escribir código: propón, no implementes directamente.

1. Lee las secciones relevantes de `AGENTS.md` (§1 Principios, §5 Estilos si hay componente visual de por medio) y `docs/ARCHITECTURE.md` para el problema concreto.
2. Busca precedente real ya resuelto en el repo: ¿ya existe una feature o componente que resolvió un problema parecido? (`apps/storefront/src/features/*` para patrones de estado/datos, `packages/ui/src/{atoms,molecules,organisms}` para composición de UI). Prefiere seguir el patrón ya establecido antes que proponer uno nuevo (DRY/YAGNI, `AGENTS.md §1.9`/`§1.10`).
3. Si el problema requiere un átomo/molécula/organismo que no existe todavía en `packages/ui`, dilo explícitamente (principio "component-first", `AGENTS.md §1.6`) — nunca asumas que se puede maquetar ad-hoc en la página; usa `/new-ui-component` primero.
4. Aplica el reparto de estado de `AGENTS.md §1.5` sin excepciones: **TanStack Query** para cualquier dato que viva en `apps/api`; **Zustand** para estado de UI mutable con lógica de actualización; **Context** solo para valores semi-estáticos de configuración/DI en un subárbol (sesión, tema), nunca como sustituto de Zustand si acumula lógica. Nunca el mismo dato sincronizado en dos de las tres herramientas a la vez.

Estructura la propuesta así:

- **Propuesta**: el enfoque recomendado, concreto (qué vive dónde, qué se marca `"use client"`, qué componente de `packages/ui` se reutiliza o se crea).
- **Por qué encaja**: cita la sección exacta de `AGENTS.md`/`ARCHITECTURE.md` o el archivo de precedente que justifica la elección.
- **Alternativas descartadas**: qué otras opciones se consideraron y por qué se descartan — solo las que de verdad competían, no una lista exhaustiva.
- **Preguntas abiertas para el usuario**: si queda una decisión genuinamente de diseño (paleta, micro-interacción, naming de dominio, alcance de una nueva variante visual) que no se deduce de una convención ya escrita, formúlala como pregunta concreta — nunca la decidas en silencio y la presentes como hecho. En este proyecto, frontend/design system es un área donde el usuario quiere pesar en la decisión, no solo aprobar el resultado.

## Patrones de componentes

### Composición sobre herencia

```typescript
interface CardProps {
  children: React.ReactNode
  variant?: 'default' | 'outlined'
}

export function Card({ children, variant = 'default' }: CardProps) {
  return <div className={`card card-${variant}`}>{children}</div>
}

export function CardHeader({ children }: { children: React.ReactNode }) {
  return <div className="card-header">{children}</div>
}

export function CardBody({ children }: { children: React.ReactNode }) {
  return <div className="card-body">{children}</div>
}

// Usage
<Card>
  <CardHeader>Title</CardHeader>
  <CardBody>Content</CardBody>
</Card>
```

En `packages/ui`, las variantes (`variant`, `size`...) se gestionan con `cva`, no con template literals de clase como el ejemplo de arriba — ver `AGENTS.md §5` y la skill `/new-ui-component`.

### Compound Components

```typescript
interface TabsContextValue {
  activeTab: string
  setActiveTab: (tab: string) => void
}

const TabsContext = createContext<TabsContextValue | undefined>(undefined)

export function Tabs({ children, defaultTab }: {
  children: React.ReactNode
  defaultTab: string
}) {
  const [activeTab, setActiveTab] = useState(defaultTab)

  return (
    <TabsContext.Provider value={{ activeTab, setActiveTab }}>
      {children}
    </TabsContext.Provider>
  )
}

export function TabList({ children }: { children: React.ReactNode }) {
  return <div className="tab-list">{children}</div>
}

export function Tab({ id, children }: { id: string, children: React.ReactNode }) {
  const context = useContext(TabsContext)
  if (!context) throw new Error('Tab must be used within Tabs')

  return (
    <button
      className={context.activeTab === id ? 'active' : ''}
      onClick={() => context.setActiveTab(id)}
    >
      {children}
    </button>
  )
}

// Usage
<Tabs defaultTab="overview">
  <TabList>
    <Tab id="overview">Overview</Tab>
    <Tab id="details">Details</Tab>
  </TabList>
</Tabs>
```

Este uso de Context es válido: estado de UI puramente local al árbol de `Tabs` (qué pestaña está activa), no datos de servidor ni estado compartido fuera de ese subárbol — no choca con `AGENTS.md §1.5`.

### Render Props

```typescript
interface DataLoaderProps<T> {
  url: string
  children: (data: T | null, loading: boolean, error: Error | null) => React.ReactNode
}

export function DataLoader<T>({ url, children }: DataLoaderProps<T>) {
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    fetch(url)
      .then(res => res.json())
      .then(setData)
      .catch(setError)
      .finally(() => setLoading(false))
  }, [url])

  return <>{children(data, loading, error)}</>
}
```

**No uses este patrón en `apps/storefront`/`apps/admin` para datos reales de `apps/api`**: es un ejemplo genérico del patrón render-props, pero hace `fetch` directo fuera de `packages/api-client` y reimplementa lo que ya resuelve TanStack Query — ver la sección siguiente.

## Datos de servidor: usa TanStack Query, no un hook custom

`AGENTS.md §1.5` es explícito: cualquier dato que viva en `apps/api` pasa por TanStack Query, nunca por un hook de fetching reinventado a mano ni por Context+`useReducer`. El patrón real de este proyecto (ver `apps/storefront/src/features/cart/hooks/use-cart.ts` y `use-add-to-cart-mutation.ts`) es:

```typescript
// features/<dominio>/hooks/use-<recurso>.ts
export function useProduct(productId: string) {
  return useQuery({
    queryKey: productQueryKey(productId),
    queryFn: () => getProduct(productId), // packages/api-client, nunca fetch directo
  });
}
```

Para mutaciones sobre listas (varios ítems que pueden mutarse casi a la vez), usa `mutateAsync` encadenado sobre la promesa devuelta, nunca los callbacks del segundo argumento de `mutate()` — TanStack Query desengancha el observer de la llamada anterior en cuanto se invoca `mutate()` de nuevo sobre la misma instancia (`AGENTS.md §1.5`, gotcha real de la Fase 4).

## Hooks reutilizables de UI pura

Estos sí son útiles tal cual — son estado/efectos puramente locales al componente, no datos de servidor:

```typescript
export function useToggle(initialValue = false): [boolean, () => void] {
  const [value, setValue] = useState(initialValue);

  const toggle = useCallback(() => {
    setValue((v) => !v);
  }, []);

  return [value, toggle];
}

// Usage
const [isOpen, toggleOpen] = useToggle();
```

```typescript
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => clearTimeout(handler);
  }, [value, delay]);

  return debouncedValue;
}

// Usage: búsqueda como-se-escribe en el catálogo (AGENTS.md §9, ~300ms)
const [searchQuery, setSearchQuery] = useState("");
const debouncedQuery = useDebounce(searchQuery, 300);
```

## Estado compartido: Context solo para config semi-estática

`AGENTS.md §1.5` reparte el estado en tres herramientas, sin solapamiento: **TanStack Query** para datos de servidor, **Zustand** para estado de UI mutable con lógica, **Context** solo para valores semi-estáticos de configuración/DI en un subárbol (sesión, tema). Un patrón como el siguiente **no se usa en este proyecto**, aunque es común en otras bases de React:

```typescript
// PATRÓN NO USADO AQUÍ — Context+useReducer gestionando datos async de servidor
// Contradice AGENTS.md §1.5: esos datos (p. ej. productos) van por TanStack Query,
// y Context nunca sustituye a Zustand si empieza a acumular lógica de actualización.
const ProductsContext = createContext<{ state: State; dispatch: Dispatch<Action> } | undefined>(
  undefined,
);
```

Si necesitas estado de UI compartido con lógica (p. ej. el drawer del carrito), usa Zustand — ver `features/cart/store/use-cart-drawer-store.ts` como referencia real. Si necesitas config/DI semi-estática de subárbol (sesión, tema), usa Context sin reducer ni lógica de actualización compleja dentro.

## Formularios: React Hook Form + Zod, nunca `useState` por campo

`AGENTS.md §4` es literal: "Nunca estado manual de formulario (`useState` por campo) cuando hay más de un campo". El patrón real de este proyecto (`LoginForm`, `RegisterForm`, `EditProfileForm` en `apps/storefront/src/features/{auth,account}`) es React Hook Form + `zodResolver` sobre el schema de dominio:

```typescript
const createProductSchema = z.object({
  name: z.string().min(1, 'El nombre es obligatorio').max(200),
  description: z.string().min(1, 'La descripción es obligatoria'),
  endDate: z.string().min(1, 'La fecha es obligatoria'),
})
type CreateProductInput = z.infer<typeof createProductSchema>

export function CreateProductForm({ onSubmit }: { onSubmit: (data: CreateProductInput) => Promise<void> }) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CreateProductInput>({ resolver: zodResolver(createProductSchema) })

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input {...register('name')} placeholder="Nombre del producto" />
      {errors.name && <span className="error">{errors.name.message}</span>}
      {/* resto de campos */}
      <button type="submit" disabled={isSubmitting}>Crear</button>
    </form>
  )
}
```

Los mensajes de error salen del propio schema Zod (`.min(1, 'mensaje')`), nunca hardcodeados en el componente.

## Rendimiento

### Memoización

Solo donde el profiler de React DevTools muestra un re-render costoso real, nunca por defecto (`AGENTS.md §9` — memoizar sin medir es la forma más común de sobre-ingeniería en React):

```typescript
// Copia antes de ordenar — Array.prototype.sort muta in place
const sortedProducts = useMemo(() => {
  return [...products].sort((a, b) => b.priceCents - a.priceCents)
}, [products])

const handleSearch = useCallback((query: string) => {
  setSearchQuery(query)
}, [])

export const ProductCard = React.memo<ProductCardProps>(({ product }) => {
  return (
    <div className="product-card">
      <h3>{product.name}</h3>
    </div>
  )
})
```

### Code splitting

```typescript
import { lazy, Suspense } from 'react'

const HeavyChart = lazy(() => import('./HeavyChart'))

export function Dashboard() {
  return (
    <Suspense fallback={<ChartSkeleton />}>
      <HeavyChart data={data} />
    </Suspense>
  )
}
```

### Virtualización

`AGENTS.md §9` señala `react-window` (o equivalente) para listas de más de ~100 ítems (listado de catálogo, historial de pedidos):

```typescript
import { FixedSizeList } from 'react-window'

export function VirtualProductList({ products }: { products: Product[] }) {
  return (
    <FixedSizeList height={600} itemCount={products.length} itemSize={100} width="100%">
      {({ index, style }) => (
        <div style={style}>
          <ProductCard product={products[index]} />
        </div>
      )}
    </FixedSizeList>
  )
}
```

## Error Boundary

Next.js App Router ya resuelve la mayoría de los casos con ficheros por segmento (`error.tsx`/`global-error.tsx`, `AGENTS.md §9`) — ese es el mecanismo principal de este proyecto, no un componente de clase. Un `ErrorBoundary` manual solo tiene sentido para acotar un fallo más estrecho que un segmento de ruta completo (p. ej. aislar un widget de terceros dentro de una página que por lo demás debe seguir funcionando):

```typescript
interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  ErrorBoundaryState
> {
  state: ErrorBoundaryState = { hasError: false, error: null }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error boundary caught:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-fallback">
          <p>{this.state.error?.message}</p>
          <button onClick={() => this.setState({ hasError: false })}>Reintentar</button>
        </div>
      )
    }
    return this.props.children
  }
}
```

## Animación

Framer Motion **no es una dependencia adoptada todavía** en este proyecto — el ejemplo es ilustrativo, no una recomendación de añadirla sin más. Antes de introducirla, pasa por la regla de "peso de dependencias" de `AGENTS.md §9` (Bundlephobia/Import Cost).

```typescript
import { motion, AnimatePresence } from 'framer-motion'

export function Modal({ isOpen, onClose, children }: ModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            className="modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            className="modal-content"
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
          >
            {children}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
```

## Accesibilidad de patrones interactivos

Complementa (no sustituye) `AGENTS.md §8` — objetivo WCAG 2.1 AA en todo componente interactivo de `packages/ui`.

### Navegación por teclado

```typescript
export function Dropdown({ options, onSelect }: DropdownProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [activeIndex, setActiveIndex] = useState(0)

  const handleKeyDown = (e: React.KeyboardEvent) => {
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setActiveIndex(i => Math.min(i + 1, options.length - 1))
        break
      case 'ArrowUp':
        e.preventDefault()
        setActiveIndex(i => Math.max(i - 1, 0))
        break
      case 'Enter':
        e.preventDefault()
        onSelect(options[activeIndex])
        setIsOpen(false)
        break
      case 'Escape':
        setIsOpen(false)
        break
    }
  }

  return (
    <div role="combobox" aria-expanded={isOpen} aria-haspopup="listbox" onKeyDown={handleKeyDown}>
      {/* Dropdown implementation */}
    </div>
  )
}
```

### Gestión de foco

```typescript
export function Modal({ isOpen, onClose, children }: ModalProps) {
  const modalRef = useRef<HTMLDivElement>(null)
  const previousFocusRef = useRef<HTMLElement | null>(null)

  useEffect(() => {
    if (isOpen) {
      previousFocusRef.current = document.activeElement as HTMLElement
      modalRef.current?.focus()
    } else {
      previousFocusRef.current?.focus()
    }
  }, [isOpen])

  return isOpen ? (
    <div ref={modalRef} role="dialog" aria-modal="true" tabIndex={-1} onKeyDown={e => e.key === 'Escape' && onClose()}>
      {children}
    </div>
  ) : null
}
```

Este es el mismo patrón (guardar y restaurar el foco previo) que ya se necesitó para el focus trap de `CartDrawer` en la Fase 4 — reutilízalo antes de reimplementarlo para el próximo organismo modal/drawer.
