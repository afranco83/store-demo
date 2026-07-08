import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach } from "vitest";

// RTL only auto-registers its cleanup via a global `afterEach`; this project
// doesn't enable Vitest's `test.globals`, so it's wired explicitly here.
afterEach(() => {
  cleanup();
});
