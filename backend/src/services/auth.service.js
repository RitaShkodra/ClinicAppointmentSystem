import bcrypt from "bcrypt";
import prisma from "../prisma.js";
import jwt from "jsonwebtoken";
import { config } from "../config.js";



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



export const loginUser = async ({ email, password }) => {
  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    throw new Error("Invalid credentials");
  }

  const isMatch = await bcrypt.compare(password, user.password);

  if (!isMatch) {
    throw new Error("Invalid credentials");
  }

  

  const accessToken = jwt.sign(
    {
      userId: user.id,
      role: user.role,
    },
    config.jwtSecret,
    // { expiresIn: "15m" }
    { expiresIn: "2h" }
  );



  const refreshToken = jwt.sign(
    {
      userId: user.id,
    },
    config.jwtRefreshSecret,
    { expiresIn: "7d" }
  );

 

  await prisma.refreshToken.deleteMany({
    where: { userId: user.id },
  });

  

  await prisma.refreshToken.create({
    data: {
      token: refreshToken,
      userId: user.id,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    },
  });

  return {
    accessToken,
    refreshToken,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
  };
};
