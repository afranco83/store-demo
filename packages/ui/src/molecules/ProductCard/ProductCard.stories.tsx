import type { Meta, StoryObj } from "@storybook/react-vite";

import { ProductCard } from "./ProductCard";

const meta = {
  title: "Molecules/ProductCard",
  component: ProductCard,
  args: {
    name: "Camiseta gráfica",
    imageUrl: "https://picsum.photos/seed/store-demo-product/480/480",
    priceCents: 2999,
  },
} satisfies Meta<typeof ProductCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const LowStock: Story = {
  args: { stockBadge: { label: "Últimas unidades", intent: "warning" } },
};
export const OutOfStock: Story = {
  args: { stockBadge: { label: "Agotado", intent: "danger" } },
};
