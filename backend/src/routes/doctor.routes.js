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

/* CREATE DOCTOR
ADMIN ONLY
*/
router.post(
  "/",
  authMiddleware,
  authorizeRoles("ADMIN"),
  create
);

/* GET ALL DOCTORS
EVERY ROLE CAN VIEW DOCTORS
*/
router.get(
  "/",
  authMiddleware,
  authorizeRoles("ADMIN", "RECEPTIONIST", "DOCTOR", "PATIENT"),
  getAll
);

/* GET ONE DOCTOR
EVERY ROLE CAN VIEW
*/
router.get(
  "/:id",
  authMiddleware,
  authorizeRoles("ADMIN", "RECEPTIONIST", "DOCTOR", "PATIENT"),
  getOne
);

/* UPDATE DOCTOR
ADMIN + RECEPTIONIST
*/
router.put(
  "/:id",
  authMiddleware,
  authorizeRoles("ADMIN", "RECEPTIONIST"),
  update
);

/* DELETE DOCTOR
ADMIN ONLY
*/
router.delete(
  "/:id",
  authMiddleware,
  authorizeRoles("ADMIN"),
  remove
);

export default router;