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
import { useUpdateCartItemMutation } from "./use-update-cart-item-mutation";

describe("useUpdateCartItemMutation", () => {
  it("should update the quantity of a cart item", async () => {
    const { result } = renderHook(() => useUpdateCartItemMutation(), {
      wrapper: createQueryWrapper(),
    });

    result.current.mutate({ productId: "product-1", quantity: 3 });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
  });

  it("should replace only the updated item in the cart cache", async () => {
    const queryClient = createTestQueryClient();
    const staleItem = createCartItemFixture({ productId: "product-1", quantity: 1 });
    const otherItem = createCartItemFixture({ productId: "product-2", quantity: 4 });
    queryClient.setQueryData(cartQueryKey, [staleItem, otherItem]);

    const updatedItem = createCartItemFixture({ productId: "product-1", quantity: 3 });
    server.use(
      http.patch("*/api/cart/:userId/:productId", () => HttpResponse.json({ data: updatedItem })),
    );

    const { result } = renderHook(() => useUpdateCartItemMutation(), {
      wrapper: createQueryWrapper(queryClient),
    });

    result.current.mutate({ productId: "product-1", quantity: 3 });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(queryClient.getQueryData(cartQueryKey)).toEqual([updatedItem, otherItem]);
  });

  it("should expose an error state when the request fails", async () => {
    server.use(
      http.patch("*/api/cart/:userId/:productId", () =>
        HttpResponse.json({ error: { message: "Cannot update item" } }, { status: 500 }),
      ),
    );

    const { result } = renderHook(() => useUpdateCartItemMutation(), {
      wrapper: createQueryWrapper(),
    });

    result.current.mutate({ productId: "product-1", quantity: 0 });

    await waitFor(() => expect(result.current.isError).toBe(true));
  });
});
