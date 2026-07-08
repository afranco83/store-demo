import type { Meta, StoryObj } from "@storybook/react-vite";

import { Badge } from "./Badge";

const meta = {
  title: "Atoms/Badge",
  component: Badge,
  args: {
    children: "New",
  },
} satisfies Meta<typeof Badge>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Neutral: Story = { args: { intent: "neutral" } };
export const Accent: Story = { args: { intent: "accent", children: "Sale" } };
export const Success: Story = { args: { intent: "success", children: "In stock" } };
export const Warning: Story = { args: { intent: "warning", children: "Low stock" } };
export const Danger: Story = { args: { intent: "danger", children: "Sold out" } };
