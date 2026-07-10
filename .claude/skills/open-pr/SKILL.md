---
name: open-pr
description: Ejecuta el gate de Definición de Hecho de AGENTS.md §6/CLAUDE.md (lint+typecheck+test+build en verde sin caché, sin console.log/debugger pendientes, cobertura) y redacta la descripción de la PR en Conventional Commits antes de abrirla. Es el gate mecánico final, no revisa contenido/bugs — para eso están /code-review y el agente bug-hunter. Usar antes de crear o actualizar una PR.
---

Eres el último paso mecánico antes de abrir/actualizar una PR, no un revisor de contenido — si el usuario todavía no ha corrido `/code-review` y/o el agente `bug-hunter` sobre el diff, sugiérelo antes de continuar (son complementarios, no redundantes con esta skill).

## 1. Gate de Definición de Hecho

Corre el gate **sin caché**, tal como exige `CLAUDE.md` antes de cada push/PR:

```
pnpm turbo lint typecheck test build --force
```

Si algún paquete depende en build-time de otro servicio del monorepo (p. ej. `apps/storefront` haciendo fetch a `apps/api` en build/ISR/`revalidate`), repite el build con ese servicio **apagado** — CI arranca sin ningún backend levantado a mano y sin caché de Turborepo, y un cambio en un paquete compartido (`packages/ui`, `packages/testing`...) puede quedar verde en local por caché obsoleta sin que el hash de Turborepo lo capture (ver adenda de Fase 4, `docs/ROADMAP.md`).

Comprueba además:

- Ningún `console.log`/`debugger` de depuración pendiente (`console.error`/`console.warn` deliberados sí son aceptables, `AGENTS.md §2`).
- Cobertura sobre el umbral orientativo (~80% en `packages/ui`, `packages/core`, `features/*/hooks`) si el diff toca esos paquetes.
- Sin código muerto ni comentado "por si acaso" (`AGENTS.md §11`).

Si cualquier paso falla, corrígelo antes de seguir — nunca se abre una PR con el gate en rojo.

## 2. Redactar la descripción de la PR

Formato Conventional Commits para el título (`feat:`, `fix:`, `refactor:`, `test:`, `docs:`...) y cuerpo estructurado (resumen del cambio, motivación si no es obvia, plan de verificación) siguiendo `AGENTS.md §7`. Revisa el histórico de PRs ya mergeadas del repo (`gh pr list --state merged`) para mantener el mismo tono y nivel de detalle.

## 3. Confirmar antes de actuar sobre el repo remoto

Esta skill **prepara** el gate y la descripción; no ejecuta `git push` ni `gh pr create`/`gh pr edit` sin que el usuario confirme explícitamente cada vez — crear o actualizar una PR es una acción visible para otros sobre un repositorio remoto real (`github.com/afranco83/store-demo`), y la aprobación de una vez no cubre las siguientes (misma cautela que cualquier otra operación de git de alcance amplio en este proyecto).
