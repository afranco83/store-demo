import { updateCartItemSchema, cartItemWithProductSchema } from "@store-demo/shared-types";
import { prisma } from "@/lib/prisma";
import { jsonSuccess, jsonZodError } from "@/lib/api-response";
import { validateOutputInDev } from "@/lib/validate-output";
import { toCartItemWithProductDto } from "@/lib/mappers";
import { cartItemUniqueWhere, handleCartRouteError, resolveCartIdentity } from "@/lib/guard";

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
      where: cartItemUniqueWhere(identity, productId),
      data: { quantity: parsedBody.data.quantity },
      include: { product: true },
    });
    const data = toCartItemWithProductDto(cartItem);
    validateOutputInDev({ schema: cartItemWithProductSchema, data });
    return jsonSuccess(data);
  } catch (error) {
    return handleCartRouteError(error);
  }
}

export async function DELETE(request: Request, { params }: RouteParams) {
  const { productId } = await params;
  try {
    const identity = await resolveCartIdentity(request);
    await prisma.cartItem.delete({ where: cartItemUniqueWhere(identity, productId) });
    return new Response(null, { status: 204 });
  } catch (error) {
    return handleCartRouteError(error);
  }
}
