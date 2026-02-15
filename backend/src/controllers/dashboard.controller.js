import { getDashboardStats } from "../services/dashboard.service.js";

export const getStats = async (req, res) => {
  try {
    const stats = await getDashboardStats();
    return res.status(200).json(stats);
  } catch (error) {
    return res.status(400).json({
      message: error.message || "Failed to fetch dashboard stats",
    });
  }
};
