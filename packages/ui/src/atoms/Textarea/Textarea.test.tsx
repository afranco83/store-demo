import { describe, expect, it } from "vitest";
import { screen } from "@testing-library/react";
import { expectNoAccessibilityViolations, renderWithProviders } from "@store-demo/testing";

import { Textarea } from "./Textarea";

describe("Textarea", () => {
  it("should have no accessibility violations", async () => {
    const { container } = renderWithProviders(<Textarea label="Description" />);

    await expectNoAccessibilityViolations(container);
  });

  it("should let the user type a multi-line value", async () => {
    const { user } = renderWithProviders(<Textarea label="Description" />);

    await user.type(screen.getByLabelText("Description"), "A great product");

    expect(screen.getByLabelText("Description")).toHaveValue("A great product");
  });

  it("should expose the error message via aria-describedby when invalid", () => {
    renderWithProviders(<Textarea label="Description" error="The description is required" />);

    const textarea = screen.getByLabelText("Description");

    expect(textarea).toHaveAttribute("aria-invalid", "true");
    expect(screen.getByRole("alert")).toHaveTextContent("The description is required");
  });

  it("should expose the hint via aria-describedby when there is no error", () => {
    renderWithProviders(<Textarea label="Description" hint="Shown on the product page" />);

    const textarea = screen.getByLabelText("Description");
    const hint = screen.getByText("Shown on the product page");

    expect(textarea).toHaveAttribute("aria-describedby", hint.id);
  });
});
