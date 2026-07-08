import { describe, expect, it } from "vitest";
import { screen } from "@testing-library/react";
import { expectNoAccessibilityViolations, renderWithProviders } from "@store-demo/testing";

import { Input } from "./Input";

describe("Input", () => {
  it("should have no accessibility violations", async () => {
    const { container } = renderWithProviders(<Input label="Email" />);

    await expectNoAccessibilityViolations(container);
  });

  it("should let the user type a value", async () => {
    const { user } = renderWithProviders(<Input label="Email" />);

    await user.type(screen.getByLabelText("Email"), "user@example.com");

    expect(screen.getByLabelText("Email")).toHaveValue("user@example.com");
  });

  it("should expose the error message via aria-describedby when invalid", () => {
    renderWithProviders(<Input label="Email" error="Enter a valid email" />);

    const input = screen.getByLabelText("Email");

    expect(input).toHaveAttribute("aria-invalid", "true");
    expect(screen.getByRole("alert")).toHaveTextContent("Enter a valid email");
  });

  it("should expose the hint via aria-describedby when there is no error", () => {
    renderWithProviders(<Input label="Email" hint="We'll only use this for order updates" />);

    const input = screen.getByLabelText("Email");
    const hint = screen.getByText("We'll only use this for order updates");

    expect(input).toHaveAttribute("aria-describedby", hint.id);
  });
});
