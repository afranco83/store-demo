import type { Meta, StoryObj } from "@storybook/react-vite";

import { Input } from "./Input";

const meta = {
  title: "Atoms/Input",
  component: Input,
  args: {
    label: "Email",
    placeholder: "you@example.com",
  },
} satisfies Meta<typeof Input>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithHint: Story = {
  args: { hint: "We'll only use this to send order updates." },
};

export const WithError: Story = {
  args: { error: "Enter a valid email address." },
};

export const Disabled: Story = {
  args: { disabled: true },
};
