import type { Meta, StoryObj } from "@storybook/react-vite";
import { fn } from "storybook/test";

import { QuantitySelector } from "./QuantitySelector";

const meta = {
  title: "Molecules/QuantitySelector",
  component: QuantitySelector,
  args: {
    value: 1,
    onChange: fn(),
  },
} satisfies Meta<typeof QuantitySelector>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const WithMaxStock: Story = { args: { value: 4, max: 5 } };
export const Disabled: Story = { args: { disabled: true } };
