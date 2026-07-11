import { describe, expect, it } from "vitest";
import type { ComponentProps } from "react";
import { screen } from "@testing-library/react";
import { expectNoAccessibilityViolations, renderWithProviders } from "@store-demo/testing";

import { Select } from "./Select";

function renderSelect(props: Partial<ComponentProps<typeof Select>> = {}) {
  return renderWithProviders(
    <Select label="Category" {...props}>
      <option value="shirts">Shirts</option>
      <option value="caps">Caps</option>
    </Select>,
  );
}

describe("Select", () => {
  it("should have no accessibility violations", async () => {
    const { container } = renderSelect();

    await expectNoAccessibilityViolations(container);
  });

  it("should let the user choose an option", async () => {
    const { user } = renderSelect();

    await user.selectOptions(screen.getByLabelText("Category"), "caps");

    expect(screen.getByLabelText("Category")).toHaveValue("caps");
  });

  it("should expose the error message via aria-describedby when invalid", () => {
    renderSelect({ error: "Select a category" });

    const select = screen.getByLabelText("Category");

    expect(select).toHaveAttribute("aria-invalid", "true");
    expect(screen.getByRole("alert")).toHaveTextContent("Select a category");
  });

  it("should expose the hint via aria-describedby when there is no error", () => {
    renderSelect({ hint: "Products belong to one category" });

    const select = screen.getByLabelText("Category");
    const hint = screen.getByText("Products belong to one category");

    expect(select).toHaveAttribute("aria-describedby", hint.id);
  });

  it("should keep the label accessible but visually hidden when hideLabel is set", () => {
    renderSelect({ hideLabel: true });

    expect(screen.getByLabelText("Category")).toBeInTheDocument();
    expect(screen.getByText("Category")).toHaveClass("sr-only");
  });
});
