import { z } from "zod";
import { orderSchema } from "@store-demo/shared-types";
import { prisma } from "@/lib/prisma";
import { jsonError, jsonSuccess, mapPrismaErrorToResponse } from "@/lib/api-response";
import { validateOutputInDev } from "@/lib/validate-output";
import { toOrderDto } from "@/lib/mappers";

export const dynamic = "force-dynamic";

type RouteParams = { params: Promise<{ userId: string }> };

class EmptyCartError extends Error {}

export async function GET(_request: Request, { params }: RouteParams) {
  const { userId } = await params;
  const orders = await prisma.order.findMany({
    where: { userId },
    include: { items: true },
    orderBy: { createdAt: "desc" },
  });
  const data = orders.map(toOrderDto);
  validateOutputInDev({ schema: z.array(orderSchema), data });
  return jsonSuccess(data);
}

export async function POST(_request: Request, { params }: RouteParams) {
  const { userId } = await params;

  try {
    const order = await prisma.$transaction(async (tx) => {
      const cartItems = await tx.cartItem.findMany({
        where: { userId },
        include: { product: true },
      });
      if (cartItems.length === 0) {
        throw new EmptyCartError();
      }

      const totalCents = cartItems.reduce(
        (sum, item) => sum + item.product.priceCents * item.quantity,
        0,
      );

      const createdOrder = await tx.order.create({
        data: {
          userId,
          totalCents,
          items: {
            create: cartItems.map((item) => ({
              productId: item.productId,
              quantity: item.quantity,
              unitPriceCents: item.product.priceCents,
            })),
          },
        },
        include: { items: true },
      });

      await tx.cartItem.deleteMany({ where: { userId } });

      return createdOrder;
    });

    const data = toOrderDto(order);
    validateOutputInDev({ schema: orderSchema, data });
    return jsonSuccess(data, 201);
  } catch (error) {
    if (error instanceof EmptyCartError) {
      return jsonError("Cart is empty", 400);
    }
    return mapPrismaErrorToResponse(error);
  }
}
