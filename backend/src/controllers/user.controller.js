import { createUserByAdmin } from "../services/user.service.js";

export const createUser = async (req, res) => {
  try {
    const user = await createUserByAdmin(req.body);
    res.status(201).json(user);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
