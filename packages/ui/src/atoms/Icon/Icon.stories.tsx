import type { Meta, StoryObj } from "@storybook/react-vite";
import { ShoppingCart } from "lucide-react";

import { Icon } from "./Icon";

const meta = {
  title: "Atoms/Icon",
  component: Icon,
  args: {
    icon: ShoppingCart,
  },
} satisfies Meta<typeof Icon>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Small: Story = { args: { size: "sm" } };
export const Medium: Story = { args: { size: "md" } };
export const Large: Story = { args: { size: "lg" } };
export const WithAccessibleLabel: Story = { args: { label: "Shopping cart" } };
