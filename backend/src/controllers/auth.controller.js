import jwt from "jsonwebtoken";
import prisma from "../prisma.js";
import bcrypt from "bcryptjs";
import { config } from "../config.js";

/* =========================
   REGISTER
========================= */
export const register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    if (!email || !password || !name) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const existing = await prisma.user.findUnique({
      where: { email },
    });

    if (existing) {
      return res.status(400).json({ message: "Email already in use" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: role || "RECEPTIONIST",
      },
    });

    return res.status(201).json({
      message: "User registered successfully",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Register error:", error);
    return res.status(500).json({ message: "Server error during register" });
  }
};

/* =========================
   LOGIN
========================= */
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user || user.deletedAt) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const accessToken = jwt.sign(
      {
        id: user.id,
        role: user.role,
        email: user.email,
        doctorId: user.doctorId,
        patientId: user.patientId,
      },
      config.jwtSecret,
      { expiresIn: "1h" }
    );

    const refreshToken = jwt.sign(
      { userId: user.id },
      config.jwtRefreshSecret,
      { expiresIn: "7d" }
    );

    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    await prisma.refreshToken.deleteMany({ where: { userId: user.id } });
    await prisma.refreshToken.create({
      data: { token: refreshToken, userId: user.id, expiresAt },
    });

    return res.json({
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        forcePasswordChange: user.forcePasswordChange,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({ message: "Server error during login" });
  }
};

/* =========================
   REFRESH TOKEN
   Client sends refreshToken in body; we verify it, optionally rotate it, return new accessToken (and new refreshToken).
========================= */
export const refresh = async (req, res) => {
  try {
    const { refreshToken: tokenFromBody } = req.body;
    if (!tokenFromBody) {
      return res.status(401).json({ message: "Refresh token required" });
    }

    let decoded;
    try {
      decoded = jwt.verify(tokenFromBody, config.jwtRefreshSecret);
    } catch {
      return res.status(401).json({ message: "Invalid or expired refresh token" });
    }

    const userId = decoded.userId;
    const stored = await prisma.refreshToken.findFirst({
      where: { token: tokenFromBody, userId },
    });
    if (!stored || stored.expiresAt < new Date()) {
      if (stored) await prisma.refreshToken.delete({ where: { id: stored.id } }).catch(() => {});
      return res.status(401).json({ message: "Invalid or expired refresh token" });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });
    if (!user || user.deletedAt) {
      await prisma.refreshToken.delete({ where: { id: stored.id } }).catch(() => {});
      return res.status(401).json({ message: "User not found" });
    }

    const newAccessToken = jwt.sign(
      {
        id: user.id,
        role: user.role,
        email: user.email,
        doctorId: user.doctorId,
        patientId: user.patientId,
      },
      config.jwtSecret,
      { expiresIn: "1h" }
    );

    const newRefreshToken = jwt.sign(
      { userId: user.id },
      config.jwtRefreshSecret,
      { expiresIn: "7d" }
    );
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    await prisma.refreshToken.delete({ where: { id: stored.id } });
    await prisma.refreshToken.create({
      data: { token: newRefreshToken, userId: user.id, expiresAt },
    });

    return res.json({
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    });
  } catch (error) {
    console.error("Refresh error:", error);
    return res.status(500).json({ message: "Refresh failed" });
  }
};

/* =========================
   LOGOUT
   Client can send refreshToken in body to invalidate it server-side.
========================= */
export const logout = async (req, res) => {
  try {
    const { refreshToken: tokenFromBody } = req.body;
    if (tokenFromBody) {
      await prisma.refreshToken.deleteMany({ where: { token: tokenFromBody } });
    }
    return res.json({ message: "Logged out successfully" });
  } catch (error) {
    return res.json({ message: "Logged out successfully" });
  }
};
