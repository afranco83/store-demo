import { describe, expect, it } from "vitest";
import { screen } from "@testing-library/react";
import { expectNoAccessibilityViolations, renderWithProviders } from "@store-demo/testing";

import { Spinner } from "./Spinner";

describe("Spinner", () => {
  it("should have no accessibility violations", async () => {
    const { container } = renderWithProviders(<Spinner />);

    await expectNoAccessibilityViolations(container);
  });

  it("should expose its status role and accessible label", () => {
    renderWithProviders(<Spinner label="Loading products" />);

    expect(screen.getByRole("status")).toHaveTextContent("Loading products");
  });

  it("should default to a generic loading label when none is provided", () => {
    renderWithProviders(<Spinner />);

    expect(screen.getByRole("status")).toHaveTextContent("Loading");
  });
});
