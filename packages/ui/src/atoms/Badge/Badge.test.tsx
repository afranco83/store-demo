import { describe, expect, it } from "vitest";
import { screen } from "@testing-library/react";
import { expectNoAccessibilityViolations, renderWithProviders } from "@store-demo/testing";

import { Badge } from "./Badge";

describe("Badge", () => {
  it("should have no accessibility violations", async () => {
    const { container } = renderWithProviders(<Badge>New</Badge>);

    await expectNoAccessibilityViolations(container);
  });

  it("should render its children as text content", () => {
    renderWithProviders(<Badge>Sold out</Badge>);

    expect(screen.getByText("Sold out")).toBeInTheDocument();
  });
});
