import { render, type RenderOptions } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ReactElement } from "react";

import { createQueryWrapper, createTestQueryClient } from "./query-client";

export function renderWithProviders(ui: ReactElement, options?: RenderOptions) {
  const wrapper = options?.wrapper ?? createQueryWrapper(createTestQueryClient());

  return {
    user: userEvent.setup(),
    ...render(ui, { ...options, wrapper }),
  };
}
