import type { z } from "zod";

/**
 * Revalida en desarrollo que la respuesta construida a mano coincide con el
 * contrato Zod, para detectar drift entre el modelo de Prisma y shared-types
 * antes de que llegue a producción (ARCHITECTURE.md §3).
 */
export function validateOutputInDev<TSchema extends z.ZodTypeAny>({
  schema,
  data,
}: {
  schema: TSchema;
  data: z.infer<TSchema>;
}): void {
  if (process.env.NODE_ENV !== "production") {
    schema.parse(data);
  }
}
