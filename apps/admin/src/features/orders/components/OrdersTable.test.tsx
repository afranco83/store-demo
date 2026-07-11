import { beforeEach, describe, expect, it, vi } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import {
  createOrderFixture,
  expectNoAccessibilityViolations,
  renderWithProviders,
} from "@store-demo/testing";

import { updateOrderStatusAction } from "../api/update-order-status.action";
import { OrdersTable } from "./OrdersTable";

vi.mock("../api/update-order-status.action", () => ({
  updateOrderStatusAction: vi.fn(),
}));

const mockedUpdateOrderStatusAction = vi.mocked(updateOrderStatusAction);

const order = createOrderFixture({
  shippingFullName: "Cliente Uno",
  userEmail: "cliente-uno@store-demo.test",
  status: "pending",
  totalCents: 2500,
});

describe("OrdersTable", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should have no accessibility violations", async () => {
    const { container } = renderWithProviders(<OrdersTable orders={[order]} />);

    await expectNoAccessibilityViolations(container);
  });

  it("should render a row with the customer name, email and total", () => {
    renderWithProviders(<OrdersTable orders={[order]} />);

    expect(screen.getByRole("cell", { name: "Cliente Uno" })).toBeInTheDocument();
    expect(screen.getByRole("cell", { name: "cliente-uno@store-demo.test" })).toBeInTheDocument();
    expect(screen.getByText("25,00 €")).toBeInTheDocument();
  });

  it("should show an empty state when there are no orders", () => {
    renderWithProviders(<OrdersTable orders={[]} />);

    expect(screen.getByText("No hay pedidos todavía.")).toBeInTheDocument();
  });

  it("should update the order status in place once the server confirms it", async () => {
    mockedUpdateOrderStatusAction.mockResolvedValue({ order: { ...order, status: "shipped" } });
    const { user } = renderWithProviders(<OrdersTable orders={[order]} />);

    const statusSelect = screen.getByLabelText(`Estado del pedido de ${order.shippingFullName}`);
    await user.selectOptions(statusSelect, "shipped");

    await waitFor(() =>
      expect(mockedUpdateOrderStatusAction).toHaveBeenCalledWith({
        orderId: order.id,
        status: "shipped",
      }),
    );
    await waitFor(() => expect(statusSelect).toHaveValue("shipped"));
  });

  it("should keep the previous status selected while the update is pending", async () => {
    let resolveUpdate!: (result: Awaited<ReturnType<typeof updateOrderStatusAction>>) => void;
    mockedUpdateOrderStatusAction.mockReturnValue(
      new Promise((resolve) => {
        resolveUpdate = resolve;
      }),
    );
    const { user } = renderWithProviders(<OrdersTable orders={[order]} />);

    const statusSelect = screen.getByLabelText(`Estado del pedido de ${order.shippingFullName}`);
    await user.selectOptions(statusSelect, "shipped");

    expect(statusSelect).toBeDisabled();

    resolveUpdate({ order: { ...order, status: "shipped" } });
    await waitFor(() => expect(statusSelect).not.toBeDisabled());
    expect(statusSelect).toHaveValue("shipped");
  });

  it("should show a server error next to the row when the update fails", async () => {
    mockedUpdateOrderStatusAction.mockResolvedValue({ error: "No se pudo actualizar." });
    const { user } = renderWithProviders(<OrdersTable orders={[order]} />);

    const statusSelect = screen.getByLabelText(`Estado del pedido de ${order.shippingFullName}`);
    await user.selectOptions(statusSelect, "shipped");

    expect(await screen.findByText("No se pudo actualizar.")).toBeInTheDocument();
    expect(statusSelect).toHaveValue("pending");
  });
});
