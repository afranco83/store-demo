import type { Meta, StoryObj } from "@storybook/react-vite";

import { OrderSummaryCard } from "./OrderSummaryCard";

const meta = {
  title: "Molecules/OrderSummaryCard",
  component: OrderSummaryCard,
  args: {
    orderId: "clx1a2b3c4d5e6f7g8h9",
    placedAtLabel: "12 de julio de 2026",
    statusBadge: { label: "Pendiente", intent: "warning" },
    totalCents: 5998,
    itemCountLabel: "2 artículos",
  },
} satisfies Meta<typeof OrderSummaryCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const Shipped: Story = {
  args: { statusBadge: { label: "Enviado", intent: "accent" } },
};
export const Delivered: Story = {
  args: { statusBadge: { label: "Entregado", intent: "success" } },
};
export const Cancelled: Story = {
  args: { statusBadge: { label: "Cancelado", intent: "danger" } },
};
