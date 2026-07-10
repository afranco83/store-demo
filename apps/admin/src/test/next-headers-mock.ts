import { afterEach, vi } from "vitest";

// next/headers' cookies()/headers() solo funcionan dentro del request scope
// real de un servidor Next.js (usan AsyncLocalStorage) — bajo Vitest+jsdom
// (sin servidor Next real) revientan con "cookies was called outside a
// request scope". Se sustituyen por un almacén en memoria que se resetea
// entre tests, así el código de identidad de sesión (getApiToken) se puede
// ejercitar de verdad en tests unitarios/integración.
const cookieStore = new Map<string, string>();

vi.mock("next/headers", () => ({
  cookies: async () => ({
    get: (name: string) =>
      cookieStore.has(name) ? { name, value: cookieStore.get(name) as string } : undefined,
    set: (name: string, value: string) => {
      cookieStore.set(name, value);
    },
    delete: (name: string) => {
      cookieStore.delete(name);
    },
  }),
  headers: async () => new Headers(),
}));

afterEach(() => {
  cookieStore.clear();
});
