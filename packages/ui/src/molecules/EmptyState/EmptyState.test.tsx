import { describe, expect, it } from "vitest";
import { screen } from "@testing-library/react";
import { ShoppingBag } from "lucide-react";
import { expectNoAccessibilityViolations, renderWithProviders } from "@store-demo/testing";

import { Button } from "../../atoms/Button";
import { EmptyState } from "./EmptyState";

describe("EmptyState", () => {
  it("should have no accessibility violations", async () => {
    const { container } = renderWithProviders(
      <EmptyState
        icon={ShoppingBag}
        title="Your cart is empty"
        description="Add products to see them here."
        action={<Button>Browse products</Button>}
      />,
    );

    await expectNoAccessibilityViolations(container);
  });

  it("should render the title and description", () => {
    renderWithProviders(
      <EmptyState
        icon={ShoppingBag}
        title="Your cart is empty"
        description="Add products to see them here."
      />,
    );

    expect(screen.getByRole("heading", { name: "Your cart is empty" })).toBeInTheDocument();
    expect(screen.getByText("Add products to see them here.")).toBeInTheDocument();
  });

  it("should render the action when provided", () => {
    renderWithProviders(
      <EmptyState icon={ShoppingBag} title="Nothing here" action={<Button>Go home</Button>} />,
    );

    expect(screen.getByRole("button", { name: "Go home" })).toBeInTheDocument();
  });
});
