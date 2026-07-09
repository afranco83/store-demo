import { z } from "zod";
import { addCartItemSchema, cartItemWithProductSchema } from "@store-demo/shared-types";
import { prisma } from "@/lib/prisma";
import { jsonSuccess, jsonZodError } from "@/lib/api-response";
import { validateOutputInDev } from "@/lib/validate-output";
import { toCartItemWithProductDto } from "@/lib/mappers";
import {
  cartItemUniqueWhere,
  handleCartRouteError,
  resolveCartIdentity,
  type CartIdentity,
} from "@/lib/guard";

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
    return handleCartRouteError(error);
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
    await prisma.cartItem.upsert({
      where: cartItemUniqueWhere(identity, productId),
      create: { ...whereForIdentity(identity), productId, quantity },
      update: { quantity },
    });

    const cartItems = await getCartItemsForIdentity(identity);
    const data = cartItems.map(toCartItemWithProductDto);
    validateOutputInDev({ schema: z.array(cartItemWithProductSchema), data });
    return jsonSuccess(data, 201);
  } catch (error) {
    return handleCartRouteError(error);
  }
}

export async function DELETE(request: Request) {
  try {
    const identity = await resolveCartIdentity(request);
    await prisma.cartItem.deleteMany({ where: whereForIdentity(identity) });
    return jsonSuccess([]);
  } catch (error) {
    return handleCartRouteError(error);
  }
}
