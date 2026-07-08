import { describe, expect, it, vi } from "vitest";
import { screen } from "@testing-library/react";
import { expectNoAccessibilityViolations, renderWithProviders } from "@store-demo/testing";

import { QuantitySelector } from "./QuantitySelector";

describe("QuantitySelector", () => {
  it("should have no accessibility violations", async () => {
    const { container } = renderWithProviders(<QuantitySelector value={2} onChange={vi.fn()} />);

    await expectNoAccessibilityViolations(container);
  });

  it("should call onChange with the incremented value when the increase button is clicked", async () => {
    const handleChange = vi.fn();
    const { user } = renderWithProviders(<QuantitySelector value={2} onChange={handleChange} />);

    await user.click(screen.getByRole("button", { name: "Increase quantity" }));

    expect(handleChange).toHaveBeenCalledWith(3);
  });

  it("should call onChange with the decremented value when the decrease button is clicked", async () => {
    const handleChange = vi.fn();
    const { user } = renderWithProviders(<QuantitySelector value={2} onChange={handleChange} />);

    await user.click(screen.getByRole("button", { name: "Decrease quantity" }));

    expect(handleChange).toHaveBeenCalledWith(1);
  });

  it("should disable the decrease button at the minimum value", () => {
    renderWithProviders(<QuantitySelector value={1} onChange={vi.fn()} min={1} />);

    expect(screen.getByRole("button", { name: "Decrease quantity" })).toBeDisabled();
  });

  it("should disable the increase button at the maximum value", () => {
    renderWithProviders(<QuantitySelector value={5} onChange={vi.fn()} max={5} />);

    expect(screen.getByRole("button", { name: "Increase quantity" })).toBeDisabled();
  });

  it("should disable both buttons when disabled is true", () => {
    renderWithProviders(<QuantitySelector value={2} onChange={vi.fn()} disabled />);

    expect(screen.getByRole("button", { name: "Decrease quantity" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Increase quantity" })).toBeDisabled();
  });
});
