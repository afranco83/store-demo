import { beforeEach, describe, expect, it, vi } from "vitest";
import { screen, waitFor, within } from "@testing-library/react";
import {
  createCategoryFixture,
  createProductFixture,
  expectNoAccessibilityViolations,
  renderWithProviders,
} from "@store-demo/testing";

import { deleteProductAction } from "../api/delete-product.action";
import { ProductsTable } from "./ProductsTable";

vi.mock("../api/delete-product.action", () => ({
  deleteProductAction: vi.fn(),
}));

const mockRefresh = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter() {
    return { refresh: mockRefresh };
  },
}));

const mockedDeleteProductAction = vi.mocked(deleteProductAction);

const category = createCategoryFixture({ id: "cat-1", name: "Camisetas" });
const product = createProductFixture({
  slug: "classic-tee",
  name: "Classic Tee",
  categoryId: "cat-1",
  priceCents: 2500,
  stock: 10,
});

describe("ProductsTable", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should have no accessibility violations", async () => {
    const { container } = renderWithProviders(
      <ProductsTable products={[product]} categories={[category]} />,
    );

    await expectNoAccessibilityViolations(container);
  });

  it("should render a row with the product name, category, price and stock", () => {
    renderWithProviders(<ProductsTable products={[product]} categories={[category]} />);

    expect(screen.getByRole("cell", { name: "Classic Tee" })).toBeInTheDocument();
    expect(screen.getByRole("cell", { name: "Camisetas" })).toBeInTheDocument();
    expect(screen.getByText("25,00 €")).toBeInTheDocument();
    expect(screen.getByRole("cell", { name: "10" })).toBeInTheDocument();
  });

  it("should show an empty state when there are no products", () => {
    renderWithProviders(<ProductsTable products={[]} categories={[category]} />);

    expect(screen.getByText("No hay productos todavía.")).toBeInTheDocument();
  });

  it("should delete the product and refresh after confirming", async () => {
    mockedDeleteProductAction.mockResolvedValue({ success: true });
    const { user } = renderWithProviders(
      <ProductsTable products={[product]} categories={[category]} />,
    );

    await user.click(screen.getByRole("button", { name: "Eliminar" }));
    const dialog = screen.getByRole("dialog");
    await user.click(within(dialog).getByRole("button", { name: "Eliminar" }));

    await waitFor(() => expect(mockedDeleteProductAction).toHaveBeenCalledWith("classic-tee"));
    await waitFor(() => expect(mockRefresh).toHaveBeenCalledOnce());
  });

  it("should show the server error and keep the dialog open when deletion fails", async () => {
    mockedDeleteProductAction.mockResolvedValue({ error: "No se puede eliminar." });
    const { user } = renderWithProviders(
      <ProductsTable products={[product]} categories={[category]} />,
    );

    await user.click(screen.getByRole("button", { name: "Eliminar" }));
    const dialog = screen.getByRole("dialog");
    await user.click(within(dialog).getByRole("button", { name: "Eliminar" }));

    expect(await screen.findByText("No se puede eliminar.")).toBeInTheDocument();
    expect(mockRefresh).not.toHaveBeenCalled();
  });
});
