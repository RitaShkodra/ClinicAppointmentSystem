import express from "express";
import { getStats } from "../controllers/dashboard.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { authorizeRoles } from "../middlewares/role.middleware.js";

const router = express.Router();

router.get(
  "/stats",
  authMiddleware,
  authorizeRoles("ADMIN", "RECEPTIONIST", "DOCTOR", "PATIENT"),
  getStats
);

export default router;