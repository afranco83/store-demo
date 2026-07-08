import type { Meta, StoryObj } from "@storybook/react-vite";
import { ShoppingBag } from "lucide-react";

import { Button } from "../../atoms/Button";
import { EmptyState } from "./EmptyState";

const meta = {
  title: "Molecules/EmptyState",
  component: EmptyState,
  args: {
    icon: ShoppingBag,
    title: "Your cart is empty",
    description: "Add products to see them here.",
  },
} satisfies Meta<typeof EmptyState>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const WithAction: Story = {
  args: { action: <Button>Browse products</Button> },
};
