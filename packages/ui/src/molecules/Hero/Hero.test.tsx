import { describe, expect, it } from "vitest";
import { screen } from "@testing-library/react";
import { expectNoAccessibilityViolations, renderWithProviders } from "@store-demo/testing";

import { Hero } from "./Hero";

describe("Hero", () => {
  it("should have no accessibility violations", async () => {
    const { container } = renderWithProviders(
      <Hero
        eyebrow="Nueva colección"
        title="Streetwear con estilo"
        description="Camisetas, gorras y zapatillas."
        action={<a href="/products">Ver catálogo</a>}
      />,
    );

    await expectNoAccessibilityViolations(container);
  });

  it("should render the title as a heading", () => {
    renderWithProviders(<Hero title="Streetwear con estilo" />);

    expect(screen.getByRole("heading", { name: "Streetwear con estilo" })).toBeInTheDocument();
  });

  it("should render the eyebrow, description and action when provided", () => {
    renderWithProviders(
      <Hero
        eyebrow="Nueva colección"
        title="Streetwear con estilo"
        description="Camisetas, gorras y zapatillas."
        action={<a href="/products">Ver catálogo</a>}
      />,
    );

    expect(screen.getByText("Nueva colección")).toBeInTheDocument();
    expect(screen.getByText("Camisetas, gorras y zapatillas.")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Ver catálogo" })).toBeInTheDocument();
  });

  it("should not render the eyebrow or description when omitted", () => {
    renderWithProviders(<Hero title="Streetwear con estilo" />);

    expect(screen.queryByText("Nueva colección")).not.toBeInTheDocument();
  });
});
