import { updateProductSchema, productSchema } from "@store-demo/shared-types";
import { prisma } from "@/lib/prisma";
import { jsonError, jsonSuccess, jsonZodError, mapPrismaErrorToResponse } from "@/lib/api-response";
import { validateOutputInDev } from "@/lib/validate-output";
import { toProductDto } from "@/lib/mappers";

export const dynamic = "force-dynamic";

type RouteParams = { params: Promise<{ slug: string }> };

export async function GET(_request: Request, { params }: RouteParams) {
  const { slug } = await params;
  const product = await prisma.product.findUnique({ where: { slug } });
  if (!product) {
    return jsonError("Product not found", 404);
  }
  const data = toProductDto(product);
  validateOutputInDev({ schema: productSchema, data });
  return jsonSuccess(data);
}

export async function PATCH(request: Request, { params }: RouteParams) {
  const { slug } = await params;
  const parsedBody = updateProductSchema.safeParse(await request.json());
  if (!parsedBody.success) {
    return jsonZodError(parsedBody.error);
  }

  try {
    const product = await prisma.product.update({ where: { slug }, data: parsedBody.data });
    const data = toProductDto(product);
    validateOutputInDev({ schema: productSchema, data });
    return jsonSuccess(data);
  } catch (error) {
    return mapPrismaErrorToResponse(error);
  }
}

export async function DELETE(_request: Request, { params }: RouteParams) {
  const { slug } = await params;
  try {
    await prisma.product.delete({ where: { slug } });
    return new Response(null, { status: 204 });
  } catch (error) {
    return mapPrismaErrorToResponse(error);
  }
}
