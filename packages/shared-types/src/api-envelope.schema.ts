import { z } from "zod";

export function createSuccessEnvelopeSchema<TDataSchema extends z.ZodTypeAny>(
  dataSchema: TDataSchema,
) {
  return z.object({ data: dataSchema });
}

export const errorEnvelopeSchema = z.object({
  error: z.object({ message: z.string() }),
});
export type ErrorEnvelope = z.infer<typeof errorEnvelopeSchema>;
