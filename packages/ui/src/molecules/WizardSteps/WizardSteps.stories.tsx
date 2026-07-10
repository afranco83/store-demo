import type { Meta, StoryObj } from "@storybook/react-vite";

import { WizardSteps } from "./WizardSteps";

const steps = [
  { id: "shipping", label: "Envío" },
  { id: "payment", label: "Pago" },
  { id: "review", label: "Revisión" },
];

const meta = {
  title: "Molecules/WizardSteps",
  component: WizardSteps,
  args: {
    steps,
    navLabel: "Progreso del checkout",
    completedStepLabel: "Completado",
  },
} satisfies Meta<typeof WizardSteps>;

export default meta;
type Story = StoryObj<typeof meta>;

export const FirstStep: Story = {
  args: { currentStepId: "shipping", completedStepIds: [] },
};

export const MiddleStep: Story = {
  args: { currentStepId: "payment", completedStepIds: ["shipping"] },
};

export const LastStep: Story = {
  args: { currentStepId: "review", completedStepIds: ["shipping", "payment"] },
};
