import { createNavigation } from "next-intl/navigation";

import { routing } from "./routing";

// `Link`/`redirect`/`usePathname`/`useRouter` locale-aware: mismo API que sus
// equivalentes de next/navigation, pero preservan/anteponen el locale activo
// automáticamente (p. ej. Link a "/products" resuelve a "/en/products" si el
// locale activo es "en"). Usar estos en vez de los de next/navigation en
// cualquier código dentro de app/[locale].
export const { Link, redirect, usePathname, useRouter, getPathname } = createNavigation(routing);
