import type { Meta, StoryObj } from "@storybook/react-vite";

import { Textarea } from "./Textarea";

const meta = {
  title: "Atoms/Textarea",
  component: Textarea,
  args: {
    label: "Description",
    placeholder: "Describe the product...",
  },
} satisfies Meta<typeof Textarea>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithHint: Story = {
  args: { hint: "Shown on the product detail page." },
};

export const WithError: Story = {
  args: { error: "The description cannot be empty." },
};

export const Disabled: Story = {
  args: { disabled: true },
};
