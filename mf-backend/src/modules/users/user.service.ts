import type { PrismaClient, User } from "../../../generated/prisma/client.js";
import { AppError } from "../../utils/AppError.js";

export type PublicUser = Omit<User, "passwordHash">;

function toPublicUser(user: User): PublicUser {
  const { passwordHash: _passwordHash, ...publicUser } = user;
  return publicUser;
}

export function createUserService(prisma: PrismaClient) {
  return {
    async setOnlineStatus(userId: string, isOnline: boolean): Promise<PublicUser> {
      const user = await prisma.user.findUnique({ where: { id: userId } });
      if (!user) {
        throw new AppError("User not found", 404);
      }

      const updated = await prisma.user.update({
        where: { id: userId },
        data: { isOnline },
      });

      return toPublicUser(updated);
    },
  };
}

export type UserService = ReturnType<typeof createUserService>;
