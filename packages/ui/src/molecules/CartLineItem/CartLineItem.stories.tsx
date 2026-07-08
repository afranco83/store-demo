import type { Meta, StoryObj } from "@storybook/react-vite";
import { fn } from "storybook/test";

import { CartLineItem } from "./CartLineItem";

const meta = {
  title: "Molecules/CartLineItem",
  component: CartLineItem,
  args: {
    name: "Camiseta gráfica",
    imageUrl: "https://picsum.photos/seed/store-demo-cart-item/128/128",
    priceCents: 2999,
    quantity: 2,
    onQuantityChange: fn(),
    onRemove: fn(),
  },
} satisfies Meta<typeof CartLineItem>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const Updating: Story = { args: { isUpdating: true } };
