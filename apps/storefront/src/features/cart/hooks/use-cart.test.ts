import { describe, expect, it } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { http, HttpResponse } from "msw";
import { createQueryWrapper, server } from "@store-demo/testing";

import { useCart } from "./use-cart";

describe("useCart", () => {
  it("should expose a loading state while fetching", () => {
    const { result } = renderHook(() => useCart(), { wrapper: createQueryWrapper() });

    expect(result.current.isLoading).toBe(true);
  });

  it("should return the cart items on success", async () => {
    const { result } = renderHook(() => useCart(), { wrapper: createQueryWrapper() });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toHaveLength(2);
  });

  it("should expose an error state when the request fails", async () => {
    server.use(
      http.get("*/api/cart/:userId", () =>
        HttpResponse.json({ error: { message: "Cart unavailable" } }, { status: 500 }),
      ),
    );

    const { result } = renderHook(() => useCart(), { wrapper: createQueryWrapper() });

    await waitFor(() => expect(result.current.isError).toBe(true));
  });
});
