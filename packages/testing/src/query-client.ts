import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createElement } from "react";
import type { ReactElement, ReactNode } from "react";

export function createTestQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });
}

// Sin JSX a propósito (createElement en vez de <QueryClientProvider>): este
// paquete se importa también desde packages/api-client, que no tiene "jsx"
// configurado en su tsconfig (no lo necesita para su propio código) — un
// .tsx en el barrel obligaría a esos consumidores a resolver JSX igualmente.
export function createQueryWrapper(queryClient: QueryClient = createTestQueryClient()) {
  return function QueryWrapper({ children }: { children: ReactNode }): ReactElement {
    return createElement(QueryClientProvider, { client: queryClient }, children);
  };
}
