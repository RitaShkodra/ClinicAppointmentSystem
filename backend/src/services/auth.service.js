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
      // role: "STAFF",
      role: "ADMIN",

    },
  });

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
  };
};

export const loginUser =  async ({ email,password }) => {
    const user = await prisma.user.findUnique({
        where: {email},
    });
    if(!user){
        throw new Error("Invalid credentials");
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if(!isMatch){
        throw new Error("Invalid credentials");
    }


  const token = jwt.sign(
  {
    userId: user.id,
    role: user.role,
  },
  config.jwtSecret,
  { expiresIn: "1h" }
);


return {
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
  };
  
};