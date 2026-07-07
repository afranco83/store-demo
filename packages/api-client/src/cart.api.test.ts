import { describe, it, expect } from "vitest";
import { http, HttpResponse } from "msw";
import { server } from "@store-demo/testing";
import { getCart, addCartItem, updateCartItem, removeCartItem, clearCart } from "./cart.api";
import { ApiClientError } from "./errors";

describe("cart.api", () => {
  it("should return the cart items for a user", async () => {
    const cartItems = await getCart({ userId: "user-1" });

    expect(cartItems.length).toBeGreaterThan(0);
  });

  it("should add an item to the cart and return the updated cart", async () => {
    const cartItems = await addCartItem({ userId: "user-1", productId: "product-1", quantity: 2 });

    expect(cartItems.length).toBeGreaterThan(0);
  });

  it("should update a cart item quantity", async () => {
    const cartItem = await updateCartItem({
      userId: "user-1",
      productId: "product-1",
      quantity: 3,
    });

    expect(cartItem.userId).toBe("user-1");
  });

  it("should remove a cart item without throwing", async () => {
    await expect(
      removeCartItem({ userId: "user-1", productId: "product-1" }),
    ).resolves.toBeUndefined();
  });

  it("should clear the cart and return an empty list", async () => {
    const cartItems = await clearCart({ userId: "user-1" });

    expect(cartItems).toEqual([]);
  });

  it("should throw ApiClientError when adding an item fails", async () => {
    server.use(
      http.post("*/api/cart/:userId", () => {
        return HttpResponse.json({ error: { message: "Product not found" } }, { status: 404 });
      }),
    );

    await expect(
      addCartItem({ userId: "user-1", productId: "missing", quantity: 1 }),
    ).rejects.toThrow(ApiClientError);
  });
});
