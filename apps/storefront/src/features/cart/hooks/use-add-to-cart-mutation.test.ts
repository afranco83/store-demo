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
import { useAddToCartMutation } from "./use-add-to-cart-mutation";
import { useCart } from "./use-cart";

describe("useAddToCartMutation", () => {
  it("should add an item to the cart and write the response into the cart cache", async () => {
    const queryClient = createTestQueryClient();
    const wrapper = createQueryWrapper(queryClient);

    const cart = renderHook(() => useCart(), { wrapper });
    await waitFor(() => expect(cart.result.current.isSuccess).toBe(true));

    const mutation = renderHook(() => useAddToCartMutation(), { wrapper });
    mutation.result.current.mutate({ productId: "product-1", quantity: 1 });

    await waitFor(() => expect(mutation.result.current.isSuccess).toBe(true));
    expect(queryClient.getQueryData(cartQueryKey)).toEqual(mutation.result.current.data);
  });

  it("should add to the existing quantity already in the cart instead of overwriting it", async () => {
    const queryClient = createTestQueryClient();
    const existingItem = createCartItemFixture({ productId: "product-1", quantity: 3 });
    queryClient.setQueryData(cartQueryKey, [existingItem]);

    let capturedBody: unknown;
    server.use(
      http.post("*/api/cart", async ({ request }) => {
        capturedBody = await request.json();
        return HttpResponse.json({ data: [existingItem] }, { status: 201 });
      }),
    );

    const { result } = renderHook(() => useAddToCartMutation(), {
      wrapper: createQueryWrapper(queryClient),
    });

    result.current.mutate({ productId: "product-1", quantity: 2 });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(capturedBody).toEqual({ productId: "product-1", quantity: 5 });
  });

  it("should expose an error state when the request fails", async () => {
    server.use(
      http.post("*/api/cart", () =>
        HttpResponse.json({ error: { message: "Cannot add item" } }, { status: 500 }),
      ),
    );

    const { result } = renderHook(() => useAddToCartMutation(), { wrapper: createQueryWrapper() });

    result.current.mutate({ productId: "product-1", quantity: 1 });

    await waitFor(() => expect(result.current.isError).toBe(true));
  });
});
