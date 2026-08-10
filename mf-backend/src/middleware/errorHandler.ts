import type { NextFunction, Request, Response } from "express";
import { AppError } from "../utils/AppError.js";

export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction) {
  if (err instanceof AppError) {
    res.status(err.statusCode).json({ success: false, message: err.message });
    return;
  }

  // Unexpected error — log full detail server-side, never leak internals to the client.
  console.error("Unhandled error:", err);
  res.status(500).json({ success: false, message: "Internal server error" });
}

export function notFoundHandler(req: Request, res: Response) {
  res.status(404).json({ success: false, message: `Route not found: ${req.method} ${req.path}` });
}
