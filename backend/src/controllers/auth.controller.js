import { registerUser } from "../services/auth.service.js";

export const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Basic validation
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
  return res.status(501).json({ message: "Login not implemented yet" });
};
