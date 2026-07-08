import type { Meta, StoryObj } from "@storybook/react-vite";

import { PriceTag } from "./PriceTag";

const meta = {
  title: "Atoms/PriceTag",
  component: PriceTag,
  args: {
    amountCents: 2999,
  },
} satisfies Meta<typeof PriceTag>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Small: Story = { args: { size: "sm" } };
export const Medium: Story = { args: { size: "md" } };
export const Large: Story = { args: { size: "lg" } };
