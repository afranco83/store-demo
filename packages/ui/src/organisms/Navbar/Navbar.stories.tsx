import type { Meta, StoryObj } from "@storybook/react-vite";
import { fn } from "storybook/test";

import { Typography } from "../../atoms/Typography";
import { Navbar } from "./Navbar";

const meta = {
  title: "Organisms/Navbar",
  component: Navbar,
  args: {
    logoSlot: (
      <Typography as="span" variant="heading" className="text-xl">
        Store Demo
      </Typography>
    ),
    navSlot: (
      <>
        <a href="/">Inicio</a>
        <a href="/products">Catálogo</a>
      </>
    ),
    onCartClick: fn(),
  },
} satisfies Meta<typeof Navbar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const EmptyCart: Story = { args: { cartItemCount: 0 } };
export const WithItemsInCart: Story = { args: { cartItemCount: 3 } };
