import { z } from "zod";

export const categorySchema = z.object({
  id: z.string(),
  slug: z.string(),
  name: z.string(),
  description: z.string().nullable(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});
export type Category = z.infer<typeof categorySchema>;

export const createCategorySchema = z.object({
  slug: z.string().min(1),
  name: z.string().min(1),
  description: z.string().min(1).optional(),
});
export type CreateCategory = z.infer<typeof createCategorySchema>;

export const updateCategorySchema = createCategorySchema.partial();
export type UpdateCategory = z.infer<typeof updateCategorySchema>;
