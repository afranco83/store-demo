import { describe, expect, it, vi } from "vitest";
import { screen } from "@testing-library/react";
import { expectNoAccessibilityViolations, renderWithProviders } from "@store-demo/testing";

import { Button } from "./Button";

describe("Button", () => {
  it("should have no accessibility violations", async () => {
    const { container } = renderWithProviders(<Button>Add to cart</Button>);

    await expectNoAccessibilityViolations(container);
  });

  it("should call onClick when the user clicks it", async () => {
    const handleClick = vi.fn();
    const { user } = renderWithProviders(<Button onClick={handleClick}>Add to cart</Button>);

    await user.click(screen.getByRole("button", { name: /add to cart/i }));

    expect(handleClick).toHaveBeenCalledOnce();
  });

  it("should be disabled and show a spinner when isLoading is true", () => {
    renderWithProviders(<Button isLoading>Add to cart</Button>);

    expect(screen.getByRole("button")).toBeDisabled();
    expect(screen.getByRole("status")).toBeInTheDocument();
  });
});
