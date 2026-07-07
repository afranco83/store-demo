import { loginRequestSchema, loginResponseSchema } from "@store-demo/shared-types";
import { prisma } from "@/lib/prisma";
import { jsonError, jsonSuccess, jsonZodError, mapPrismaErrorToResponse } from "@/lib/api-response";
import { validateOutputInDev } from "@/lib/validate-output";
import { verifyPassword } from "@/lib/password";
import { signAuthToken } from "@/lib/jwt";
import { toUserDto } from "@/lib/mappers";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const parsedBody = loginRequestSchema.safeParse(await request.json());
  if (!parsedBody.success) {
    return jsonZodError(parsedBody.error);
  }

  try {
    const { email, password } = parsedBody.data;
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return jsonError("Invalid email or password", 401);
    }

    const isPasswordValid = await verifyPassword({
      plainPassword: password,
      passwordHash: user.passwordHash,
    });
    if (!isPasswordValid) {
      return jsonError("Invalid email or password", 401);
    }

    const userDto = toUserDto(user);
    const token = await signAuthToken({ userId: user.id, role: userDto.role });

    const data = { token, user: userDto };
    validateOutputInDev({ schema: loginResponseSchema, data });
    return jsonSuccess(data);
  } catch (error) {
    return mapPrismaErrorToResponse(error);
  }
}
