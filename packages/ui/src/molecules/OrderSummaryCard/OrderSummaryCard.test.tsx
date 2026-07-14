import { describe, expect, it } from "vitest";
import { screen } from "@testing-library/react";
import { expectNoAccessibilityViolations, renderWithProviders } from "@store-demo/testing";

import { OrderSummaryCard } from "./OrderSummaryCard";

describe("OrderSummaryCard", () => {
  it("should have no accessibility violations", async () => {
    const { container } = renderWithProviders(
      <OrderSummaryCard
        orderId="clx1a2b3c4d5e6f7g8h9"
        title={(shortOrderId) => `Pedido #${shortOrderId}`}
        placedAtLabel="12 de julio de 2026"
        statusBadge={{ label: "Pendiente", intent: "warning" }}
        totalCents={5998}
        itemCountLabel="2 artículos"
      />,
    );

    await expectNoAccessibilityViolations(container);
  });

  it("should render the order id, date, status and formatted total", () => {
    renderWithProviders(
      <OrderSummaryCard
        orderId="clx1a2b3c4d5e6f7g8h9"
        title={(shortOrderId) => `Pedido #${shortOrderId}`}
        placedAtLabel="12 de julio de 2026"
        statusBadge={{ label: "Enviado", intent: "accent" }}
        totalCents={5998}
        itemCountLabel="2 artículos"
      />,
    );

    expect(screen.getByText("Pedido #clx1a2b3")).toBeInTheDocument();
    expect(screen.getByText("12 de julio de 2026")).toBeInTheDocument();
    expect(screen.getByText("Enviado")).toBeInTheDocument();
    expect(screen.getByText("2 artículos")).toBeInTheDocument();
    expect(screen.getByText("59,98 €")).toBeInTheDocument();
  });
});
