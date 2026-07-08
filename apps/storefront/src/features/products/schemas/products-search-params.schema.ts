import { z } from "zod";

export const productsSearchParamsSchema = z.object({
  category: z.string().optional(),
});
export type ProductsSearchParams = z.infer<typeof productsSearchParamsSchema>;
