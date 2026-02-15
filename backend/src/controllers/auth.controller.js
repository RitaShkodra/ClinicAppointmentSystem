import { registerUser, loginUser } from "../services/auth.service.js";
import prisma from "../prisma.js";
import jwt from "jsonwebtoken";
import { config } from "../config.js";


export const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        message: "Name, email and password are required",
      });
    }

    const user = await registerUser({ name, email, password });

    return res.status(201).json({
      message: "User registered successfully",
      user,
    });
  } catch (error) {
    return res.status(400).json({
      message: error.message || "Registration failed",
    });
  }
};



export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required",
      });
    }

    const result = await loginUser({ email, password });

    return res.status(200).json({
      message: "Login successful",
      ...result,
    });
  } catch (error) {
    return res.status(401).json({
      message: error.message || "Login failed",
    });
  }
};



export const refresh = async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({
        message: "Refresh token required",
      });
    }

    const storedToken = await prisma.refreshToken.findUnique({
      where: { token: refreshToken },
    });

    if (!storedToken) {
      return res.status(403).json({
        message: "Invalid refresh token",
      });
    }

  
    jwt.verify(refreshToken, config.jwtRefreshSecret);

 
    const newAccessToken = jwt.sign(
      {
        userId: storedToken.userId,
      },
      config.jwtSecret,
      { expiresIn: "15m" }
    );

    return res.status(200).json({
      accessToken: newAccessToken,
    });

  } catch (error) {
    return res.status(403).json({
      message: "Invalid or expired refresh token",
    });
  }
};



export const logout = async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({
        message: "Refresh token required",
      });
    }

    await prisma.refreshToken.deleteMany({
      where: { token: refreshToken },
    });

    return res.status(200).json({
      message: "Logged out successfully",
    });

  } catch (error) {
    return res.status(400).json({
      message: error.message || "Logout failed",
    });
  }
};
