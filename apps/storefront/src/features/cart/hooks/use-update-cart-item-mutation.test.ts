import { describe, expect, it } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { http, HttpResponse } from "msw";
import { createQueryWrapper, server } from "@store-demo/testing";

import { useUpdateCartItemMutation } from "./use-update-cart-item-mutation";

describe("useUpdateCartItemMutation", () => {
  it("should update the quantity of a cart item", async () => {
    const { result } = renderHook(() => useUpdateCartItemMutation(), {
      wrapper: createQueryWrapper(),
    });

    result.current.mutate({ productId: "product-1", quantity: 3 });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
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
