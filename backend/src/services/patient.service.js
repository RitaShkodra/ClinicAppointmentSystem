import prisma from "../prisma.js";

export const createPatient = async (data) => {
  return await prisma.patient.create({
    data,
  });
};

export const getAllPatients = async () => {
  return await prisma.patient.findMany({
    orderBy: { createdAt: "desc" },
  });
};

export const updatePatient = async (id, data) => {
  return await prisma.patient.update({
    where: { id: Number(id) },
    data,
  });
};

export const deletePatient = async (id) => {
  return await prisma.patient.delete({
    where: { id: Number(id) },
  });
};
