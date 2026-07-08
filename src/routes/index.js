import rateLimit from "express-rate-limit";
import { Router } from "express";

import authRoutes from "./auth.routes.js";

const router = Router();

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100, // much tighter — 10 attempts per 15 min per IP
  standardHeaders: true,
  legacyHeaders: false,
  message: "Too many attempts, please try again later.",
});

router.use("/auth", authLimiter, authRoutes);

export default router;
