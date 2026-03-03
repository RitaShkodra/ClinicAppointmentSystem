import express from "express";
import { createUser } from "../controllers/user.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { authorizeRoles } from "../middlewares/role.middleware.js";

const router = express.Router();

router.post("/", authMiddleware, authorizeRoles("ADMIN"), createUser);

export default router;
