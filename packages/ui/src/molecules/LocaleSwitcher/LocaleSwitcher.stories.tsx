import type { Meta, StoryObj } from "@storybook/react-vite";

import { LocaleSwitcher } from "./LocaleSwitcher";

const meta = {
  title: "Molecules/LocaleSwitcher",
  component: LocaleSwitcher,
  args: {
    options: [
      { code: "es", label: "ES", href: "/products" },
      { code: "en", label: "EN", href: "/en/products" },
    ],
    activeLocale: "es",
  },
} satisfies Meta<typeof LocaleSwitcher>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const EnglishActive: Story = {
  args: { activeLocale: "en" },
};
