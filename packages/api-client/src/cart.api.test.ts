import { describe, it, expect } from "vitest";
import { http, HttpResponse } from "msw";
import { server } from "@store-demo/testing";
import {
  getCart,
  addCartItem,
  updateCartItem,
  removeCartItem,
  clearCart,
  mergeGuestCart,
} from "./cart.api";
import { ApiClientError } from "./errors";

const userIdentity = { token: "fake-jwt-token" };
const guestIdentity = { guestId: "guest-1" };

describe("cart.api", () => {
  it("should return the cart items for an authenticated user", async () => {
    const cartItems = await getCart({ identity: userIdentity });

    expect(cartItems.length).toBeGreaterThan(0);
  });

  it("should return the cart items for a guest", async () => {
    const cartItems = await getCart({ identity: guestIdentity });

    expect(cartItems.length).toBeGreaterThan(0);
  });

  it("should add an item to the cart and return the updated cart", async () => {
    const cartItems = await addCartItem({
      identity: userIdentity,
      productId: "product-1",
      quantity: 2,
    });

    expect(cartItems.length).toBeGreaterThan(0);
  });

  it("should update a cart item quantity", async () => {
    const cartItem = await updateCartItem({
      identity: userIdentity,
      productId: "product-1",
      quantity: 3,
    });

    expect(cartItem.productId).toBe("product-1");
  });

  it("should remove a cart item without throwing", async () => {
    await expect(
      removeCartItem({ identity: userIdentity, productId: "product-1" }),
    ).resolves.toBeUndefined();
  });

  it("should clear the cart and return an empty list", async () => {
    const cartItems = await clearCart({ identity: userIdentity });

    expect(cartItems).toEqual([]);
  });

  it("should merge a guest cart into the authenticated user's cart", async () => {
    const cartItems = await mergeGuestCart({ token: "fake-jwt-token", guestId: "guest-1" });

    expect(cartItems.length).toBeGreaterThan(0);
  });

  it("should throw ApiClientError when adding an item fails", async () => {
    server.use(
      http.post("*/api/cart", () => {
        return HttpResponse.json({ error: { message: "Product not found" } }, { status: 404 });
      }),
    );

    await expect(
      addCartItem({ identity: userIdentity, productId: "missing", quantity: 1 }),
    ).rejects.toThrow(ApiClientError);
  });
});
