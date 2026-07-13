// Config de Lighthouse CI (ARCHITECTURE.md §6/§7). CommonJS (.cjs) porque
// el repo entero es "type": "module" y @lhci/cli carga este archivo con
// require().
//
// Requiere apps/api ya levantado en http://localhost:4000 con datos
// seedeados (igual que playwright.config.ts) — se usa aquí, de forma
// síncrona al cargar la config, para resolver un slug de producto real en
// vez de hardcodear uno derivado del seed (frágil si el seed cambia).
const { execSync } = require("node:child_process");

const API_URL = "http://localhost:4000";

function resolveFirstProductSlug() {
  const raw = execSync(`curl -s ${API_URL}/api/products`).toString();
  const { data: products } = JSON.parse(raw);
  if (!products?.length) {
    throw new Error(
      "No hay productos seedeados en apps/api — no se puede auditar /products/[slug].",
    );
  }
  return products[0].slug;
}

const productSlug = resolveFirstProductSlug();

module.exports = {
  ci: {
    collect: {
      startServerCommand: "next start",
      startServerReadyPattern: "Ready in",
      url: [
        "http://localhost:3000/",
        "http://localhost:3000/products",
        `http://localhost:3000/products/${productSlug}`,
      ],
      numberOfRuns: 3,
    },
    assert: {
      assertions: {
        // Presupuestos de ARCHITECTURE.md §6, afinados con datos reales
        // (Fase 8) contra apps/api + apps/storefront reales en local, bajo
        // el preset móvil por defecto de Lighthouse (Slow 4G + CPU 4x) —
        // ver docs/ROADMAP.md para el historial de medición.
        //
        // CLS y TBT: el presupuesto original (0.1 / 200ms) se mantiene
        // igual, ya cumplía con datos reales sin margen que ajustar.
        //
        // LCP: el original (2500ms) no era alcanzable en este entorno
        // (local, sin CDN/edge caching delante de Cloudinary, primera
        // navegación tras "next start" con JIT/compilación en caliente) —
        // medido en un rango real de ~2700-3500ms sobre 3 páginas × 3 runs.
        // Se sube a 3200ms como presupuesto honesto para este entorno; se
        // revisa a la baja si la Fase 8 termina desplegando una demo
        // pública con CDN real (ver ROADMAP.md, tarea de despliegue).
        "largest-contentful-paint": ["error", { maxNumericValue: 3200 }],
        "cumulative-layout-shift": ["error", { maxNumericValue: 0.1 }],
        "total-blocking-time": ["error", { maxNumericValue: 200 }],
        // INP no es una métrica de laboratorio fiable en una auditoría de
        // página única sin interacción real del usuario (es una métrica de
        // campo) — Lighthouse no emite un audit puntuable para ella aquí;
        // total-blocking-time es el proxy de laboratorio ya usado arriba.

        // Categoría SEO (post-roadmap, mejoras de SEO): 1.0 exigible de
        // verdad tras añadir metadataBase/robots.ts/sitemap.ts/Open
        // Graph/JSON-LD — no es un presupuesto relajado "por si acaso".
        "categories:seo": ["error", { minScore: 1 }],
      },
    },
    upload: {
      target: "filesystem",
      outputDir: "./.lighthouseci",
    },
  },
};
