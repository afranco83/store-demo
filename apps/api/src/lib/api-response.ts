import { NextResponse } from "next/server";
import { z } from "zod";
import type { ZodError } from "zod";
import { Prisma } from "../generated/prisma/client";

export function jsonSuccess<TData>(data: TData, status = 200) {
  return NextResponse.json({ data }, { status });
}

export function jsonError(message: string, status: number) {
  return NextResponse.json({ error: { message } }, { status });
}

export function jsonZodError(error: ZodError) {
  return jsonError(z.prettifyError(error), 400);
}

const PRISMA_NOT_FOUND_CODE = "P2025";
const PRISMA_UNIQUE_CONSTRAINT_CODE = "P2002";
const PRISMA_FOREIGN_KEY_CODES = new Set(["P2003", "P2014"]);

export function mapPrismaErrorToResponse(error: unknown) {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === PRISMA_NOT_FOUND_CODE) {
      return jsonError("Resource not found", 404);
    }
    if (error.code === PRISMA_UNIQUE_CONSTRAINT_CODE) {
      return jsonError("A resource with this value already exists", 409);
    }
    if (PRISMA_FOREIGN_KEY_CODES.has(error.code)) {
      return jsonError("Cannot complete the operation: related records exist", 409);
    }
  }
  console.error("Unexpected error handling request:", error);
  return jsonError("Unexpected server error", 500);
}
