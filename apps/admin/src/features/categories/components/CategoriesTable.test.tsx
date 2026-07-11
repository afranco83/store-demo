import { beforeEach, describe, expect, it, vi } from "vitest";
import { screen, waitFor, within } from "@testing-library/react";
import {
  createCategoryFixture,
  expectNoAccessibilityViolations,
  renderWithProviders,
} from "@store-demo/testing";

import { deleteCategoryAction } from "../api/delete-category.action";
import { CategoriesTable } from "./CategoriesTable";

vi.mock("../api/delete-category.action", () => ({
  deleteCategoryAction: vi.fn(),
}));

const mockRefresh = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter() {
    return { refresh: mockRefresh };
  },
}));

const mockedDeleteCategoryAction = vi.mocked(deleteCategoryAction);

const category = createCategoryFixture({ slug: "shirts", name: "Camisetas" });

describe("CategoriesTable", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should have no accessibility violations", async () => {
    const { container } = renderWithProviders(<CategoriesTable categories={[category]} />);

    await expectNoAccessibilityViolations(container);
  });

  it("should render a row with the category name and slug", () => {
    renderWithProviders(<CategoriesTable categories={[category]} />);

    expect(screen.getByRole("cell", { name: "Camisetas" })).toBeInTheDocument();
    expect(screen.getByRole("cell", { name: "shirts" })).toBeInTheDocument();
  });

  it("should show an empty state when there are no categories", () => {
    renderWithProviders(<CategoriesTable categories={[]} />);

    expect(screen.getByText("No hay categorías todavía.")).toBeInTheDocument();
  });

  it("should delete the category and refresh after confirming", async () => {
    mockedDeleteCategoryAction.mockResolvedValue({ success: true });
    const { user } = renderWithProviders(<CategoriesTable categories={[category]} />);

    await user.click(screen.getByRole("button", { name: "Eliminar" }));
    const dialog = screen.getByRole("dialog");
    await user.click(within(dialog).getByRole("button", { name: "Eliminar" }));

    await waitFor(() => expect(mockedDeleteCategoryAction).toHaveBeenCalledWith("shirts"));
    await waitFor(() => expect(mockRefresh).toHaveBeenCalledOnce());
  });

  it("should close the dialog without deleting when the cancel button is clicked", async () => {
    const { user } = renderWithProviders(<CategoriesTable categories={[category]} />);

    await user.click(screen.getByRole("button", { name: "Eliminar" }));
    const dialog = screen.getByRole("dialog");
    await user.click(within(dialog).getByRole("button", { name: "Cancelar" }));

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(mockedDeleteCategoryAction).not.toHaveBeenCalled();
  });

  it("should show the server error when deletion fails", async () => {
    mockedDeleteCategoryAction.mockResolvedValue({ error: "No se puede eliminar." });
    const { user } = renderWithProviders(<CategoriesTable categories={[category]} />);

    await user.click(screen.getByRole("button", { name: "Eliminar" }));
    const dialog = screen.getByRole("dialog");
    await user.click(within(dialog).getByRole("button", { name: "Eliminar" }));

    expect(await screen.findByText("No se puede eliminar.")).toBeInTheDocument();
    expect(mockRefresh).not.toHaveBeenCalled();
  });
});
