import type { Meta, StoryObj } from "@storybook/react-vite";

import { buttonVariants } from "../../atoms/Button";
import { Hero } from "./Hero";

const meta = {
  title: "Molecules/Hero",
  component: Hero,
  args: {
    eyebrow: "Nueva colección",
    title: "Streetwear con estilo",
    description: "Camisetas, gorras y zapatillas pensadas para el día a día.",
    action: (
      <a href="/products" className={buttonVariants({ intent: "secondary", size: "lg" })}>
        Ver catálogo
      </a>
    ),
  },
} satisfies Meta<typeof Hero>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithoutEyebrow: Story = {
  args: { eyebrow: undefined },
};

export const TitleOnly: Story = {
  args: { eyebrow: undefined, description: undefined, action: undefined },
};
