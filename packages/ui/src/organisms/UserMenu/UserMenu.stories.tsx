import type { Meta, StoryObj } from "@storybook/react-vite";

import { UserMenu } from "./UserMenu";

const meta = {
  title: "Organisms/UserMenu",
  component: UserMenu,
  args: {
    triggerLabel: "Cuenta",
    items: (
      <>
        <a href="/account" role="menuitem" className="rounded px-3 py-2 text-sm hover:bg-gray-100">
          Mi cuenta
        </a>
        <a
          href="/account/orders"
          role="menuitem"
          className="rounded px-3 py-2 text-sm hover:bg-gray-100"
        >
          Mis pedidos
        </a>
        <button
          type="button"
          role="menuitem"
          className="rounded px-3 py-2 text-left text-sm hover:bg-gray-100"
        >
          Cerrar sesión
        </button>
      </>
    ),
  },
} satisfies Meta<typeof UserMenu>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
