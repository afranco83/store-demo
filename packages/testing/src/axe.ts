import { axe } from "vitest-axe";
import { expect } from "vitest";

export async function expectNoAccessibilityViolations(container: Element) {
  const results = await axe(container);

  expect(results.violations).toEqual([]);
}
