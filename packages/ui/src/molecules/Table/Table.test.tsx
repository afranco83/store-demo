import { describe, expect, it } from "vitest";
import { screen } from "@testing-library/react";
import { expectNoAccessibilityViolations, renderWithProviders } from "@store-demo/testing";

import { Table, TableBody, TableCell, TableHeader, TableHeaderCell, TableRow } from "./Table";

function renderProductsTable() {
  return renderWithProviders(
    <Table caption="Products">
      <TableHeader>
        <TableRow>
          <TableHeaderCell>Name</TableHeaderCell>
          <TableHeaderCell>Stock</TableHeaderCell>
        </TableRow>
      </TableHeader>
      <TableBody>
        <TableRow>
          <TableCell>Classic Tee</TableCell>
          <TableCell>24</TableCell>
        </TableRow>
      </TableBody>
    </Table>,
  );
}

describe("Table", () => {
  it("should have no accessibility violations", async () => {
    const { container } = renderProductsTable();

    await expectNoAccessibilityViolations(container);
  });

  it("should render the header and row content", () => {
    renderProductsTable();

    expect(screen.getByRole("columnheader", { name: "Name" })).toBeInTheDocument();
    expect(screen.getByRole("cell", { name: "Classic Tee" })).toBeInTheDocument();
  });

  it("should expose the caption as an accessible table name", () => {
    renderProductsTable();

    expect(screen.getByRole("table", { name: "Products" })).toBeInTheDocument();
  });
});
