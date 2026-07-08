import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn, userEvent, within } from "storybook/test";

import { Button } from "./Button";

const meta = {
  title: "Atoms/Button",
  component: Button,
  args: {
    children: "Add to cart",
    onClick: fn(),
  },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  args: { intent: "primary" },
};

export const Secondary: Story = {
  args: { intent: "secondary" },
};

export const Outline: Story = {
  args: { intent: "outline" },
};

export const Ghost: Story = {
  args: { intent: "ghost" },
};

export const Danger: Story = {
  args: { intent: "danger" },
};

export const Loading: Story = {
  args: { isLoading: true },
};

export const Disabled: Story = {
  args: { disabled: true },
};

export const ClickInteraction: Story = {
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);

    await userEvent.click(canvas.getByRole("button"));

    await expect(args.onClick).toHaveBeenCalledOnce();
  },
};
