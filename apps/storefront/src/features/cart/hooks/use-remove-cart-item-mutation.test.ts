import { describe, expect, it } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { http, HttpResponse } from "msw";
import { createQueryWrapper, server } from "@store-demo/testing";

import { useRemoveCartItemMutation } from "./use-remove-cart-item-mutation";

describe("useRemoveCartItemMutation", () => {
  it("should remove a cart item", async () => {
    const { result } = renderHook(() => useRemoveCartItemMutation(), {
      wrapper: createQueryWrapper(),
    });

    result.current.mutate({ productId: "product-1" });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
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
