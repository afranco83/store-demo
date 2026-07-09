import { z } from "zod";
import { addCartItemSchema, cartItemWithProductSchema } from "@store-demo/shared-types";
import { prisma } from "@/lib/prisma";
import { jsonError, jsonSuccess, jsonZodError, mapPrismaErrorToResponse } from "@/lib/api-response";
import { validateOutputInDev } from "@/lib/validate-output";
import { toCartItemWithProductDto } from "@/lib/mappers";
import { resolveCartIdentity, UnauthorizedError, type CartIdentity } from "@/lib/guard";

export const dynamic = "force-dynamic";

function whereForIdentity(identity: CartIdentity) {
  return identity.type === "user" ? { userId: identity.userId } : { guestId: identity.guestId };
}

async function getCartItemsForIdentity(identity: CartIdentity) {
  return prisma.cartItem.findMany({
    where: whereForIdentity(identity),
    include: { product: true },
    orderBy: { createdAt: "asc" },
  });
}

export async function GET(request: Request) {
  try {
    const identity = await resolveCartIdentity(request);
    const cartItems = await getCartItemsForIdentity(identity);
    const data = cartItems.map(toCartItemWithProductDto);
    validateOutputInDev({ schema: z.array(cartItemWithProductSchema), data });
    return jsonSuccess(data);
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      return jsonError("Unauthorized", 401);
    }
    return mapPrismaErrorToResponse(error);
  }
}

export async function POST(request: Request) {
  const parsedBody = addCartItemSchema.safeParse(await request.json());
  if (!parsedBody.success) {
    return jsonZodError(parsedBody.error);
  }

  try {
    const identity = await resolveCartIdentity(request);
    const { productId, quantity } = parsedBody.data;
    const identityWhere = whereForIdentity(identity);
    await prisma.cartItem.upsert({
      where:
        identity.type === "user"
          ? { userId_productId: { userId: identity.userId, productId } }
          : { guestId_productId: { guestId: identity.guestId, productId } },
      create: { ...identityWhere, productId, quantity },
      update: { quantity },
    });

    const cartItems = await getCartItemsForIdentity(identity);
    const data = cartItems.map(toCartItemWithProductDto);
    validateOutputInDev({ schema: z.array(cartItemWithProductSchema), data });
    return jsonSuccess(data, 201);
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      return jsonError("Unauthorized", 401);
    }
    return mapPrismaErrorToResponse(error);
  }
}

export async function DELETE(request: Request) {
  try {
    const identity = await resolveCartIdentity(request);
    await prisma.cartItem.deleteMany({ where: whereForIdentity(identity) });
    return jsonSuccess([]);
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      return jsonError("Unauthorized", 401);
    }
    return mapPrismaErrorToResponse(error);
  }
}
