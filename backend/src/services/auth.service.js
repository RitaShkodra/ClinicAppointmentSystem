import bcrypt from "bcrypt";
import prisma from "../prisma.js";

export const registerUser = async ({ name, email, password }) => {
  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    throw new Error("User already exists");
  }


  const hashedPassword = await bcrypt.hash(password, 10);

 
  const user = await prisma.user.create({
    data: {
      name,
      email,
      password: hashedPassword,
      role: "STAFF",
    },
  });

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
  };
};
