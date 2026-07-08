import { describe, expect, it } from "vitest";
import { screen } from "@testing-library/react";
import { ShoppingCart } from "lucide-react";
import { expectNoAccessibilityViolations, renderWithProviders } from "@store-demo/testing";

import { Icon } from "./Icon";

describe("Icon", () => {
  it("should have no accessibility violations when it has an accessible label", async () => {
    const { container } = renderWithProviders(<Icon icon={ShoppingCart} label="Cart" />);

    await expectNoAccessibilityViolations(container);
  });

  it("should be hidden from assistive tech when no label is provided", () => {
    renderWithProviders(<Icon icon={ShoppingCart} />);

    expect(screen.getByTestId("icon")).toHaveAttribute("aria-hidden", "true");
  });

  it("should expose an accessible name when a label is provided", () => {
    renderWithProviders(<Icon icon={ShoppingCart} label="Cart" />);

    expect(screen.getByRole("img", { name: "Cart" })).toBeInTheDocument();
  });
});
