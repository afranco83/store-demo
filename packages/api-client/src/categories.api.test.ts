import { describe, it, expect } from "vitest";
import { http, HttpResponse } from "msw";
import { server } from "@store-demo/testing";
import {
  getCategories,
  getCategoryBySlug,
  createCategory,
  updateCategory,
  deleteCategory,
} from "./categories.api";
import { ApiClientError } from "./errors";

const token = "fake-jwt-token";

describe("categories.api", () => {
  it("should return a list of categories when the request succeeds", async () => {
    const categories = await getCategories();

    expect(categories.length).toBeGreaterThan(0);
  });

  it("should return a single category when requesting by slug", async () => {
    const category = await getCategoryBySlug({ slug: "electronics" });

    expect(category.slug).toBe("electronics");
  });

  it("should create a category and return it", async () => {
    const category = await createCategory({
      token,
      input: { slug: "new-category", name: "New Category" },
    });

    expect(category).toHaveProperty("id");
  });

  it("should update a category and return it", async () => {
    const category = await updateCategory({
      token,
      slug: "electronics",
      input: { name: "Updated Name" },
    });

    expect(category.slug).toBe("electronics");
  });

  it("should delete a category without throwing", async () => {
    await expect(deleteCategory({ token, slug: "electronics" })).resolves.toBeUndefined();
  });

  it("should throw ApiClientError when the server returns an error", async () => {
    server.use(
      http.get("*/api/categories", () => {
        return HttpResponse.json({ error: { message: "Boom" } }, { status: 500 });
      }),
    );

    await expect(getCategories()).rejects.toThrow(ApiClientError);
  });

  it("should throw ApiClientError with status 403 when the caller is not an admin", async () => {
    server.use(
      http.post("*/api/categories", () => {
        return HttpResponse.json({ error: { message: "Forbidden" } }, { status: 403 });
      }),
    );

    await expect(
      createCategory({ token, input: { slug: "new-category", name: "New Category" } }),
    ).rejects.toMatchObject({ status: 403 });
  });
});
