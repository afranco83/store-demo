import { z } from "zod";
import { createCategorySchema, categorySchema } from "@store-demo/shared-types";
import { prisma } from "@/lib/prisma";
import { jsonSuccess, jsonZodError, mapPrismaErrorToResponse } from "@/lib/api-response";
import { validateOutputInDev } from "@/lib/validate-output";
import { toCategoryDto } from "@/lib/mappers";

export const dynamic = "force-dynamic";

export async function GET() {
  const categories = await prisma.category.findMany({ orderBy: { name: "asc" } });
  const data = categories.map(toCategoryDto);
  validateOutputInDev({ schema: z.array(categorySchema), data });
  return jsonSuccess(data);
}

export async function POST(request: Request) {
  const parsedBody = createCategorySchema.safeParse(await request.json());
  if (!parsedBody.success) {
    return jsonZodError(parsedBody.error);
  }

  try {
    const category = await prisma.category.create({ data: parsedBody.data });
    const data = toCategoryDto(category);
    validateOutputInDev({ schema: categorySchema, data });
    return jsonSuccess(data, 201);
  } catch (error) {
    return mapPrismaErrorToResponse(error);
  }
}
