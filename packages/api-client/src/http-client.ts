import type { z } from "zod";
import { API_BASE_URL } from "./config";
import { ApiClientError } from "./errors";

// El runtime de Next.js parchea el `fetch` global para aceptar esta opción
// extra; lib.dom.d.ts no la declara porque este paquete no depende de Next.
export type ApiFetchInit = RequestInit & {
  next?: { revalidate?: number | false; tags?: string[] };
};

function isErrorEnvelope(body: unknown): body is { error: { message: string } } {
  return (
    typeof body === "object" &&
    body !== null &&
    "error" in body &&
    typeof (body as { error?: unknown }).error === "object" &&
    (body as { error?: unknown }).error !== null
  );
}

function isDataEnvelope(body: unknown): body is { data: unknown } {
  return typeof body === "object" && body !== null && "data" in body;
}

async function performFetch({
  path,
  init,
}: {
  path: string;
  init?: ApiFetchInit;
}): Promise<Response> {
  const url = `${API_BASE_URL}${path}`;

  let response: Response;
  try {
    response = await fetch(url, init);
  } catch (cause) {
    throw new ApiClientError({
      message: `Network error requesting ${url}`,
      status: 0,
      url,
      cause,
    });
  }

  if (!response.ok) {
    let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
    try {
      const errorBody: unknown = await response.json();
      if (isErrorEnvelope(errorBody)) {
        errorMessage = errorBody.error.message;
      }
    } catch {
      // El cuerpo de error no era JSON válido; se conserva el mensaje HTTP genérico.
    }
    throw new ApiClientError({ message: errorMessage, status: response.status, url });
  }

  return response;
}

export async function fetchJson<TSchema extends z.ZodTypeAny>({
  path,
  schema,
  init,
}: {
  path: string;
  schema: TSchema;
  init?: ApiFetchInit;
}): Promise<z.infer<TSchema>> {
  const response = await performFetch({ path, init });
  const url = `${API_BASE_URL}${path}`;

  let body: unknown;
  try {
    body = await response.json();
  } catch (cause) {
    throw new ApiClientError({
      message: `Invalid JSON response from ${url}`,
      status: response.status,
      url,
      cause,
    });
  }

  if (!isDataEnvelope(body)) {
    throw new ApiClientError({
      message: `Missing "data" field in response from ${url}`,
      status: response.status,
      url,
    });
  }

  const result = schema.safeParse(body.data);
  if (!result.success) {
    throw new ApiClientError({
      message: `Response validation failed for ${url}: ${result.error.message}`,
      status: response.status,
      url,
      cause: result.error,
    });
  }

  return result.data;
}

export async function fetchVoid({
  path,
  init,
}: {
  path: string;
  init?: ApiFetchInit;
}): Promise<void> {
  await performFetch({ path, init });
}
