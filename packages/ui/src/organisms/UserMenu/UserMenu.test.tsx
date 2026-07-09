import { describe, expect, it } from "vitest";
import { screen } from "@testing-library/react";
import { expectNoAccessibilityViolations, renderWithProviders } from "@store-demo/testing";

import { UserMenu } from "./UserMenu";

const items = (
  <>
    <a href="/account" role="menuitem">
      Mi cuenta
    </a>
    <button type="button" role="menuitem">
      Cerrar sesión
    </button>
  </>
);

describe("UserMenu", () => {
  it("should have no accessibility violations", async () => {
    const { container } = renderWithProviders(<UserMenu triggerLabel="Cuenta" items={items} />);

    await expectNoAccessibilityViolations(container);
  });

  it("should not render the menu items until the trigger is clicked", () => {
    renderWithProviders(<UserMenu triggerLabel="Cuenta" items={items} />);

    expect(screen.queryByRole("menu")).not.toBeInTheDocument();
  });

  it("should open the menu when the trigger is clicked", async () => {
    const { user } = renderWithProviders(<UserMenu triggerLabel="Cuenta" items={items} />);

    await user.click(screen.getByRole("button", { name: "Cuenta" }));

    expect(screen.getByRole("menu")).toBeInTheDocument();
    expect(screen.getByRole("menuitem", { name: "Mi cuenta" })).toBeInTheDocument();
  });

  it("should close the menu when Escape is pressed", async () => {
    const { user } = renderWithProviders(<UserMenu triggerLabel="Cuenta" items={items} />);

    await user.click(screen.getByRole("button", { name: "Cuenta" }));
    expect(screen.getByRole("menu")).toBeInTheDocument();

    await user.keyboard("{Escape}");

    expect(screen.queryByRole("menu")).not.toBeInTheDocument();
  });

  it("should close the menu when clicking outside of it", async () => {
    const { user } = renderWithProviders(
      <div>
        <UserMenu triggerLabel="Cuenta" items={items} />
        <button type="button">Outside</button>
      </div>,
    );

    await user.click(screen.getByRole("button", { name: "Cuenta" }));
    expect(screen.getByRole("menu")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Outside" }));

    expect(screen.queryByRole("menu")).not.toBeInTheDocument();
  });

  it("should close the menu when a menu item is clicked", async () => {
    const { user } = renderWithProviders(<UserMenu triggerLabel="Cuenta" items={items} />);

    await user.click(screen.getByRole("button", { name: "Cuenta" }));
    await user.click(screen.getByRole("menuitem", { name: "Mi cuenta" }));

    expect(screen.queryByRole("menu")).not.toBeInTheDocument();
  });
});
