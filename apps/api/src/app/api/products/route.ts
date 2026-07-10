import { z } from "zod";
import { createProductSchema, productSchema } from "@store-demo/shared-types";
import { prisma } from "@/lib/prisma";
import { jsonSuccess, jsonZodError } from "@/lib/api-response";
import { validateOutputInDev } from "@/lib/validate-output";
import { toProductDto } from "@/lib/mappers";
import { handleAuthenticatedRouteError, requireAdmin } from "@/lib/guard";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const categorySlug = new URL(request.url).searchParams.get("categorySlug");
  const products = await prisma.product.findMany({
    where: categorySlug ? { category: { slug: categorySlug } } : undefined,
    orderBy: { name: "asc" },
  });
  const data = products.map(toProductDto);
  validateOutputInDev({ schema: z.array(productSchema), data });
  return jsonSuccess(data);
}

export async function POST(request: Request) {
  const parsedBody = createProductSchema.safeParse(await request.json());
  if (!parsedBody.success) {
    return jsonZodError(parsedBody.error);
  }

  try {
    await requireAdmin(request);
    const product = await prisma.product.create({ data: parsedBody.data });
    const data = toProductDto(product);
    validateOutputInDev({ schema: productSchema, data });
    return jsonSuccess(data, 201);
  } catch (error) {
    return handleAuthenticatedRouteError(error);
  }
}
