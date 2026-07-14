import { vi } from "vitest";

import esMessages from "@/i18n/translations/es.json";

// Mismo motivo que next-headers-mock.ts: getLocale()/getTranslations() de
// next-intl/server dependen del request scope real de Next.js (resuelto por
// el middleware + src/i18n/request.ts) — bajo Vitest (sin servidor Next
// real) revientan. Se sustituyen por un locale fijo ("es", el de por
// defecto) y una resolución de mensajes real contra i18n/translations/es.json
// (no un stub), para que las aserciones de texto existentes sigan funcionando.
// Interpolación simple de placeholders `{nombre}` — suficiente para los
// mensajes que hoy pasan por Server Actions/Componentes bajo test; el
// formato ICU de plurales (orders.itemCount) solo lo usan componentes sin
// test unitario propio hoy (OrderHistorySection) o vía el hook de cliente
// useTranslations (ReviewStep), que sí usa el motor real de next-intl.
function getNestedValue(source: unknown, path: string): unknown {
  return path.split(".").reduce<unknown>((acc, key) => {
    if (acc && typeof acc === "object" && key in acc) {
      return (acc as Record<string, unknown>)[key];
    }
    return undefined;
  }, source);
}

function createFakeTranslator(namespace?: string) {
  const scope = namespace ? getNestedValue(esMessages, namespace) : esMessages;

  return (key: string, values?: Record<string, string | number>) => {
    const raw = getNestedValue(scope, key);
    if (typeof raw !== "string") {
      return key;
    }
    if (!values) {
      return raw;
    }
    return raw.replace(/\{(\w+)\}/g, (_match, name: string) => String(values[name] ?? ""));
  };
}

vi.mock("next-intl/server", () => ({
  getLocale: async () => "es",
  setRequestLocale: () => {},
  getTranslations: async (arg?: string | { locale?: string; namespace?: string }) => {
    const namespace = typeof arg === "string" ? arg : arg?.namespace;
    return createFakeTranslator(namespace);
  },
}));
