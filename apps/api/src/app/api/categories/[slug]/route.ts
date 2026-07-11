import { updateCategorySchema, categorySchema } from "@store-demo/shared-types";
import { prisma } from "@/lib/prisma";
import { jsonError, jsonSuccess, jsonZodError } from "@/lib/api-response";
import { validateOutputInDev } from "@/lib/validate-output";
import { toCategoryDto } from "@/lib/mappers";
import { handleAuthenticatedRouteError, requireAdmin } from "@/lib/guard";

export const dynamic = "force-dynamic";

type RouteParams = { params: Promise<{ slug: string }> };

export async function GET(_request: Request, { params }: RouteParams) {
  const { slug } = await params;
  const category = await prisma.category.findUnique({ where: { slug } });
  if (!category) {
    return jsonError("Category not found", 404);
  }
  const data = toCategoryDto(category);
  validateOutputInDev({ schema: categorySchema, data });
  return jsonSuccess(data);
}

export async function PATCH(request: Request, { params }: RouteParams) {
  const { slug } = await params;
  const parsedBody = updateCategorySchema.safeParse(await request.json());
  if (!parsedBody.success) {
    return jsonZodError(parsedBody.error);
  }

  try {
    await requireAdmin(request);
    const category = await prisma.category.update({ where: { slug }, data: parsedBody.data });
    const data = toCategoryDto(category);
    validateOutputInDev({ schema: categorySchema, data });
    return jsonSuccess(data);
  } catch (error) {
    return handleAuthenticatedRouteError(error);
  }
}

export async function DELETE(request: Request, { params }: RouteParams) {
  const { slug } = await params;
  try {
    await requireAdmin(request);
    await prisma.category.delete({ where: { slug } });
    return new Response(null, { status: 204 });
  } catch (error) {
    return handleAuthenticatedRouteError(error);
  }
}
