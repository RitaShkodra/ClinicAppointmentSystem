import express from "express";
import {
  create,
  getAll,
  getOne,
  update,
  remove,
} from "../controllers/doctor.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { authorizeRoles } from "../middlewares/role.middleware.js";

const router = express.Router();

// Only ADMIN can create or delete doctors
router.post("/", authMiddleware, authorizeRoles("ADMIN"), create);
router.delete("/:id", authMiddleware, authorizeRoles("ADMIN"), remove);

// ADMIN and STAFF can view and update doctors
router.get("/", authMiddleware, authorizeRoles("ADMIN", "STAFF"), getAll);
router.get("/:id", authMiddleware, authorizeRoles("ADMIN", "STAFF"), getOne);
router.put("/:id", authMiddleware, authorizeRoles("ADMIN", "STAFF"), update);

export default router;
