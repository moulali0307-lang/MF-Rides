import jwt from "jsonwebtoken";
import { env } from "../config/env.js";

export type UserRole = "RIDER" | "PARTNER" | "ADMIN";

export interface JwtPayload {
  sub: string;
  role: UserRole;
}

export function signToken(payload: JwtPayload): string {
  return jwt.sign(payload, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRES_IN,
  } as jwt.SignOptions);
}

export function verifyToken(token: string): JwtPayload {
  const decoded = jwt.verify(token, env.JWT_SECRET);
  if (typeof decoded === "string" || !("sub" in decoded) || !("role" in decoded)) {
    throw new Error("Malformed token payload");
  }
  return { sub: String(decoded.sub), role: decoded.role as UserRole };
}
