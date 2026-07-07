import { http, HttpResponse } from "msw";
import {
  createCategoryFixture,
  createProductFixture,
  createCartItemFixture,
  createOrderFixture,
  createUserFixture,
} from "../factories";

// Espejo de los Route Handlers reales de apps/api (ver ROUTE_HANDLERS en el
// plan de Fase 2); las respuestas usan fixtures, no reflejan fielmente el
// body enviado (no es el objetivo de estos dobles de test).
export const handlers = [
  http.get("*/api/categories", () => {
    return HttpResponse.json({ data: [createCategoryFixture(), createCategoryFixture()] });
  }),
  http.get("*/api/categories/:slug", ({ params }) => {
    return HttpResponse.json({ data: createCategoryFixture({ slug: String(params.slug) }) });
  }),
  http.post("*/api/categories", () => {
    return HttpResponse.json({ data: createCategoryFixture() }, { status: 201 });
  }),
  http.patch("*/api/categories/:slug", ({ params }) => {
    return HttpResponse.json({ data: createCategoryFixture({ slug: String(params.slug) }) });
  }),
  http.delete("*/api/categories/:slug", () => {
    return new HttpResponse(null, { status: 204 });
  }),

  http.get("*/api/products", () => {
    return HttpResponse.json({ data: [createProductFixture(), createProductFixture()] });
  }),
  http.get("*/api/products/:slug", ({ params }) => {
    return HttpResponse.json({ data: createProductFixture({ slug: String(params.slug) }) });
  }),
  http.post("*/api/products", () => {
    return HttpResponse.json({ data: createProductFixture() }, { status: 201 });
  }),
  http.patch("*/api/products/:slug", ({ params }) => {
    return HttpResponse.json({ data: createProductFixture({ slug: String(params.slug) }) });
  }),
  http.delete("*/api/products/:slug", () => {
    return new HttpResponse(null, { status: 204 });
  }),

  http.get("*/api/cart/:userId", ({ params }) => {
    const userId = String(params.userId);
    return HttpResponse.json({
      data: [createCartItemFixture({ userId }), createCartItemFixture({ userId })],
    });
  }),
  http.post("*/api/cart/:userId", ({ params }) => {
    const userId = String(params.userId);
    return HttpResponse.json({ data: [createCartItemFixture({ userId })] }, { status: 201 });
  }),
  http.delete("*/api/cart/:userId", () => {
    return HttpResponse.json({ data: [] });
  }),
  http.patch("*/api/cart/:userId/:productId", ({ params }) => {
    return HttpResponse.json({
      data: createCartItemFixture({
        userId: String(params.userId),
        productId: String(params.productId),
      }),
    });
  }),
  http.delete("*/api/cart/:userId/:productId", () => {
    return new HttpResponse(null, { status: 204 });
  }),

  http.get("*/api/orders/:userId", ({ params }) => {
    return HttpResponse.json({ data: [createOrderFixture({ userId: String(params.userId) })] });
  }),
  http.get("*/api/orders/:userId/:orderId", ({ params }) => {
    return HttpResponse.json({
      data: createOrderFixture({
        id: String(params.orderId),
        userId: String(params.userId),
      }),
    });
  }),
  http.post("*/api/orders/:userId", ({ params }) => {
    return HttpResponse.json(
      { data: createOrderFixture({ userId: String(params.userId) }) },
      { status: 201 },
    );
  }),
  http.patch("*/api/orders/:userId/:orderId", ({ params }) => {
    return HttpResponse.json({
      data: createOrderFixture({
        id: String(params.orderId),
        userId: String(params.userId),
      }),
    });
  }),

  http.post("*/api/auth/login", () => {
    return HttpResponse.json({
      data: { token: "fake-jwt-token", user: createUserFixture() },
    });
  }),
];
