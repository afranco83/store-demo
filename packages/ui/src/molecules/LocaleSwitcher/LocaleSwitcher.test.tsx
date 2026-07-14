import { describe, expect, it } from "vitest";
import { screen } from "@testing-library/react";
import { expectNoAccessibilityViolations, renderWithProviders } from "@store-demo/testing";

import { LocaleSwitcher } from "./LocaleSwitcher";

const options = [
  { code: "es", label: "ES", href: "/products" },
  { code: "en", label: "EN", href: "/en/products" },
];

describe("LocaleSwitcher", () => {
  it("should have no accessibility violations", async () => {
    const { container } = renderWithProviders(
      <LocaleSwitcher options={options} activeLocale="es" groupLabel="Idioma" />,
    );

    await expectNoAccessibilityViolations(container);
  });

  it("should render every option linking to its href", () => {
    renderWithProviders(<LocaleSwitcher options={options} activeLocale="es" />);

    expect(screen.getByRole("link", { name: "ES" })).toHaveAttribute("href", "/products");
    expect(screen.getByRole("link", { name: "EN" })).toHaveAttribute("href", "/en/products");
  });

  it("should mark the active locale with aria-current", () => {
    renderWithProviders(<LocaleSwitcher options={options} activeLocale="en" />);

    expect(screen.getByRole("link", { name: "EN" })).toHaveAttribute("aria-current", "true");
    expect(screen.getByRole("link", { name: "ES" })).not.toHaveAttribute("aria-current");
  });
});
