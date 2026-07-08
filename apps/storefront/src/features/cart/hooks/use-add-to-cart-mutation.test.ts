import { describe, expect, it, vi } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { http, HttpResponse } from "msw";
import { createQueryWrapper, createTestQueryClient, server } from "@store-demo/testing";

import { useAddToCartMutation } from "./use-add-to-cart-mutation";
import { useCart } from "./use-cart";

describe("useAddToCartMutation", () => {
  it("should add an item to the cart and invalidate the cart query", async () => {
    const queryClient = createTestQueryClient();
    const wrapper = createQueryWrapper(queryClient);

    const cart = renderHook(() => useCart(), { wrapper });
    await waitFor(() => expect(cart.result.current.isSuccess).toBe(true));

    const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries");
    const mutation = renderHook(() => useAddToCartMutation(), { wrapper });

    mutation.result.current.mutate({ productId: "product-1", quantity: 1 });

    await waitFor(() => expect(mutation.result.current.isSuccess).toBe(true));
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ["cart"] });
  });

  it("should expose an error state when the request fails", async () => {
    server.use(
      http.post("*/api/cart/:userId", () =>
        HttpResponse.json({ error: { message: "Cannot add item" } }, { status: 500 }),
      ),
    );

    const { result } = renderHook(() => useAddToCartMutation(), { wrapper: createQueryWrapper() });

    result.current.mutate({ productId: "product-1", quantity: 1 });

    await waitFor(() => expect(result.current.isError).toBe(true));
  });
});
