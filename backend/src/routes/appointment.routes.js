import express from "express";
import {
  create,
  getAll,
  updateStatus,
  remove,
  update,
} from "../controllers/appointment.controller.js";

import { authMiddleware } from "../middlewares/auth.middleware.js";
import { authorizeRoles } from "../middlewares/role.middleware.js";

const router = express.Router();

/*
  CREATE
  ADMIN + RECEPTIONIST + PATIENT
*/
router.post(
  "/",
  authMiddleware,
  authorizeRoles("ADMIN", "RECEPTIONIST", "PATIENT"),
  create,
);

/*
  GET ALL
  ADMIN + RECEPTIONIST
  (Doctor & Patient will have filtered endpoints later)
*/
router.get(
  "/",
  authMiddleware,
  authorizeRoles("ADMIN", "RECEPTIONIST"),
  getAll,
);

/*
  UPDATE STATUS
  ADMIN + DOCTOR
*/
router.patch(
  "/:id/status",
  authMiddleware,
  authorizeRoles("ADMIN", "DOCTOR"),
  updateStatus,
);

/*
  UPDATE FULL APPOINTMENT
  ADMIN + RECEPTIONIST
*/
router.put(
  "/:id",
  authMiddleware,
  authorizeRoles("ADMIN", "RECEPTIONIST"),
  update,
);

/*
  DELETE
  ADMIN ONLY
*/
router.delete("/:id", authMiddleware, authorizeRoles("ADMIN"), remove);

export default router;
