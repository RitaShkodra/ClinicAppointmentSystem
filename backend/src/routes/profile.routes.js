import express from "express";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import {
  getMe,
  updateMe,
  changeMyPassword,
  updateMyDoctorProfile,
} from "../controllers/profile.controller.js";

const router = express.Router();

router.get("/me", authMiddleware, getMe);
router.put("/me", authMiddleware, updateMe);
router.put("/me/password", authMiddleware, changeMyPassword);

// Doctor-only fields (phone, specialization, availability)
router.put("/me/doctor", authMiddleware, updateMyDoctorProfile);

export default router;