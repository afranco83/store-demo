import { z } from "zod";
import {
  orderSchema,
  checkoutRequestSchema,
  calculateShippingCents,
  isSimulatedPaymentDeclined,
} from "@store-demo/shared-types";
import { prisma } from "@/lib/prisma";
import { jsonError, jsonSuccess, jsonZodError } from "@/lib/api-response";
import { validateOutputInDev } from "@/lib/validate-output";
import { toOrderDto } from "@/lib/mappers";
import { handleAuthenticatedRouteError, requireUser, scopeByOwnership } from "@/lib/guard";

export const dynamic = "force-dynamic";

class EmptyCartError extends Error {}
class SimulatedPaymentDeclinedError extends Error {}

export async function GET(request: Request) {
  try {
    const { userId, role } = await requireUser(request);
    const orders = await prisma.order.findMany({
      where: scopeByOwnership({ userId, role }),
      include: { items: true, user: { select: { email: true } } },
      orderBy: { createdAt: "desc" },
    });
    const data = orders.map(toOrderDto);
    validateOutputInDev({ schema: z.array(orderSchema), data });
    return jsonSuccess(data);
  } catch (error) {
    return handleAuthenticatedRouteError(error);
  }
}

export async function POST(request: Request) {
  const parsedBody = checkoutRequestSchema.safeParse(await request.json());
  if (!parsedBody.success) {
    return jsonZodError(parsedBody.error);
  }
  const { shippingAddress, payment } = parsedBody.data;

  try {
    const { userId } = await requireUser(request);

    const order = await prisma.$transaction(async (tx) => {
      const cartItems = await tx.cartItem.findMany({
        where: { userId },
        include: { product: true },
      });
      if (cartItems.length === 0) {
        throw new EmptyCartError();
      }

      const subtotalCents = cartItems.reduce(
        (sum, item) => sum + item.product.priceCents * item.quantity,
        0,
      );

      // El fallo simulado se decide y se lanza ANTES de cualquier escritura:
      // Prisma aborta la transacción entera, así que ni se crea el pedido ni
      // se vacía el carrito. Los datos de `payment` (número de tarjeta,
      // cvc...) solo se leen para esta comprobación, nunca se persisten.
      if (isSimulatedPaymentDeclined(payment.cardNumber)) {
        throw new SimulatedPaymentDeclinedError();
      }

      const shippingCents = calculateShippingCents(subtotalCents);

      const createdOrder = await tx.order.create({
        data: {
          userId,
          totalCents: subtotalCents + shippingCents,
          shippingFullName: shippingAddress.fullName,
          shippingAddressLine1: shippingAddress.addressLine1,
          shippingAddressLine2: shippingAddress.addressLine2 ?? null,
          shippingCity: shippingAddress.city,
          shippingPostalCode: shippingAddress.postalCode,
          shippingCountry: shippingAddress.country,
          shippingCents,
          paymentSimulatedSuccess: true,
          items: {
            create: cartItems.map((item) => ({
              productId: item.productId,
              quantity: item.quantity,
              unitPriceCents: item.product.priceCents,
            })),
          },
        },
        include: { items: true, user: { select: { email: true } } },
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
    if (error instanceof SimulatedPaymentDeclinedError) {
      return jsonError("Payment was declined. Check your card details and try again.", 402);
    }
    return handleAuthenticatedRouteError(error);
  }
}
