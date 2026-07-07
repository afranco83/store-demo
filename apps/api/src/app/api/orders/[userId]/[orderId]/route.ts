import { updateOrderStatusSchema, orderSchema } from "@store-demo/shared-types";
import { prisma } from "@/lib/prisma";
import { jsonError, jsonSuccess, jsonZodError, mapPrismaErrorToResponse } from "@/lib/api-response";
import { validateOutputInDev } from "@/lib/validate-output";
import { toOrderDto } from "@/lib/mappers";

export const dynamic = "force-dynamic";

type RouteParams = { params: Promise<{ userId: string; orderId: string }> };

export async function GET(_request: Request, { params }: RouteParams) {
  const { userId, orderId } = await params;
  const order = await prisma.order.findFirst({
    where: { id: orderId, userId },
    include: { items: true },
  });
  if (!order) {
    return jsonError("Order not found", 404);
  }
  const data = toOrderDto(order);
  validateOutputInDev({ schema: orderSchema, data });
  return jsonSuccess(data);
}

export async function PATCH(request: Request, { params }: RouteParams) {
  const { userId, orderId } = await params;
  const parsedBody = updateOrderStatusSchema.safeParse(await request.json());
  if (!parsedBody.success) {
    return jsonZodError(parsedBody.error);
  }

  try {
    const existingOrder = await prisma.order.findFirst({ where: { id: orderId, userId } });
    if (!existingOrder) {
      return jsonError("Order not found", 404);
    }

    const order = await prisma.order.update({
      where: { id: orderId },
      data: { status: parsedBody.data.status },
      include: { items: true },
    });
    const data = toOrderDto(order);
    validateOutputInDev({ schema: orderSchema, data });
    return jsonSuccess(data);
  } catch (error) {
    return mapPrismaErrorToResponse(error);
  }
}
