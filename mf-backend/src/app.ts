import cors from "cors";
import express from "express";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler.js";
import { authRouter } from "./modules/auth/auth.routes.js";
import { rideRouter } from "./modules/rides/ride.routes.js";
import { userRouter } from "./modules/users/user.routes.js";

export function createApp() {
  const app = express();

  app.use(cors());
  app.use(express.json());

  app.get("/api/health", (_req, res) => {
    res.json({
      success: true,
      app: "MF Rides",
      message: "Backend is running",
    });
  });

  app.use("/api/auth", authRouter);
  app.use("/api/users", userRouter);
  app.use("/api/rides", rideRouter);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
