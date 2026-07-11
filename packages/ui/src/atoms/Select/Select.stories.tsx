import type { Meta, StoryObj } from "@storybook/react-vite";

import { Select } from "./Select";

const meta = {
  title: "Atoms/Select",
  component: Select,
  args: {
    label: "Category",
  },
  render: (args) => (
    <Select {...args}>
      <option value="shirts">Shirts</option>
      <option value="caps">Caps</option>
      <option value="sneakers">Sneakers</option>
    </Select>
  ),
} satisfies Meta<typeof Select>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithHint: Story = {
  args: { hint: "Products can only belong to one category." },
};

export const WithError: Story = {
  args: { error: "Select a category." },
};

export const Disabled: Story = {
  args: { disabled: true },
};

export const HiddenLabel: Story = {
  args: { hideLabel: true },
};
