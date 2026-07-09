import { updateProfileRequestSchema, userSchema } from "@store-demo/shared-types";
import { prisma } from "@/lib/prisma";
import { jsonSuccess, jsonZodError } from "@/lib/api-response";
import { validateOutputInDev } from "@/lib/validate-output";
import { toUserDto } from "@/lib/mappers";
import { handleAuthenticatedRouteError, requireUser } from "@/lib/guard";

export const dynamic = "force-dynamic";

// Identidad siempre por Bearer token verificado (requireUser), nunca por un
// id en la URL — mismo criterio que cart/orders desde la Fase 5.
export async function GET(request: Request) {
  try {
    const { userId } = await requireUser(request);
    const user = await prisma.user.findUniqueOrThrow({ where: { id: userId } });
    const data = toUserDto(user);
    validateOutputInDev({ schema: userSchema, data });
    return jsonSuccess(data);
  } catch (error) {
    return handleAuthenticatedRouteError(error);
  }
}

export async function PATCH(request: Request) {
  const parsedBody = updateProfileRequestSchema.safeParse(await request.json());
  if (!parsedBody.success) {
    return jsonZodError(parsedBody.error);
  }

  try {
    const { userId } = await requireUser(request);
    const user = await prisma.user.update({
      where: { id: userId },
      data: parsedBody.data,
    });
    const data = toUserDto(user);
    validateOutputInDev({ schema: userSchema, data });
    return jsonSuccess(data);
  } catch (error) {
    return handleAuthenticatedRouteError(error);
  }
}
