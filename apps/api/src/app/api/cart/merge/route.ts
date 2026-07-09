import { z } from "zod";
import { GUEST_ID_HEADER, cartItemWithProductSchema } from "@store-demo/shared-types";
import { prisma } from "@/lib/prisma";
import { jsonError, jsonSuccess } from "@/lib/api-response";
import { validateOutputInDev } from "@/lib/validate-output";
import { toCartItemWithProductDto } from "@/lib/mappers";
import { handleCartRouteError, requireUser } from "@/lib/guard";

export const dynamic = "force-dynamic";

// Fusiona el carrito de invitado (guestId) dentro del carrito del usuario que
// acaba de iniciar sesión: se llama desde el callback signIn de Auth.js
// (login y registro), nunca directamente desde el navegador. Si el mismo
// producto está en ambos carritos, las cantidades se suman.
export async function POST(request: Request) {
  try {
    const { userId } = await requireUser(request);
    const guestId = request.headers.get(GUEST_ID_HEADER);
    if (!guestId) {
      return jsonError(`Missing ${GUEST_ID_HEADER} header`, 400);
    }

    await prisma.$transaction(async (tx) => {
      const guestItems = await tx.cartItem.findMany({ where: { guestId } });
      if (guestItems.length === 0) {
        return;
      }

      // Una sola query para los items ya existentes del usuario en vez de un
      // findUnique por item dentro del bucle (evita 2N round-trips
      // secuenciales reteniendo el lock de escritura de SQLite).
      const existingUserItems = await tx.cartItem.findMany({
        where: { userId, productId: { in: guestItems.map((item) => item.productId) } },
      });
      const existingQuantityByProductId = new Map(
        existingUserItems.map((item) => [item.productId, item.quantity]),
      );

      await Promise.all(
        guestItems.map((guestItem) =>
          tx.cartItem.upsert({
            where: { userId_productId: { userId, productId: guestItem.productId } },
            create: { userId, productId: guestItem.productId, quantity: guestItem.quantity },
            update: {
              quantity:
                (existingQuantityByProductId.get(guestItem.productId) ?? 0) + guestItem.quantity,
            },
          }),
        ),
      );

      await tx.cartItem.deleteMany({ where: { guestId } });
    });

    const mergedCartItems = await prisma.cartItem.findMany({
      where: { userId },
      include: { product: true },
      orderBy: { createdAt: "asc" },
    });
    const data = mergedCartItems.map(toCartItemWithProductDto);
    validateOutputInDev({ schema: z.array(cartItemWithProductSchema), data });
    return jsonSuccess(data);
  } catch (error) {
    return handleCartRouteError(error);
  }
}
