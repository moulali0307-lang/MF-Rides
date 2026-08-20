import {
  Prisma,
  type PrismaClient,
  type User,
  Role,
  AdminOtpPurpose,
} from "../../../generated/prisma/client.js";

import { AppError } from "../../utils/AppError.js";
import { signToken } from "../../utils/jwt.js";
import {
  hashPassword,
  verifyPassword,
} from "../../utils/password.js";

import { sendOtpEmail } from "../../utils/email.js";

import type {
  AdminForgotPasswordInput,
  AdminLoginInput,
  AdminRegisterInput,
  AdminResetPasswordInput,
  AdminVerifyOtpInput,
  LoginInput,
  RegisterInput,
} from "./auth.schema.js";

// ============================================================
// PUBLIC USER
// ============================================================

export type PublicUser = Omit<User, "passwordHash">;

function toPublicUser(user: User): PublicUser {
  const {
    passwordHash: _passwordHash,
    ...publicUser
  } = user;

  return publicUser;
}

// ============================================================
// OTP HELPERS
// ============================================================

function generateOtp(): string {
  return Math.floor(
    100000 + Math.random() * 900000,
  ).toString();
}

function hashOtp(otp: string): string {
  return otp;
}

function getOtpExpiry(): Date {
  return new Date(
    Date.now() + 10 * 60 * 1000,
  );
}

// ============================================================
// AUTH SERVICE
// ============================================================

export function createAuthService(
  prisma: PrismaClient,
) {
  return {

    // ========================================================
    // PUBLIC RIDER / PARTNER REGISTER
    // ========================================================

    async register(
      input: RegisterInput,
    ): Promise<{
      user: PublicUser;
      token: string;
    }> {

      const existing =
        await prisma.user.findFirst({
          where: {
            OR: [
              {
                phoneNumber:
                  input.phoneNumber,
              },
              ...(input.email
                ? [
                    {
                      email:
                        input.email,
                    },
                  ]
                : []),
            ],
          },
        });

      if (existing) {
        throw new AppError(
          "A user with this phone number or email already exists",
          409,
        );
      }

      const passwordHash =
        await hashPassword(
          input.password,
        );

      let user: User;

      try {
        user =
          await prisma.user.create({
            data: {
              fullName:
                input.fullName,

              phoneNumber:
                input.phoneNumber,

              email:
                input.email,

              passwordHash,

              role:
                input.role,
            },
          });
      } catch (err) {
        if (
          err instanceof
            Prisma.PrismaClientKnownRequestError &&
          err.code === "P2002"
        ) {
          throw new AppError(
            "A user with this phone number or email already exists",
            409,
          );
        }

        throw err;
      }

      const token =
        signToken({
          sub: user.id,
          role: user.role,
        });

      return {
        user:
          toPublicUser(user),

        token,
      };
    },

    // ========================================================
    // PUBLIC RIDER / PARTNER LOGIN
    // ========================================================

    async login(
      input: LoginInput,
    ): Promise<{
      user: PublicUser;
      token: string;
    }> {

      const user =
        await prisma.user.findUnique({
          where: {
            phoneNumber:
              input.phoneNumber,
          },
        });

      if (!user) {
        throw new AppError(
          "Invalid phone number or password",
          401,
        );
      }

      const passwordMatches =
        await verifyPassword(
          input.password,
          user.passwordHash,
        );

      if (!passwordMatches) {
        throw new AppError(
          "Invalid phone number or password",
          401,
        );
      }

      const token =
        signToken({
          sub: user.id,
          role: user.role,
        });

      return {
        user:
          toPublicUser(user),

        token,
      };
    },

    // ========================================================
    // CURRENT USER
    // ========================================================

    async me(
      userId: string,
    ): Promise<PublicUser> {

      const user =
        await prisma.user.findUnique({
          where: {
            id: userId,
          },
        });

      if (!user) {
        throw new AppError(
          "User not found",
          404,
        );
      }

      return toPublicUser(user);
    },

    // ========================================================
    // ADMIN CREATE ACCOUNT
    // ========================================================
    //
    // IMPORTANT:
    // Admin registration does NOT send an OTP.
    //
    // OTP is used only once during ADMIN LOGIN.
    //
    // ========================================================

    async adminRegister(
      input: AdminRegisterInput,
    ) {

      const email =
        input.email
          .trim()
          .toLowerCase();

      const existing =
        await prisma.user.findFirst({
          where: {
            OR: [
              {
                email,
              },
              {
                phoneNumber:
                  input.phoneNumber,
              },
            ],
          },
        });

      if (existing) {
        throw new AppError(
          "An account with this email or phone number already exists",
          409,
        );
      }

      const passwordHash =
        await hashPassword(
          input.password,
        );

      let user: User;

      try {
        user =
          await prisma.user.create({
            data: {
              fullName:
                input.fullName,

              email,

              phoneNumber:
                input.phoneNumber,

              passwordHash,

              role:
                Role.ADMIN,
            },
          });
      } catch (err) {

        if (
          err instanceof
            Prisma.PrismaClientKnownRequestError &&
          err.code === "P2002"
        ) {
          throw new AppError(
            "An account with this email or phone number already exists",
            409,
          );
        }

        throw err;
      }

      return {
        user:
          toPublicUser(user),

        message:
          "Admin account created successfully. Please login.",
      };
    },

    // ========================================================
    // ADMIN REGISTRATION OTP
    // ========================================================
    //
    // Registration OTP is no longer required.
    //
    // Kept only so the existing controller/router does not
    // break if this endpoint is still called.
    //
    // ========================================================

    async verifyAdminRegistrationOtp(
      _input: AdminVerifyOtpInput,
    ) {
      throw new AppError(
        "Admin registration does not require OTP. Please login with your email and password.",
        400,
      );
    },

    // ========================================================
    // ADMIN LOGIN
    // ========================================================
    //
    // ONE OTP ONLY.
    //
    // Email + Password
    //       ↓
    // ONE EMAIL OTP
    //       ↓
    // Verify OTP
    //       ↓
    // Dashboard
    //
    // ========================================================

    async adminLogin(
      input: AdminLoginInput,
    ) {

      const email =
        input.email
          .trim()
          .toLowerCase();

      const user =
        await prisma.user.findUnique({
          where: {
            email,
          },
        });

      if (
        !user ||
        user.role !== Role.ADMIN
      ) {
        throw new AppError(
          "Invalid admin email or password",
          401,
        );
      }

      const passwordMatches =
        await verifyPassword(
          input.password,
          user.passwordHash,
        );

      if (!passwordMatches) {
        throw new AppError(
          "Invalid admin email or password",
          401,
        );
      }

      // Remove previous unused ADMIN LOGIN OTPs.
      // This guarantees only ONE active OTP exists.

      await prisma.adminOtp.deleteMany({
        where: {
          userId:
            user.id,

          purpose:
            AdminOtpPurpose.LOGIN,

          usedAt:
            null,
        },
      });

      // Generate ONE OTP

      const code =
        generateOtp();

      const expiresAt =
        getOtpExpiry();

      // Save ONE OTP

      const otp =
        await prisma.adminOtp.create({
          data: {
            userId:
              user.id,

            purpose:
              AdminOtpPurpose.LOGIN,

            codeHash:
              hashOtp(code),

            expiresAt,
          },
        });

      console.log(
        "ADMIN LOGIN OTP CREATED:",
        otp.id,
      );

      // Send ONE email

      sendOtpEmail(
        email,
        code,
        "LOGIN",
      );

      console.log(
        "ONE ADMIN LOGIN OTP SENT TO:",
        email,
      );

      return {
        user:
          toPublicUser(user),

        requiresOtp: true,

        message:
          "One-time login OTP sent to your email.",
      };
    },

    // ========================================================
    // VERIFY ADMIN LOGIN OTP
    // ========================================================

    async verifyAdminLoginOtp(
      input: AdminVerifyOtpInput,
    ) {

      const email =
        input.email
          .trim()
          .toLowerCase();

      const code =
        input.code.trim();

      const user =
        await prisma.user.findUnique({
          where: {
            email,
          },
        });

      if (
        !user ||
        user.role !== Role.ADMIN
      ) {
        throw new AppError(
          "Admin account not found",
          404,
        );
      }

      // Find the latest ONE unused login OTP

      const otp =
        await prisma.adminOtp.findFirst({
          where: {
            userId:
              user.id,

            purpose:
              AdminOtpPurpose.LOGIN,

            usedAt:
              null,
          },

          orderBy: {
            createdAt:
              "desc",
          },
        });

      console.log(
        "ADMIN LOGIN OTP RECORD:",
        otp
          ? otp.id
          : "NOT FOUND",
      );

      if (!otp) {
        throw new AppError(
          "OTP not found. Please login again.",
          400,
        );
      }

      // Check expiry

      if (
        otp.expiresAt.getTime() <
        Date.now()
      ) {
        throw new AppError(
          "OTP has expired. Please login again.",
          400,
        );
      }

      // Maximum attempts

      if (otp.attempts >= 5) {
        throw new AppError(
          "Too many incorrect OTP attempts. Please login again.",
          429,
        );
      }

      // Check OTP

      const otpMatches =
        hashOtp(code) ===
        otp.codeHash;

      console.log(
        "ADMIN LOGIN OTP MATCH:",
        otpMatches,
      );

      if (!otpMatches) {

        await prisma.adminOtp.update({
          where: {
            id:
              otp.id,
          },

          data: {
            attempts: {
              increment: 1,
            },
          },
        });

        throw new AppError(
          "Invalid OTP",
          400,
        );
      }

      // Mark OTP as used

      await prisma.adminOtp.update({
        where: {
          id:
            otp.id,
        },

        data: {
          usedAt:
            new Date(),
        },
      });

      // Generate final admin login token

      const token =
        signToken({
          sub:
            user.id,

          role:
            user.role,
        });

      console.log(
        "ADMIN LOGIN SUCCESS - OTP VERIFIED",
      );

      return {
        user:
          toPublicUser(user),

        token,

        message:
          "Admin login successful.",
      };
    },

    // ========================================================
    // ADMIN FORGOT PASSWORD
    // ========================================================

    async adminForgotPassword(
      input: AdminForgotPasswordInput,
    ) {

      const email =
        input.email
          .trim()
          .toLowerCase();

      const user =
        await prisma.user.findUnique({
          where: {
            email,
          },
        });

      if (
        !user ||
        user.role !== Role.ADMIN
      ) {
        throw new AppError(
          "Admin account not found",
          404,
        );
      }

      // Remove previous password-reset OTPs

      await prisma.adminOtp.deleteMany({
        where: {
          userId:
            user.id,

          purpose:
            AdminOtpPurpose.PASSWORD_RESET,

          usedAt:
            null,
        },
      });

      // Generate password reset OTP

      const code =
        generateOtp();

      const expiresAt =
        getOtpExpiry();

      await prisma.adminOtp.create({
        data: {
          userId:
            user.id,

          purpose:
            AdminOtpPurpose.PASSWORD_RESET,

          codeHash:
            hashOtp(code),

          expiresAt,
        },
      });

      await sendOtpEmail(
        email,
        code,
        "PASSWORD_RESET",
      );

      return {
        message:
          "Password reset OTP sent to your email.",
      };
    },

    // ========================================================
    // ADMIN RESET PASSWORD
    // ========================================================

    async adminResetPassword(
      input: AdminResetPasswordInput,
    ) {

      const email =
        input.email
          .trim()
          .toLowerCase();

      const code =
        input.code.trim();

      const user =
        await prisma.user.findUnique({
          where: {
            email,
          },
        });

      if (
        !user ||
        user.role !== Role.ADMIN
      ) {
        throw new AppError(
          "Admin account not found",
          404,
        );
      }

      const otp =
        await prisma.adminOtp.findFirst({
          where: {
            userId:
              user.id,

            purpose:
              AdminOtpPurpose.PASSWORD_RESET,

            usedAt:
              null,
          },

          orderBy: {
            createdAt:
              "desc",
          },
        });

      if (!otp) {
        throw new AppError(
          "OTP not found. Please request a new OTP.",
          400,
        );
      }

      if (
        otp.expiresAt.getTime() <
        Date.now()
      ) {
        throw new AppError(
          "OTP has expired. Please request a new OTP.",
          400,
        );
      }

      if (
        otp.attempts >= 5
      ) {
        throw new AppError(
          "Too many incorrect OTP attempts. Please request a new OTP.",
          429,
        );
      }

      const otpMatches =
        hashOtp(code) ===
        otp.codeHash;

      if (!otpMatches) {

        await prisma.adminOtp.update({
          where: {
            id:
              otp.id,
          },

          data: {
            attempts: {
              increment: 1,
            },
          },
        });

        throw new AppError(
          "Invalid OTP",
          400,
        );
      }

      const passwordHash =
        await hashPassword(
          input.password,
        );

      await prisma.$transaction([
        prisma.user.update({
          where: {
            id:
              user.id,
          },

          data: {
            passwordHash,
          },
        }),

        prisma.adminOtp.update({
          where: {
            id:
              otp.id,
          },

          data: {
            usedAt:
              new Date(),
          },
        }),
      ]);

      return {
        message:
          "Admin password reset successfully.",
      };
    },
  };
}

// ============================================================
// AUTH SERVICE TYPE
// ============================================================

export type AuthService =
  ReturnType<typeof createAuthService>;