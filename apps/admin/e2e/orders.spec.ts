import { expect, test } from "@playwright/test";

test("shows the customer's email for each order", async ({ page }) => {
  await page.goto("/orders");

  const firstRow = page.getByRole("row").nth(1);
  await expect(firstRow.getByRole("cell").nth(1)).toHaveText(/.+@.+\..+/);
});

test("changes the status of an existing order and persists it after a reload", async ({ page }) => {
  await page.goto("/orders");

  const firstRow = page.getByRole("row").nth(1);
  const statusSelect = firstRow.getByRole("combobox");
  await expect(statusSelect).toBeVisible();

  const nextStatus = (await statusSelect.inputValue()) === "shipped" ? "delivered" : "shipped";
  await statusSelect.selectOption(nextStatus);

  await expect(statusSelect).toHaveValue(nextStatus);

  await page.reload();
  await expect(page.getByRole("row").nth(1).getByRole("combobox")).toHaveValue(nextStatus);
});
