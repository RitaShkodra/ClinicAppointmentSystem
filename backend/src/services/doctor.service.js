import prisma from "../prisma.js";

export const createDoctor = async (data) => {
  return await prisma.doctor.create({
    data,
  });
};

export const getAllDoctors = async () => {
  return await prisma.doctor.findMany({
    orderBy: { createdAt: "desc" },
  });
};

export const getDoctorById = async (id) => {
  return await prisma.doctor.findUnique({
    where: { id: Number(id) },
  });
};

export const updateDoctor = async (id, data) => {
  return await prisma.doctor.update({
    where: { id: Number(id) },
    data,
  });
};

export const deleteDoctor = async (id) => {
  return await prisma.doctor.delete({
    where: { id: Number(id) },
  });
};
