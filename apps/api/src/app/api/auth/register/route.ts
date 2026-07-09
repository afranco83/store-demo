import { registerRequestSchema, registerResponseSchema } from "@store-demo/shared-types";
import { prisma } from "@/lib/prisma";
import { jsonSuccess, jsonZodError, mapPrismaErrorToResponse } from "@/lib/api-response";
import { validateOutputInDev } from "@/lib/validate-output";
import { hashPassword } from "@/lib/password";
import { toUserDto } from "@/lib/mappers";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const parsedBody = registerRequestSchema.safeParse(await request.json());
  if (!parsedBody.success) {
    return jsonZodError(parsedBody.error);
  }

  try {
    const { email, password, name } = parsedBody.data;
    const passwordHash = await hashPassword(password);
    // role siempre "customer": no hay forma de auto-registrarse como admin.
    const user = await prisma.user.create({
      data: { email, passwordHash, name, role: "customer" },
    });

    const data = { user: toUserDto(user) };
    validateOutputInDev({ schema: registerResponseSchema, data });
    return jsonSuccess(data, 201);
  } catch (error) {
    return mapPrismaErrorToResponse(error);
  }
}
