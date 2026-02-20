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
  CREATE → STAFF + ADMIN
*/
router.post(
  "/",
  authMiddleware,
  authorizeRoles("ADMIN", "STAFF"),
  create
);

/*
  GET ALL → STAFF + ADMIN
*/
router.get(
  "/",
  authMiddleware,
  authorizeRoles("ADMIN", "STAFF"),
  getAll
);

/*
  UPDATE STATUS → STAFF + ADMIN
*/
router.patch(
  "/:id/status",
  authMiddleware,
  authorizeRoles("ADMIN", "STAFF"),
  updateStatus
);

/*
  DELETE → ADMIN ONLY
*/
router.delete(
  "/:id",
  authMiddleware,
  authorizeRoles("ADMIN"),
  remove
);
router.put(
  "/:id",
  authMiddleware,
  authorizeRoles("ADMIN", "STAFF"),
  update
);

export default router;
