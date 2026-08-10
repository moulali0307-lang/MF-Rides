import { z } from "zod";

// Public self-registration is intentionally restricted to RIDER or PARTNER.
// ADMIN accounts must be created through a separate, privileged process —
// never accept "ADMIN" from an unauthenticated request body.
export const registerSchema = z.object({
  fullName: z.string().trim().min(2, "Full name must be at least 2 characters").max(100),
  phoneNumber: z
    .string()
    .trim()
    .regex(/^\+?[1-9]\d{7,14}$/, "Enter a valid phone number in international format"),
  email: z.string().trim().toLowerCase().email("Enter a valid email").optional(),
  password: z.string().min(8, "Password must be at least 8 characters").max(72),
  role: z.enum(["RIDER", "PARTNER"]).optional().default("RIDER"),
});

export const loginSchema = z.object({
  phoneNumber: z.string().trim().min(1, "Phone number is required"),
  password: z.string().min(1, "Password is required"),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
