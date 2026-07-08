import { describe, expect, it } from "vitest";
import { screen } from "@testing-library/react";
import { expectNoAccessibilityViolations, renderWithProviders } from "@store-demo/testing";

import { Typography } from "./Typography";

describe("Typography", () => {
  it("should have no accessibility violations", async () => {
    const { container } = renderWithProviders(
      <Typography as="h1" variant="display">
        New arrivals
      </Typography>,
    );

    await expectNoAccessibilityViolations(container);
  });

  it("should render as the element passed via the as prop", () => {
    renderWithProviders(
      <Typography as="h2" variant="heading">
        Featured
      </Typography>,
    );

    expect(screen.getByRole("heading", { level: 2, name: "Featured" })).toBeInTheDocument();
  });

  it("should default to a paragraph when no as prop is given", () => {
    renderWithProviders(<Typography>Body copy</Typography>);

    expect(screen.getByText("Body copy").tagName).toBe("P");
  });
});
