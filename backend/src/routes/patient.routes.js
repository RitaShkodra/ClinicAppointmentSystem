import express from "express";
import {
  create,
  getAll,
  update,
  remove,
} from "../controllers/patient.controller.js";

import { authMiddleware } from "../middlewares/auth.middleware.js";
import { authorizeRoles } from "../middlewares/role.middleware.js";

const router = express.Router();

/* CREATE PATIENT
ADMIN + RECEPTIONIST
*/
router.post(
  "/",
  authMiddleware,
  authorizeRoles("ADMIN", "RECEPTIONIST"),
  create
);

/* GET PATIENTS
EVERY ROLE CAN VIEW
*/
router.get(
  "/",
  authMiddleware,
  authorizeRoles("ADMIN", "RECEPTIONIST", "DOCTOR", "PATIENT"),
  getAll
);

/* UPDATE
ADMIN + RECEPTIONIST
*/
router.put(
  "/:id",
  authMiddleware,
  authorizeRoles("ADMIN", "RECEPTIONIST"),
  update
);

/* DELETE
ADMIN ONLY
*/
router.delete(
  "/:id",
  authMiddleware,
  authorizeRoles("ADMIN"),
  remove
);

export default router;