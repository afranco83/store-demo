import type { Meta, StoryObj } from "@storybook/react-vite";
import { fn } from "storybook/test";

import type { ProductCardProps } from "../ProductCard";
import { ProductCard } from "../ProductCard";
import { ProductGrid } from "./ProductGrid";

const products: Array<Omit<ProductCardProps, "onAddToCart" | "addToCartLabel">> = [
  {
    name: "Camiseta gráfica",
    priceCents: 2999,
    imageUrl: "https://picsum.photos/seed/store-demo-grid-1/480/480",
  },
  {
    name: "Gorra bordada",
    priceCents: 1999,
    imageUrl: "https://picsum.photos/seed/store-demo-grid-2/480/480",
    stockBadge: { label: "Últimas unidades", intent: "warning" },
  },
  {
    name: "Zapatillas urbanas",
    priceCents: 7999,
    imageUrl: "https://picsum.photos/seed/store-demo-grid-3/480/480",
  },
  {
    name: "Sudadera oversize",
    priceCents: 4499,
    imageUrl: "https://picsum.photos/seed/store-demo-grid-4/480/480",
  },
  {
    name: "Gorra snapback",
    priceCents: 2199,
    imageUrl: "https://picsum.photos/seed/store-demo-grid-5/480/480",
    stockBadge: { label: "Agotado", intent: "danger" },
  },
  {
    name: "Camiseta básica",
    priceCents: 1799,
    imageUrl: "https://picsum.photos/seed/store-demo-grid-6/480/480",
  },
  {
    name: "Zapatillas retro",
    priceCents: 8999,
    imageUrl: "https://picsum.photos/seed/store-demo-grid-7/480/480",
  },
  {
    name: "Chaqueta técnica",
    priceCents: 12999,
    imageUrl: "https://picsum.photos/seed/store-demo-grid-8/480/480",
  },
];

const meta = {
  title: "Molecules/ProductGrid",
  component: ProductGrid,
} satisfies Meta<typeof ProductGrid>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: products.map((product) => (
      <ProductCard
        key={product.name}
        {...product}
        onAddToCart={product.stockBadge?.intent === "danger" ? undefined : fn()}
      />
    )),
  },
};
