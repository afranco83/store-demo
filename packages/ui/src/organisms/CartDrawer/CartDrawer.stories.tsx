import type { Meta, StoryObj } from "@storybook/react-vite";
import { fn } from "storybook/test";

import { Button } from "../../atoms/Button";
import { CartDrawer, type CartDrawerItem } from "./CartDrawer";

const items: CartDrawerItem[] = [
  {
    id: "cart-item-1",
    name: "Camiseta gráfica",
    imageUrl: "https://picsum.photos/seed/store-demo-drawer-1/128/128",
    priceCents: 2999,
    quantity: 2,
    onQuantityChange: fn(),
    onRemove: fn(),
  },
  {
    id: "cart-item-2",
    name: "Gorra bordada",
    imageUrl: "https://picsum.photos/seed/store-demo-drawer-2/128/128",
    priceCents: 1999,
    quantity: 1,
    onQuantityChange: fn(),
    onRemove: fn(),
  },
];

const meta = {
  title: "Organisms/CartDrawer",
  component: CartDrawer,
  args: {
    isOpen: true,
    onClose: fn(),
    items,
    subtotalCents: 7997,
    checkoutAction: <Button className="w-full justify-center">Finalizar compra</Button>,
  },
} satisfies Meta<typeof CartDrawer>;

export default meta;
type Story = StoryObj<typeof meta>;

export const WithItems: Story = {};
export const Empty: Story = {
  args: { items: [], subtotalCents: 0, emptyStateAction: <Button>Ver catálogo</Button> },
};
export const Loading: Story = { args: { isLoading: true } };
export const WithError: Story = {
  args: { errorMessage: "No se pudo actualizar el carrito. Inténtalo de nuevo." },
};
