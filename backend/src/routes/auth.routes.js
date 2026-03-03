import { Router } from "express";
import {
  login,
  logout,
  refresh,
  register,
} from "../controllers/auth.controller.js";

const router = Router();

router.post("/register", register);
router.post("/login", login);
router.post("/refresh", refresh);
router.post("/logout", logout);

export default router;
import { authMiddleware } from "../middlewares/auth.middleware.js";

router.get("/me", authMiddleware, (req, res) => {
  res.json({
    message: "Protected route accessed",
    user: req.user,
  });
});
