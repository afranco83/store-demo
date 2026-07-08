import type { Meta, StoryObj } from "@storybook/react-vite";

import { Typography } from "./Typography";

const meta = {
  title: "Atoms/Typography",
  component: Typography,
} satisfies Meta<typeof Typography>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Display: Story = {
  args: { as: "h1", variant: "display", children: "New arrivals" },
};

export const Heading: Story = {
  args: { as: "h2", variant: "heading", children: "Featured products" },
};

export const Body: Story = {
  args: { as: "p", variant: "body", children: "Street-ready essentials, made to last." },
};

export const Caption: Story = {
  args: { as: "span", variant: "caption", children: "Free shipping over $50" },
};
