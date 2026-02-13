import prisma from "../prisma.js";

export const createAppointment = async ({
  dateTime,
  notes,
  patientId,
  doctorId,
}) => {
  const patient = await prisma.patient.findUnique({
    where: { id: Number(patientId) },
  });

  if (!patient) {
    throw new Error("Patient not found");
  }

 
  const doctor = await prisma.doctor.findUnique({
    where: { id: Number(doctorId) },
  });

  if (!doctor) {
    throw new Error("Doctor not found");
  }

  const existingAppointment = await prisma.appointment.findFirst({
    where: {
      doctorId: Number(doctorId),
      dateTime: new Date(dateTime),
    },
  });

  if (existingAppointment) {
    throw new Error("Doctor already has an appointment at this time");
  }

  return await prisma.appointment.create({
    data: {
      dateTime: new Date(dateTime),
      notes,
      patientId: Number(patientId),
      doctorId: Number(doctorId),
    },
    include: {
      patient: true,
      doctor: true,
    },
  });
};

export const getAllAppointments = async () => {
  return await prisma.appointment.findMany({
    include: {
      patient: true,
      doctor: true,
    },
    orderBy: { dateTime: "asc" },
  });
};

export const updateAppointmentStatus = async (id, status) => {
  return await prisma.appointment.update({
    where: { id: Number(id) },
    data: { status },
  });
};

export const deleteAppointment = async (id) => {
  return await prisma.appointment.delete({
    where: { id: Number(id) },
  });
};
