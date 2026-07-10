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

const mockRefresh = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter() {
    return { refresh: mockRefresh };
  },
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

  it("should update the order status and refresh on change", async () => {
    mockedUpdateOrderStatusAction.mockResolvedValue({ order: { ...order, status: "shipped" } });
    const { user } = renderWithProviders(<OrdersTable orders={[order]} />);

    await user.selectOptions(
      screen.getByLabelText(`Estado del pedido de ${order.shippingFullName}`),
      "shipped",
    );

    await waitFor(() =>
      expect(mockedUpdateOrderStatusAction).toHaveBeenCalledWith({
        orderId: order.id,
        status: "shipped",
      }),
    );
    await waitFor(() => expect(mockRefresh).toHaveBeenCalledOnce());
  });

  it("should show a server error next to the row when the update fails", async () => {
    mockedUpdateOrderStatusAction.mockResolvedValue({ error: "No se pudo actualizar." });
    const { user } = renderWithProviders(<OrdersTable orders={[order]} />);

    await user.selectOptions(
      screen.getByLabelText(`Estado del pedido de ${order.shippingFullName}`),
      "shipped",
    );

    expect(await screen.findByText("No se pudo actualizar.")).toBeInTheDocument();
    expect(mockRefresh).not.toHaveBeenCalled();
  });
});
