import type { Meta, StoryObj } from "@storybook/react-vite";

import { Table, TableBody, TableCell, TableHeader, TableHeaderCell, TableRow } from "./Table";

const meta = {
  title: "Molecules/Table",
  component: Table,
} satisfies Meta<typeof Table>;

export default meta;
type Story = StoryObj<typeof meta>;

const products = [
  { slug: "classic-tee", name: "Classic Tee", stock: 24, priceCents: 2500 },
  { slug: "snapback-cap", name: "Snapback Cap", stock: 0, priceCents: 1800 },
];

export const Default: Story = {
  args: {
    caption: "Products",
    children: null,
  },
  render: (args) => (
    <Table {...args}>
      <TableHeader>
        <TableRow>
          <TableHeaderCell>Name</TableHeaderCell>
          <TableHeaderCell>Stock</TableHeaderCell>
          <TableHeaderCell>Price</TableHeaderCell>
        </TableRow>
      </TableHeader>
      <TableBody>
        {products.map((product) => (
          <TableRow key={product.slug}>
            <TableCell>{product.name}</TableCell>
            <TableCell>{product.stock}</TableCell>
            <TableCell>{(product.priceCents / 100).toFixed(2)} €</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  ),
};
