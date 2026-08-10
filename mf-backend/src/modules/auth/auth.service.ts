import { Prisma, type PrismaClient, type User } from "../../../generated/prisma/client.js";
import { AppError } from "../../utils/AppError.js";
import { signToken } from "../../utils/jwt.js";
import { hashPassword, verifyPassword } from "../../utils/password.js";
import type { LoginInput, RegisterInput } from "./auth.schema.js";

export type PublicUser = Omit<User, "passwordHash">;

function toPublicUser(user: User): PublicUser {
  const { passwordHash: _passwordHash, ...publicUser } = user;
  return publicUser;
}

export function createAuthService(prisma: PrismaClient) {
  return {
    async register(input: RegisterInput): Promise<{ user: PublicUser; token: string }> {
      const existing = await prisma.user.findFirst({
        where: {
          OR: [{ phoneNumber: input.phoneNumber }, ...(input.email ? [{ email: input.email }] : [])],
        },
      });

      if (existing) {
        throw new AppError("A user with this phone number or email already exists", 409);
      }

      const passwordHash = await hashPassword(input.password);

      let user: User;
      try {
        user = await prisma.user.create({
          data: {
            fullName: input.fullName,
            phoneNumber: input.phoneNumber,
            email: input.email,
            passwordHash,
            role: input.role,
          },
        });
      } catch (err) {
        // Race-condition safety net: unique constraint violation caught at the DB level
        // even if the pre-check above passed (e.g. concurrent registration).
        if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") {
          throw new AppError("A user with this phone number or email already exists", 409);
        }
        throw err;
      }

      const token = signToken({ sub: user.id, role: user.role });
      return { user: toPublicUser(user), token };
    },

    async login(input: LoginInput): Promise<{ user: PublicUser; token: string }> {
      const user = await prisma.user.findUnique({ where: { phoneNumber: input.phoneNumber } });

      // Deliberately identical error for "no such user" and "wrong password" —
      // never reveal which part of the credential pair was incorrect.
      if (!user) {
        throw new AppError("Invalid phone number or password", 401);
      }

      const passwordMatches = await verifyPassword(input.password, user.passwordHash);
      if (!passwordMatches) {
        throw new AppError("Invalid phone number or password", 401);
      }

      const token = signToken({ sub: user.id, role: user.role });
      return { user: toPublicUser(user), token };
    },

    async me(userId: string): Promise<PublicUser> {
      const user = await prisma.user.findUnique({ where: { id: userId } });
      if (!user) {
        throw new AppError("User not found", 404);
      }
      return toPublicUser(user);
    },
  };
}

export type AuthService = ReturnType<typeof createAuthService>;
