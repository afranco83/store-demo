import { describe, expect, it } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { http, HttpResponse } from "msw";
import {
  createCartItemFixture,
  createQueryWrapper,
  createTestQueryClient,
  server,
} from "@store-demo/testing";

import { cartQueryKey } from "./cart-query-key";
import { useRemoveCartItemMutation } from "./use-remove-cart-item-mutation";

describe("useRemoveCartItemMutation", () => {
  it("should remove a cart item", async () => {
    const { result } = renderHook(() => useRemoveCartItemMutation(), {
      wrapper: createQueryWrapper(),
    });

    result.current.mutate({ productId: "product-1" });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
  });

  it("should remove only the targeted item from the cart cache", async () => {
    const queryClient = createTestQueryClient();
    const removedItem = createCartItemFixture({ productId: "product-1" });
    const otherItem = createCartItemFixture({ productId: "product-2" });
    queryClient.setQueryData(cartQueryKey, [removedItem, otherItem]);

    server.use(
      http.delete("*/api/cart/:userId/:productId", () => new HttpResponse(null, { status: 204 })),
    );

    const { result } = renderHook(() => useRemoveCartItemMutation(), {
      wrapper: createQueryWrapper(queryClient),
    });

    result.current.mutate({ productId: "product-1" });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(queryClient.getQueryData(cartQueryKey)).toEqual([otherItem]);
  });

  it("should expose an error state when the request fails", async () => {
    server.use(
      http.delete("*/api/cart/:userId/:productId", () =>
        HttpResponse.json({ error: { message: "Cannot remove item" } }, { status: 500 }),
      ),
    );

    const { result } = renderHook(() => useRemoveCartItemMutation(), {
      wrapper: createQueryWrapper(),
    });

    result.current.mutate({ productId: "product-1" });

    await waitFor(() => expect(result.current.isError).toBe(true));
  });
});
