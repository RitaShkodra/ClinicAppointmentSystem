import jwt from "jsonwebtoken";
import prisma from "../prisma.js";
import bcrypt from "bcryptjs";

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

    console.log("LOGIN ATTEMPT:", email, password);

    const user = await prisma.user.findUnique({
      where: { email },
    });

    console.log("USER FOUND:", user);

    if (!user || user.deletedAt) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    console.log("HASH IN DB:", user.password);

    const isMatch = await bcrypt.compare(password, user.password);

    console.log("PASSWORD MATCH:", isMatch);

    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const accessToken = jwt.sign(
{
  id: user.id,
  role: user.role,
  email: user.email,
  doctorId: user.doctorId,
  patientId: user.patientId
},
process.env.JWT_SECRET,
{ expiresIn: "1h" }
);

    return res.json({
      accessToken,
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
   REFRESH TOKEN (simple version)
========================= */
export const refresh = async (req, res) => {
  try {
    const { user } = req;

    const newAccessToken = jwt.sign(
      {
        id: user.id,
        role: user.role,
        email: user.email,
      },
      process.env.JWT_SECRET,
      { expiresIn: "1h" },
    );

    return res.json({ accessToken: newAccessToken });
  } catch (error) {
    return res.status(500).json({ message: "Refresh failed" });
  }
};

/* =========================
   LOGOUT
========================= */
export const logout = async (req, res) => {
  return res.json({ message: "Logged out successfully" });
};
