import type { Meta, StoryObj } from "@storybook/react-vite";

import { VersionBadge } from "./VersionBadge";

const meta = {
  title: "Atoms/VersionBadge",
  component: VersionBadge,
  args: {
    version: "1.4.0",
    href: "https://github.com/afranco83/store-demo/releases/tag/v1.4.0",
  },
} satisfies Meta<typeof VersionBadge>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
