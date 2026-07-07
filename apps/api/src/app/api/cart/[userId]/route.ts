import { z } from "zod";
import { addCartItemSchema, cartItemWithProductSchema } from "@store-demo/shared-types";
import { prisma } from "@/lib/prisma";
import { jsonSuccess, jsonZodError, mapPrismaErrorToResponse } from "@/lib/api-response";
import { validateOutputInDev } from "@/lib/validate-output";
import { toCartItemWithProductDto } from "@/lib/mappers";

export const dynamic = "force-dynamic";

type RouteParams = { params: Promise<{ userId: string }> };

async function getCartItemsForUser(userId: string) {
  return prisma.cartItem.findMany({
    where: { userId },
    include: { product: true },
    orderBy: { createdAt: "asc" },
  });
}

export async function GET(_request: Request, { params }: RouteParams) {
  const { userId } = await params;
  const cartItems = await getCartItemsForUser(userId);
  const data = cartItems.map(toCartItemWithProductDto);
  validateOutputInDev({ schema: z.array(cartItemWithProductSchema), data });
  return jsonSuccess(data);
}

export async function POST(request: Request, { params }: RouteParams) {
  const { userId } = await params;
  const parsedBody = addCartItemSchema.safeParse(await request.json());
  if (!parsedBody.success) {
    return jsonZodError(parsedBody.error);
  }

  try {
    const { productId, quantity } = parsedBody.data;
    await prisma.cartItem.upsert({
      where: { userId_productId: { userId, productId } },
      create: { userId, productId, quantity },
      update: { quantity },
    });

    const cartItems = await getCartItemsForUser(userId);
    const data = cartItems.map(toCartItemWithProductDto);
    validateOutputInDev({ schema: z.array(cartItemWithProductSchema), data });
    return jsonSuccess(data, 201);
  } catch (error) {
    return mapPrismaErrorToResponse(error);
  }
}

export async function DELETE(_request: Request, { params }: RouteParams) {
  const { userId } = await params;
  try {
    await prisma.cartItem.deleteMany({ where: { userId } });
    return jsonSuccess([]);
  } catch (error) {
    return mapPrismaErrorToResponse(error);
  }
}
