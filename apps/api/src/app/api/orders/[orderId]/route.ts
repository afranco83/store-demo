import { updateOrderStatusSchema, orderSchema } from "@store-demo/shared-types";
import { prisma } from "@/lib/prisma";
import { jsonError, jsonSuccess, jsonZodError } from "@/lib/api-response";
import { validateOutputInDev } from "@/lib/validate-output";
import { toOrderDto } from "@/lib/mappers";
import {
  handleAuthenticatedRouteError,
  requireAdmin,
  requireUser,
  scopeByOwnership,
} from "@/lib/guard";

export const dynamic = "force-dynamic";

type RouteParams = { params: Promise<{ orderId: string }> };

export async function GET(request: Request, { params }: RouteParams) {
  const { orderId } = await params;
  try {
    const { userId, role } = await requireUser(request);
    const order = await prisma.order.findFirst({
      where: { id: orderId, ...scopeByOwnership({ userId, role }) },
      include: { items: true, user: { select: { email: true } } },
    });
    if (!order) {
      return jsonError("Order not found", 404);
    }
    const data = toOrderDto(order);
    validateOutputInDev({ schema: orderSchema, data });
    return jsonSuccess(data);
  } catch (error) {
    return handleAuthenticatedRouteError(error);
  }
}

export async function PATCH(request: Request, { params }: RouteParams) {
  const { orderId } = await params;
  const parsedBody = updateOrderStatusSchema.safeParse(await request.json());
  if (!parsedBody.success) {
    return jsonZodError(parsedBody.error);
  }

  try {
    // Solo admin puede cambiar el estado de un pedido (Fase 7) — a
    // diferencia de GET, aquí no basta con que el pedido sea del propio
    // caller: cambiar el estado de fulfillment es una acción exclusiva de
    // administración, nunca self-service del customer.
    await requireAdmin(request);
    const existingOrder = await prisma.order.findFirst({ where: { id: orderId } });
    if (!existingOrder) {
      return jsonError("Order not found", 404);
    }

    const order = await prisma.order.update({
      where: { id: orderId },
      data: { status: parsedBody.data.status },
      include: { items: true, user: { select: { email: true } } },
    });
    const data = toOrderDto(order);
    validateOutputInDev({ schema: orderSchema, data });
    return jsonSuccess(data);
  } catch (error) {
    return handleAuthenticatedRouteError(error);
  }
}
