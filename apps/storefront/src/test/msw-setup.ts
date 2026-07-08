import { afterAll, afterEach, beforeAll } from "vitest";
import { server } from "@store-demo/testing";

beforeAll(() => server.listen({ onUnhandledRequest: "error" }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
