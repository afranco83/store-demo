import { describe, it, expect } from "vitest";
import { http, HttpResponse } from "msw";
import { server } from "@store-demo/testing";
import { getCategories } from "./categories.api";
import { ApiClientError } from "./errors";

describe("http-client", () => {
  it("should throw ApiClientError when the network request fails", async () => {
    server.use(http.get("*/api/categories", () => HttpResponse.error()));

    await expect(getCategories()).rejects.toThrow(ApiClientError);
  });

  it("should throw ApiClientError when the success response body is not valid JSON", async () => {
    server.use(http.get("*/api/categories", () => new HttpResponse("not json", { status: 200 })));

    await expect(getCategories()).rejects.toThrow(ApiClientError);
  });

  it('should throw ApiClientError when the response is missing the "data" field', async () => {
    server.use(http.get("*/api/categories", () => HttpResponse.json({ nope: true })));

    await expect(getCategories()).rejects.toThrow(ApiClientError);
  });

  it("should throw ApiClientError when the response data fails schema validation", async () => {
    server.use(
      http.get("*/api/categories", () => HttpResponse.json({ data: [{ invalid: true }] })),
    );

    await expect(getCategories()).rejects.toThrow(ApiClientError);
  });

  it("should throw ApiClientError with a generic HTTP message when the error body is not JSON", async () => {
    server.use(
      http.get("*/api/categories", () => new HttpResponse("plain text error", { status: 500 })),
    );

    await expect(getCategories()).rejects.toThrow(ApiClientError);
  });
});
