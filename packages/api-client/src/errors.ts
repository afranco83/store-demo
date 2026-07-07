export class ApiClientError extends Error {
  readonly status: number;
  readonly url: string;

  constructor({
    message,
    status,
    url,
    cause,
  }: {
    message: string;
    status: number;
    url: string;
    cause?: unknown;
  }) {
    super(message, { cause });
    this.name = "ApiClientError";
    this.status = status;
    this.url = url;
  }
}
