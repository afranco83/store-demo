import { describe, it, expect } from "vitest";
import { http, HttpResponse } from "msw";
import { server } from "@store-demo/testing";
import {
  getProducts,
  getProductBySlug,
  createProduct,
  updateProduct,
  deleteProduct,
} from "./products.api";
import { ApiClientError } from "./errors";

describe("products.api", () => {
  it("should return a list of products when the request succeeds", async () => {
    const products = await getProducts();

    expect(products.length).toBeGreaterThan(0);
  });

  it("should return a filtered list of products when a category slug is provided", async () => {
    const products = await getProducts({ categorySlug: "electronics" });

    expect(products.length).toBeGreaterThan(0);
  });

  it("should return a single product when requesting by slug", async () => {
    const product = await getProductBySlug({ slug: "headphones" });

    expect(product.slug).toBe("headphones");
  });

  it("should create a product and return it", async () => {
    const product = await createProduct({
      slug: "new-product",
      name: "New Product",
      description: "A great product",
      priceCents: 1000,
      imageUrl: "https://res.cloudinary.com/demo/image/upload/v1/x.jpg",
      stock: 5,
      categoryId: "category-1",
    });

    expect(product).toHaveProperty("id");
  });

  it("should update a product and return it", async () => {
    const product = await updateProduct({ slug: "headphones", input: { stock: 5 } });

    expect(product.slug).toBe("headphones");
  });

  it("should delete a product without throwing", async () => {
    await expect(deleteProduct({ slug: "headphones" })).resolves.toBeUndefined();
  });

  it("should throw ApiClientError when the product is not found", async () => {
    server.use(
      http.get("*/api/products/:slug", () => {
        return HttpResponse.json({ error: { message: "Product not found" } }, { status: 404 });
      }),
    );

    await expect(getProductBySlug({ slug: "missing" })).rejects.toThrow(ApiClientError);
  });
});
