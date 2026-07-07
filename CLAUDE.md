# CLAUDE.md

Este archivo da a Claude Code el contexto operativo de este repositorio. Las convenciones de código detalladas están en [`AGENTS.md`](./AGENTS.md) — léelo antes de escribir o modificar código; es la fuente de verdad y aplica también a otras herramientas de codificación, no solo a Claude Code.

## Qué es este proyecto

Monorepo demo (no producto real) que demuestra un stack frontend profesional: React + Next.js + TypeScript + Zod + TanStack Query + Zustand, con un backend fake propio (Prisma + SQLite) en lugar de mocks estáticos. Contexto completo en `docs/PROJECT_SPECIFICATION.md`, `docs/ARCHITECTURE.md` y `docs/ROADMAP.md`.

**Estado actual: Fase 0 (documentación). No hay código todavía** — no asumas que existen `apps/` o `packages/` hasta que el roadmap indique que la Fase 1 está completa.

## Cómo trabajar en este repo

- Antes de implementar algo, comprueba en `docs/ROADMAP.md` en qué fase estamos y qué tareas de esa fase siguen pendientes.
- Sigue `AGENTS.md` al pie de la letra: Server Components por defecto, TanStack Query vs. Zustand vs. Context API, Zod en los bordes, Atomic Design solo en `packages/ui`.
- No hay diseños de Figma. Antes de construir cualquier página/template, comprueba qué átomos/moléculas/organismos hacen falta en `packages/ui` y créalos ahí primero (workflow component-first, `AGENTS.md` principio 6) — nunca maquetes directamente en la página.
- No adelantes trabajo de fases futuras (p. ej. no montes `apps/admin` mientras la Fase 4 no esté cerrada) salvo que el usuario lo pida explícitamente.
- Comandos esperados una vez exista el tooling base (Fase 1): `pnpm install`, `pnpm turbo lint typecheck test build`, `pnpm turbo dev --filter=storefront`. Ajusta esta lista si el `turbo.json` real difiere.
- **Mejora continua activa** (desde el cierre de Fase 0, 2026-07-07): siempre que una decisión tomada durante el trabajo pueda derivar en una actualización, mejora o ampliación de las convenciones (`AGENTS.md`), los agentes/skills planificados (este documento) o el propio roadmap/arquitectura, se propone reflejarla en el documento correspondiente en el momento, no se deja pendiente ni se pierde entre sesiones. Igual de válido detectar y proponer una oportunidad de mejora no pedida explícitamente que aplicar una corrección pedida por el usuario.

## Multitasking con git worktrees

El trabajo en paralelo sobre distintos frentes (fases, features, spikes) se hace en worktrees separados, no cambiando de rama sobre un único directorio con cambios a medio commitear (`ARCHITECTURE.md` §8, `AGENTS.md` §7). Al planificar trabajo independiente:
- Usa `EnterWorktree`/`ExitWorktree` (o `isolation: "worktree"` al lanzar un subagente con `Agent`) cuando el trabajo sea razonablemente independiente y se beneficie de aislamiento del resto del repo.
- No asumas que el working directory activo es el único estado relevante del repo — puede haber otros worktrees con trabajo en curso.
- La app interna de gestión de worktrees mencionada en el backlog (`docs/ROADMAP.md`) es candidata, no comprometida: no la crees sin que el usuario lo pida explícitamente.

## Subagentes planificados (backlog — aún no creados)

Estos subagentes se definirán como archivos en `.claude/agents/*.md` durante la implementación (a partir de Fase 1/2), no en esta fase documental. Se listan aquí para que la intención quede registrada y no se pierda entre fases:

| Nombre propuesto | Propósito | Cuándo se activa |
|---|---|---|
| `feature-scaffolder` | Genera la estructura completa de una nueva feature (`api/hooks/services/schemas/types/utils/components`) siguiendo `AGENTS.md` | Al arrancar una feature nueva (Fase 4+) |
| `ui-component-generator` | Genera un átomo/molécula/organismo en `packages/ui` con su story y su test co-localizados | Al ampliar el design system (Fase 3) |
| `a11y-auditor` | Ejecuta y resume violaciones de axe sobre una ruta o componente dado | Antes de cerrar el DoD de accesibilidad de cada fase |
| `contract-sync-checker` | Compara el esquema Prisma de `apps/api` con los esquemas Zod de `packages/shared-types` y señala drift | Tras cualquier cambio en el esquema de datos (Fase 2+) |
| `test-reviewer` | Audita cobertura y calidad de los tests de una feature/PR (Testing Trophy y convenciones de `AGENTS.md §6`) con contexto aislado y ojos frescos | Antes de crear PR, sobre el diff de la rama actual (Fase 4+, en cuanto existan features con tests reales) |
| `bug-hunter` | Revisión de código enfocada en bugs de dominio y violaciones de las reglas no negociables del proyecto (Zod en los bordes, inmutabilidad, límite Server/Client...); complementario al `/code-review` genérico de Claude Code, no un sustituto | Antes de crear PR, como paso previo/adicional al `/code-review` (Fase 2+, en cuanto haya lógica de negocio real) |
| `frontend-architect` | Asesora en decisiones de patrones de React/Next.js (Server vs. Client, dónde vive el estado, composición vs. herencia...) para componentes o estructuras complejas, leyendo `ARCHITECTURE.md` y `AGENTS.md` | Al diseñar un componente/feature no trivial, antes de implementarlo (Fase 3+, cuando aparezcan organismos o features con estado complejo) |

*Se descarta explícitamente un cuarto agente genérico de "desarrollo frontend": ese rol ya queda cubierto por `feature-scaffolder` + `ui-component-generator` + el propio `AGENTS.md`, y un agente adicional solaparía sin aportar alcance nuevo.*

## Skills planificadas (backlog — aún no creadas)

Se definirán en `.claude/skills/` cuando arranque la implementación:

| Skill | Qué hace |
|---|---|
| `/new-feature` | Scaffolding de una feature nueva respetando la estructura de `AGENTS.md` §3 |
| `/new-ui-component` | Scaffolding de un componente de `packages/ui` con story + test |
| `/check-a11y` | Corre `@axe-core/playwright` contra una ruta y resume violaciones |
| `/sync-contracts` | Verifica coherencia entre Prisma y `shared-types` |
| `/write-tests` | Genera/completa tests (unitario/integración, co-localizados) para un componente, hook o feature dados, siguiendo el Testing Trophy y las convenciones de `AGENTS.md §6` |
| `/open-pr` | Ejecuta el gate de Definición de Hecho de `AGENTS.md §6` (lint+typecheck+test+build en verde, sin `console.log`/`debugger` pendientes, cobertura) y redacta la descripción de la PR siguiendo Conventional Commits (`AGENTS.md §7`) antes de abrirla |

*No se planifica un skill propio de revisión de código/bugs ni de decisiones de patrones React/Next.js: lo primero ya lo cubre el `/code-review` genérico de Claude Code más el agente `bug-hunter` (ver tabla de subagentes); lo segundo encaja mejor como consulta con contexto aislado (`frontend-architect`) que como procedimiento a ejecutar en la conversación principal. `/open-pr` es el gate mecánico final, distinto de ambos: no revisa contenido, comprueba que el pipeline está verde y da formato a la PR.*

## Qué NO hacer todavía

- No crear `.claude/agents/*.md` ni `.claude/skills/*` reales — eso corresponde a cuando arranque la Fase 1, no a esta fase de definición.
- No inicializar el monorepo (pnpm/turborepo/apps/packages) sin confirmación explícita del usuario; ahora mismo el entregable es documentación.
- El repositorio remoto ya existe: [github.com/afranco83/store-demo](https://github.com/afranco83/store-demo). Sigue aplicando la misma cautela para cualquier operación de `git` de alcance amplio o difícil de revertir (`push --force`, `reset --hard`, reescritura de historial): confirmación explícita del usuario antes de ejecutarla, igual que con cualquier otro repositorio.
