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

  // La identidad (usuario vía Bearer token o invitado vía X-Guest-Id, Fase 5)
  // viaja en headers, no en la URL — estos dobles no la inspeccionan, no es
  // el objetivo de estos tests (ver cart.api.test.ts/orders.api.test.ts para
  // los casos que sí verifican el guard, contra apps/api real vía E2E).
  http.get("*/api/cart", () => {
    return HttpResponse.json({ data: [createCartItemFixture(), createCartItemFixture()] });
  }),
  http.post("*/api/cart", () => {
    return HttpResponse.json({ data: [createCartItemFixture()] }, { status: 201 });
  }),
  http.delete("*/api/cart", () => {
    return HttpResponse.json({ data: [] });
  }),
  http.patch("*/api/cart/:productId", ({ params }) => {
    return HttpResponse.json({
      data: createCartItemFixture({ productId: String(params.productId) }),
    });
  }),
  http.delete("*/api/cart/:productId", () => {
    return new HttpResponse(null, { status: 204 });
  }),
  http.post("*/api/cart/merge", () => {
    return HttpResponse.json({ data: [createCartItemFixture()] });
  }),

  http.get("*/api/orders", () => {
    return HttpResponse.json({ data: [createOrderFixture()] });
  }),
  http.get("*/api/orders/:orderId", ({ params }) => {
    return HttpResponse.json({ data: createOrderFixture({ id: String(params.orderId) }) });
  }),
  http.post("*/api/orders", () => {
    return HttpResponse.json({ data: createOrderFixture() }, { status: 201 });
  }),
  http.patch("*/api/orders/:orderId", ({ params }) => {
    return HttpResponse.json({ data: createOrderFixture({ id: String(params.orderId) }) });
  }),

  http.post("*/api/auth/login", () => {
    return HttpResponse.json({
      data: { token: "fake-jwt-token", user: createUserFixture() },
    });
  }),
  http.post("*/api/auth/register", () => {
    return HttpResponse.json({ data: { user: createUserFixture() } }, { status: 201 });
  }),

  http.get("*/api/users/me", () => {
    return HttpResponse.json({ data: createUserFixture() });
  }),
  http.patch("*/api/users/me", () => {
    return HttpResponse.json({ data: createUserFixture() });
  }),
];
