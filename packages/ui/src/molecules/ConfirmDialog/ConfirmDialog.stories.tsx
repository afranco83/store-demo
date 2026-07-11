import type { Meta, StoryObj } from "@storybook/react-vite";

import { ConfirmDialog } from "./ConfirmDialog";

const meta = {
  title: "Molecules/ConfirmDialog",
  component: ConfirmDialog,
  args: {
    isOpen: true,
    title: "Delete product?",
    description: "This action cannot be undone.",
    confirmLabel: "Delete",
    onConfirm: () => {},
    onCancel: () => {},
  },
} satisfies Meta<typeof ConfirmDialog>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Confirming: Story = {
  args: { isConfirming: true },
};

export const PrimaryIntent: Story = {
  args: {
    intent: "primary",
    title: "Publish changes?",
    description: "The product will become visible in the storefront.",
    confirmLabel: "Publish",
  },
};
