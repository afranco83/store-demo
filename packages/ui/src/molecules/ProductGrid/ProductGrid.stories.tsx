import type { Meta, StoryObj } from "@storybook/react-vite";

import { ProductGrid } from "./ProductGrid";

const meta = {
  title: "Molecules/ProductGrid",
  component: ProductGrid,
} satisfies Meta<typeof ProductGrid>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: Array.from({ length: 8 }, (_, index) => (
      <div key={index} className="aspect-square rounded-md bg-gray-100" />
    )),
  },
};
