import express from "express";
import {
  create,
  getAll,
  updateStatus,
  remove,
} from "../controllers/appointment.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { authorizeRoles } from "../middlewares/role.middleware.js";


const router = express.Router();

router.post("/", authMiddleware, create);
router.get("/", authMiddleware, getAll);
router.put(
  "/:id/status",
  authMiddleware,
  authorizeRoles("ADMIN"),
  updateStatus
);

router.delete("/:id", authMiddleware, remove);

export default router;
