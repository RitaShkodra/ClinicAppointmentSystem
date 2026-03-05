import prisma from "../prisma.js";

export const createPatient = async (data) => {
  return await prisma.patient.create({
    data,
  });
};

export const getAllPatients = async () => {
  return await prisma.patient.findMany({
    where: { deletedAt: null },
    orderBy: { createdAt: "desc" },
  });
};

export const updatePatient = async (id, data) => {
  return await prisma.patient.update({
    where: { id: Number(id), deletedAt: null },
    data,
  });
};

export const deletePatient = async (id) => {
  const patientId = Number(id);

  const patient = await prisma.patient.findUnique({
    where: { id: patientId },
    include: {
      users: true,
      appointments: { where: { deletedAt: null } },
    },
  });

  if (!patient || patient.deletedAt) {
    throw new Error("Patient not found");
  }

  // Optional rule: prevent deletion if they have active appointments
  if (patient.appointments.length > 0) {
    throw new Error("Cannot delete patient with existing appointments");
  }

  // Soft-delete patient + any linked user accounts
  await prisma.$transaction(async (tx) => {
    await tx.patient.update({
      where: { id: patientId },
      data: { deletedAt: new Date() },
    });

    await tx.user.updateMany({
      where: { patientId: patientId },
      data: { deletedAt: new Date() },
    });
  });

  return true;
};
