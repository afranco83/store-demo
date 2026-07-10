import { beforeEach, describe, expect, it, vi } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import {
  createCategoryFixture,
  expectNoAccessibilityViolations,
  renderWithProviders,
} from "@store-demo/testing";

import { createCategoryAction } from "../api/create-category.action";
import { updateCategoryAction } from "../api/update-category.action";
import { CategoryForm } from "./CategoryForm";

vi.mock("../api/create-category.action", () => ({
  createCategoryAction: vi.fn(),
}));
vi.mock("../api/update-category.action", () => ({
  updateCategoryAction: vi.fn(),
}));

const mockPush = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter() {
    return { push: mockPush };
  },
}));

const mockedCreateCategoryAction = vi.mocked(createCategoryAction);
const mockedUpdateCategoryAction = vi.mocked(updateCategoryAction);

describe("CategoryForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should have no accessibility violations", async () => {
    const { container } = renderWithProviders(<CategoryForm />);

    await expectNoAccessibilityViolations(container);
  });

  it("should show validation errors and not call createCategoryAction when fields are empty", async () => {
    const { user } = renderWithProviders(<CategoryForm />);

    await user.click(screen.getByRole("button", { name: "Crear categoría" }));

    expect(await screen.findAllByRole("alert")).not.toHaveLength(0);
    expect(mockedCreateCategoryAction).not.toHaveBeenCalled();
  });

  it("should call createCategoryAction and navigate to the list on success", async () => {
    mockedCreateCategoryAction.mockResolvedValue({ category: createCategoryFixture() });
    const { user } = renderWithProviders(<CategoryForm />);

    await user.type(screen.getByLabelText("Slug"), "new-category");
    await user.type(screen.getByLabelText("Nombre"), "New Category");
    await user.click(screen.getByRole("button", { name: "Crear categoría" }));

    await waitFor(() => expect(mockedCreateCategoryAction).toHaveBeenCalledOnce());
    expect(mockPush).toHaveBeenCalledWith("/categories");
  });

  it("should show the server error returned by createCategoryAction", async () => {
    mockedCreateCategoryAction.mockResolvedValue({
      error: "Ya existe una categoría con ese slug.",
    });
    const { user } = renderWithProviders(<CategoryForm />);

    await user.type(screen.getByLabelText("Slug"), "new-category");
    await user.type(screen.getByLabelText("Nombre"), "New Category");
    await user.click(screen.getByRole("button", { name: "Crear categoría" }));

    expect(await screen.findByText("Ya existe una categoría con ese slug.")).toBeInTheDocument();
  });

  it("should prefill the form and call updateCategoryAction when editing an existing category", async () => {
    const category = createCategoryFixture({ slug: "shirts" });
    mockedUpdateCategoryAction.mockResolvedValue({ category });
    const { user } = renderWithProviders(<CategoryForm category={category} />);

    expect(screen.getByLabelText("Slug")).toHaveValue(category.slug);
    expect(screen.getByRole("button", { name: "Guardar cambios" })).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Guardar cambios" }));

    await waitFor(() =>
      expect(mockedUpdateCategoryAction).toHaveBeenCalledWith(
        expect.objectContaining({ slug: category.slug }),
      ),
    );
    expect(mockPush).toHaveBeenCalledWith("/categories");
  });
});
