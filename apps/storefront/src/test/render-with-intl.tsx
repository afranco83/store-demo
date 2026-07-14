import type { ReactElement, ReactNode } from "react";
import { NextIntlClientProvider } from "next-intl";
import {
  createQueryWrapper,
  createTestQueryClient,
  renderWithProviders as renderWithBaseProviders,
} from "@store-demo/testing";
import type { RenderOptions } from "@testing-library/react";

import messages from "@/i18n/translations/es.json";

// Envuelve renderWithProviders (packages/testing, genérico y sin next-intl —
// también lo usa apps/admin, que no tiene i18n) añadiendo NextIntlClientProvider
// con los mensajes reales en español: los componentes cliente de esta app
// llaman a useTranslations/useLocale y sin este contexto revientan en test
// ("no context was found"). Mensajes reales (no un stub) para que las
// aserciones de texto existentes sigan funcionando sin cambios. Anida el
// QueryClientProvider que ya monta renderWithProviders — ambos contextos
// hacen falta a la vez (hooks de TanStack Query + useTranslations/useLocale).
function createIntlQueryWrapper() {
  const QueryWrapper = createQueryWrapper(createTestQueryClient());

  return function IntlQueryWrapper({ children }: { children: ReactNode }) {
    return (
      <NextIntlClientProvider locale="es" messages={messages}>
        <QueryWrapper>{children}</QueryWrapper>
      </NextIntlClientProvider>
    );
  };
}

export function renderWithProviders(ui: ReactElement, options?: RenderOptions) {
  return renderWithBaseProviders(ui, { wrapper: createIntlQueryWrapper(), ...options });
}
