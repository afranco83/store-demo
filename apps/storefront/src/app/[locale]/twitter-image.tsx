// Next.js exige el mismo file-convention por separado para Twitter Card —
// reexporta el mismo generador que opengraph-image.tsx en vez de duplicar
// el JSX (AGENTS.md, DRY).
export { default, alt, size, contentType } from "./opengraph-image";
