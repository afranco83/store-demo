import { beforeEach, describe, expect, it, vi } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import {
  createCategoryFixture,
  createProductFixture,
  expectNoAccessibilityViolations,
  renderWithProviders,
} from "@store-demo/testing";

import { createProductAction } from "../api/create-product.action";
import { updateProductAction } from "../api/update-product.action";
import { ProductForm } from "./ProductForm";

vi.mock("../api/create-product.action", () => ({
  createProductAction: vi.fn(),
}));
vi.mock("../api/update-product.action", () => ({
  updateProductAction: vi.fn(),
}));

const mockPush = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter() {
    return { push: mockPush };
  },
}));

const mockedCreateProductAction = vi.mocked(createProductAction);
const mockedUpdateProductAction = vi.mocked(updateProductAction);

const categories = [createCategoryFixture({ id: "cat-1", name: "Camisetas" })];

describe("ProductForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should have no accessibility violations", async () => {
    const { container } = renderWithProviders(<ProductForm categories={categories} />);

    await expectNoAccessibilityViolations(container);
  });

  it("should show validation errors and not call createProductAction when fields are empty", async () => {
    const { user } = renderWithProviders(<ProductForm categories={categories} />);

    await user.click(screen.getByRole("button", { name: "Crear producto" }));

    expect(await screen.findAllByRole("alert")).not.toHaveLength(0);
    expect(mockedCreateProductAction).not.toHaveBeenCalled();
  });

  it("should call createProductAction and navigate to the list on success", async () => {
    mockedCreateProductAction.mockResolvedValue({ product: createProductFixture() });
    const { user } = renderWithProviders(<ProductForm categories={categories} />);

    await user.type(screen.getByLabelText("Slug"), "new-shirt");
    await user.type(screen.getByLabelText("Nombre"), "New Shirt");
    await user.type(screen.getByLabelText("Descripción"), "A great shirt");
    await user.clear(screen.getByLabelText("Precio (céntimos)"));
    await user.type(screen.getByLabelText("Precio (céntimos)"), "2500");
    await user.clear(screen.getByLabelText("Stock"));
    await user.type(screen.getByLabelText("Stock"), "10");
    await user.selectOptions(screen.getByLabelText("Categoría"), "cat-1");
    await user.type(
      screen.getByLabelText("URL de la imagen"),
      "https://res.cloudinary.com/demo/image/upload/v1/x.jpg",
    );
    await user.click(screen.getByRole("button", { name: "Crear producto" }));

    await waitFor(() => expect(mockedCreateProductAction).toHaveBeenCalledOnce());
    expect(mockPush).toHaveBeenCalledWith("/products");
  });

  it("should show the server error returned by createProductAction", async () => {
    mockedCreateProductAction.mockResolvedValue({ error: "Ya existe un producto con ese slug." });
    const { user } = renderWithProviders(<ProductForm categories={categories} />);

    await user.type(screen.getByLabelText("Slug"), "new-shirt");
    await user.type(screen.getByLabelText("Nombre"), "New Shirt");
    await user.type(screen.getByLabelText("Descripción"), "A great shirt");
    await user.clear(screen.getByLabelText("Precio (céntimos)"));
    await user.type(screen.getByLabelText("Precio (céntimos)"), "2500");
    await user.selectOptions(screen.getByLabelText("Categoría"), "cat-1");
    await user.type(
      screen.getByLabelText("URL de la imagen"),
      "https://res.cloudinary.com/demo/image/upload/v1/x.jpg",
    );
    await user.click(screen.getByRole("button", { name: "Crear producto" }));

    expect(await screen.findByText("Ya existe un producto con ese slug.")).toBeInTheDocument();
    expect(mockPush).not.toHaveBeenCalled();
  });

  it("should prefill the form and call updateProductAction when editing an existing product", async () => {
    const product = createProductFixture({ slug: "classic-tee", categoryId: "cat-1" });
    mockedUpdateProductAction.mockResolvedValue({ product });
    const { user } = renderWithProviders(<ProductForm categories={categories} product={product} />);

    expect(screen.getByLabelText("Slug")).toHaveValue(product.slug);
    expect(screen.getByRole("button", { name: "Guardar cambios" })).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Guardar cambios" }));

    await waitFor(() =>
      expect(mockedUpdateProductAction).toHaveBeenCalledWith(
        expect.objectContaining({ slug: product.slug }),
      ),
    );
    expect(mockPush).toHaveBeenCalledWith("/products");
  });
});
