"use client";

import { useEffect } from "react";
import { useLocale } from "next-intl";
import { z } from "zod";
import { en, es } from "zod/locales";

const ZOD_LOCALES = { es, en };

// Zod 4 trae mapas de error localizados nativos (zod/locales) — genéricos
// ("String must contain at least 1 character(s)"), no los mensajes
// específicos que tenían antes los schemas de packages/shared-types (p. ej.
// "La tarjeta debe tener 16 dígitos"), pero sí correctamente traducidos en
// ambos idiomas sin mantener dos copias de cada mensaje a mano. Solo aplica
// en cliente: z.config() es un estado global del módulo, seguro aquí (cada
// pestaña de navegador es un runtime propio) pero no en Server Actions,
// donde varias requests de locales distintos comparten el mismo proceso de
// Node — por eso ningún .action.ts usa esto; el failure_scenario de safeParse
// server-side ya devuelve un mensaje genérico traducido vía next-intl, nunca
// el mensaje crudo de Zod (ver create-order.action.ts/update-profile.action.ts).
export function ZodLocaleSync() {
  const locale = useLocale();

  useEffect(() => {
    const zodLocale = ZOD_LOCALES[locale as keyof typeof ZOD_LOCALES] ?? es;
    z.config({ localeError: zodLocale().localeError });
  }, [locale]);

  return null;
}
