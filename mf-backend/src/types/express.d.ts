import type { UserRole } from "../utils/jwt.js";

declare global {
  namespace Express {
    interface Request {
      auth?: {
        userId: string;
        role: UserRole;
      };
    }
  }
}

export {};
