import prisma from "../prisma.js";

/*
  STATUS VALUES:
  - PENDING
  - APPROVED
  - CANCELLED
  - COMPLETED
*/

export const createAppointment = async ({
  dateTime,
  notes,
  patientId,
  doctorId,
}) => {
  const appointmentDate = new Date(dateTime);

  // 1️⃣ Prevent booking in the past
  if (appointmentDate < new Date()) {
    throw new Error("Cannot book appointment in the past");
  }

  // 2️⃣ Check patient exists
  const patient = await prisma.patient.findUnique({
    where: { id: Number(patientId) },
  });

  if (!patient) {
    throw new Error("Patient not found");
  }

  // 3️⃣ Check doctor exists
  const doctor = await prisma.doctor.findUnique({
    where: { id: Number(doctorId) },
  });

  if (!doctor) {
    throw new Error("Doctor not found");
  }

  // 4️⃣ Prevent double booking (ignore CANCELLED)
  const existingAppointment = await prisma.appointment.findFirst({
    where: {
      doctorId: Number(doctorId),
      dateTime: appointmentDate,
      status: { not: "CANCELLED" },
    },
  });

  if (existingAppointment) {
    throw new Error("Doctor already has an appointment at this time");
  }

  return await prisma.appointment.create({
    data: {
      dateTime: appointmentDate,
      notes,
      patientId: Number(patientId),
      doctorId: Number(doctorId),
      status: "PENDING",
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

/*
  Controlled Status Updates
*/
export const updateAppointmentStatus = async (id, newStatus) => {
  const appointment = await prisma.appointment.findUnique({
    where: { id: Number(id) },
  });

  if (!appointment) {
    throw new Error("Appointment not found");
  }

  const allowedStatuses = ["PENDING", "APPROVED", "CANCELLED", "COMPLETED"];

  if (!allowedStatuses.includes(newStatus)) {
    throw new Error("Invalid appointment status");
  }

  if (appointment.status === "CANCELLED") {
    throw new Error("Cannot modify a cancelled appointment");
  }

  return await prisma.appointment.update({
    where: { id: Number(id) },
    data: { status: newStatus },
    include: {
      patient: true,
      doctor: true,
    },
  });
};

export const deleteAppointment = async (id) => {
  const appointment = await prisma.appointment.findUnique({
    where: { id: Number(id) },
  });

  if (!appointment) {
    throw new Error("Appointment not found");
  }

  return await prisma.appointment.delete({
    where: { id: Number(id) },
  });
};
