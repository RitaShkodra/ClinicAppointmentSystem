import express from "express";
import { createUser, getProfile, changePassword } from "../controllers/user.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { authorizeRoles } from "../middlewares/role.middleware.js";

const router = express.Router();

router.post("/", authMiddleware, authorizeRoles("ADMIN"), createUser);
router.get("/me", authMiddleware, getProfile);
router.put("/change-password", authMiddleware, changePassword);

export default router;
