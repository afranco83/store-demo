import { updateOrderStatusSchema, orderSchema } from "@store-demo/shared-types";
import { prisma } from "@/lib/prisma";
import { jsonError, jsonSuccess, jsonZodError } from "@/lib/api-response";
import { validateOutputInDev } from "@/lib/validate-output";
import { toOrderDto } from "@/lib/mappers";
import { handleCartRouteError, requireUser } from "@/lib/guard";

export const dynamic = "force-dynamic";

type RouteParams = { params: Promise<{ orderId: string }> };

// customer solo ve/edita sus propios pedidos; admin (Fase 7) no está
// acotado por userId — el rol ya viaja en el token verificado.
function scopeByOwnership({ userId, role }: { userId: string; role: string }) {
  return role === "admin" ? {} : { userId };
}

export async function GET(request: Request, { params }: RouteParams) {
  const { orderId } = await params;
  try {
    const { userId, role } = await requireUser(request);
    const order = await prisma.order.findFirst({
      where: { id: orderId, ...scopeByOwnership({ userId, role }) },
      include: { items: true },
    });
    if (!order) {
      return jsonError("Order not found", 404);
    }
    const data = toOrderDto(order);
    validateOutputInDev({ schema: orderSchema, data });
    return jsonSuccess(data);
  } catch (error) {
    return handleCartRouteError(error);
  }
}

export async function PATCH(request: Request, { params }: RouteParams) {
  const { orderId } = await params;
  const parsedBody = updateOrderStatusSchema.safeParse(await request.json());
  if (!parsedBody.success) {
    return jsonZodError(parsedBody.error);
  }

  try {
    const { userId, role } = await requireUser(request);
    const existingOrder = await prisma.order.findFirst({
      where: { id: orderId, ...scopeByOwnership({ userId, role }) },
    });
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
    return handleCartRouteError(error);
  }
}
