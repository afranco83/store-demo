import { afterEach, describe, expect, it } from "vitest";

import { useCartDrawerStore } from "./use-cart-drawer-store";

describe("useCartDrawerStore", () => {
  afterEach(() => {
    useCartDrawerStore.setState({ isOpen: false });
  });

  it("should start closed", () => {
    expect(useCartDrawerStore.getState().isOpen).toBe(false);
  });

  it("should open the drawer", () => {
    useCartDrawerStore.getState().open();

    expect(useCartDrawerStore.getState().isOpen).toBe(true);
  });

  it("should close the drawer", () => {
    useCartDrawerStore.getState().open();
    useCartDrawerStore.getState().close();

    expect(useCartDrawerStore.getState().isOpen).toBe(false);
  });

  it("should toggle the drawer state", () => {
    useCartDrawerStore.getState().toggle();
    expect(useCartDrawerStore.getState().isOpen).toBe(true);

    useCartDrawerStore.getState().toggle();
    expect(useCartDrawerStore.getState().isOpen).toBe(false);
  });
});
