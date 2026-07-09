import { updateCartItemSchema, cartItemWithProductSchema } from "@store-demo/shared-types";
import { prisma } from "@/lib/prisma";
import { jsonError, jsonSuccess, jsonZodError, mapPrismaErrorToResponse } from "@/lib/api-response";
import { validateOutputInDev } from "@/lib/validate-output";
import { toCartItemWithProductDto } from "@/lib/mappers";
import { resolveCartIdentity, UnauthorizedError } from "@/lib/guard";

export const dynamic = "force-dynamic";

type RouteParams = { params: Promise<{ productId: string }> };

export async function PATCH(request: Request, { params }: RouteParams) {
  const { productId } = await params;
  const parsedBody = updateCartItemSchema.safeParse(await request.json());
  if (!parsedBody.success) {
    return jsonZodError(parsedBody.error);
  }

  try {
    const identity = await resolveCartIdentity(request);
    const cartItem = await prisma.cartItem.update({
      where:
        identity.type === "user"
          ? { userId_productId: { userId: identity.userId, productId } }
          : { guestId_productId: { guestId: identity.guestId, productId } },
      data: { quantity: parsedBody.data.quantity },
      include: { product: true },
    });
    const data = toCartItemWithProductDto(cartItem);
    validateOutputInDev({ schema: cartItemWithProductSchema, data });
    return jsonSuccess(data);
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      return jsonError("Unauthorized", 401);
    }
    return mapPrismaErrorToResponse(error);
  }
}

export async function DELETE(request: Request, { params }: RouteParams) {
  const { productId } = await params;
  try {
    const identity = await resolveCartIdentity(request);
    await prisma.cartItem.delete({
      where:
        identity.type === "user"
          ? { userId_productId: { userId: identity.userId, productId } }
          : { guestId_productId: { guestId: identity.guestId, productId } },
    });
    return new Response(null, { status: 204 });
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      return jsonError("Unauthorized", 401);
    }
    return mapPrismaErrorToResponse(error);
  }
}
