import { describe, expect, it } from "vitest";
import { screen } from "@testing-library/react";
import { expectNoAccessibilityViolations, renderWithProviders } from "@store-demo/testing";

import { Footer } from "./Footer";

const columns = [
  {
    heading: "Tienda",
    links: (
      <>
        <a href="/">Inicio</a>
        <a href="/products">Catálogo</a>
      </>
    ),
  },
  {
    heading: "Cuenta",
    links: <a href="/login">Iniciar sesión</a>,
  },
];

describe("Footer", () => {
  it("should have no accessibility violations", async () => {
    const { container } = renderWithProviders(
      <Footer
        brandSlot={<span>Store Demo</span>}
        columns={columns}
        bottomStart={<span>© 2026 Store Demo</span>}
        bottomEnd={<a href="https://github.com/afranco83/store-demo">GitHub</a>}
      />,
    );

    await expectNoAccessibilityViolations(container);
  });

  it("should render the brand slot", () => {
    renderWithProviders(<Footer brandSlot={<span>Store Demo</span>} columns={columns} />);

    expect(screen.getByText("Store Demo")).toBeInTheDocument();
  });

  it("should render each column with its heading and links", () => {
    renderWithProviders(<Footer brandSlot={<span>Store Demo</span>} columns={columns} />);

    expect(screen.getByRole("navigation", { name: "Tienda" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Catálogo" })).toBeInTheDocument();
    expect(screen.getByRole("navigation", { name: "Cuenta" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Iniciar sesión" })).toBeInTheDocument();
  });

  it("should render bottomStart and bottomEnd when provided", () => {
    renderWithProviders(
      <Footer
        brandSlot={<span>Store Demo</span>}
        columns={columns}
        bottomStart={<span>© 2026 Store Demo</span>}
        bottomEnd={<a href="https://github.com/afranco83/store-demo">GitHub</a>}
      />,
    );

    expect(screen.getByText("© 2026 Store Demo")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "GitHub" })).toBeInTheDocument();
  });
});
