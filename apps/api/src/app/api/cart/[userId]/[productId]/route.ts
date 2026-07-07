import { updateCartItemSchema, cartItemWithProductSchema } from "@store-demo/shared-types";
import { prisma } from "@/lib/prisma";
import { jsonSuccess, jsonZodError, mapPrismaErrorToResponse } from "@/lib/api-response";
import { validateOutputInDev } from "@/lib/validate-output";
import { toCartItemWithProductDto } from "@/lib/mappers";

export const dynamic = "force-dynamic";

type RouteParams = { params: Promise<{ userId: string; productId: string }> };

export async function PATCH(request: Request, { params }: RouteParams) {
  const { userId, productId } = await params;
  const parsedBody = updateCartItemSchema.safeParse(await request.json());
  if (!parsedBody.success) {
    return jsonZodError(parsedBody.error);
  }

  try {
    const cartItem = await prisma.cartItem.update({
      where: { userId_productId: { userId, productId } },
      data: { quantity: parsedBody.data.quantity },
      include: { product: true },
    });
    const data = toCartItemWithProductDto(cartItem);
    validateOutputInDev({ schema: cartItemWithProductSchema, data });
    return jsonSuccess(data);
  } catch (error) {
    return mapPrismaErrorToResponse(error);
  }
}

export async function DELETE(_request: Request, { params }: RouteParams) {
  const { userId, productId } = await params;
  try {
    await prisma.cartItem.delete({ where: { userId_productId: { userId, productId } } });
    return new Response(null, { status: 204 });
  } catch (error) {
    return mapPrismaErrorToResponse(error);
  }
}
