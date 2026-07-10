import { describe, expect, it } from "vitest";
import { screen, within } from "@testing-library/react";
import { expectNoAccessibilityViolations, renderWithProviders } from "@store-demo/testing";

import { WizardSteps } from "./WizardSteps";

const steps = [
  { id: "shipping", label: "Envío" },
  { id: "payment", label: "Pago" },
  { id: "review", label: "Revisión" },
];

describe("WizardSteps", () => {
  it("should have no accessibility violations", async () => {
    const { container } = renderWithProviders(
      <WizardSteps steps={steps} currentStepId="payment" completedStepIds={["shipping"]} />,
    );

    await expectNoAccessibilityViolations(container);
  });

  it("should mark the current step with aria-current", () => {
    renderWithProviders(
      <WizardSteps steps={steps} currentStepId="payment" completedStepIds={["shipping"]} />,
    );

    const items = screen.getAllByRole("listitem");
    expect(items[1]).toHaveAttribute("aria-current", "step");
    expect(items[0]).not.toHaveAttribute("aria-current", "step");
    expect(items).toHaveLength(3);
  });

  it("should show a completed indicator for completed steps", () => {
    renderWithProviders(
      <WizardSteps
        steps={steps}
        currentStepId="review"
        completedStepIds={["shipping", "payment"]}
        completedStepLabel="Completado"
      />,
    );

    const items = screen.getAllByRole("listitem");
    expect(within(items[0]!).getByRole("img", { name: "Completado" })).toBeInTheDocument();
    expect(within(items[1]!).getByRole("img", { name: "Completado" })).toBeInTheDocument();
  });

  it("should render all step labels", () => {
    renderWithProviders(
      <WizardSteps steps={steps} currentStepId="shipping" completedStepIds={[]} />,
    );

    expect(screen.getByText("Envío")).toBeInTheDocument();
    expect(screen.getByText("Pago")).toBeInTheDocument();
    expect(screen.getByText("Revisión")).toBeInTheDocument();
  });
});
