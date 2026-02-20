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

  /* =========================
     1️⃣ Prevent booking in past
  ========================== */
  if (appointmentDate < new Date()) {
    throw new Error("Cannot book appointment in the past");
  }

  /* =========================
     2️⃣ Validate Patient
  ========================== */
  const patient = await prisma.patient.findUnique({
    where: { id: Number(patientId) },
  });

  if (!patient) {
    throw new Error("Patient not found");
  }

  /* =========================
     3️⃣ Validate Doctor
  ========================== */
  const doctor = await prisma.doctor.findUnique({
    where: { id: Number(doctorId) },
  });

  if (!doctor) {
    throw new Error("Doctor not found");
  }

  /* =========================
     4️⃣ Create 30-Minute Window
  ========================== */

  const windowStart = new Date(appointmentDate);
  windowStart.setMinutes(windowStart.getMinutes() - 30);

  const windowEnd = new Date(appointmentDate);
  windowEnd.setMinutes(windowEnd.getMinutes() + 30);

  /* =========================
     5️⃣ Prevent Doctor Double Booking
  ========================== */

  const doctorConflict = await prisma.appointment.findFirst({
    where: {
      doctorId: Number(doctorId),
      status: { not: "CANCELLED" },
      dateTime: {
        gte: windowStart,
        lt: windowEnd,
      },
    },
  });

  if (doctorConflict) {
    throw new Error(
      "Doctor has another appointment within 30 minutes of this time"
    );
  }

  /* =========================
     6️⃣ Prevent Patient Double Booking
  ========================== */

  const patientConflict = await prisma.appointment.findFirst({
    where: {
      patientId: Number(patientId),
      status: { not: "CANCELLED" },
      dateTime: {
        gte: windowStart,
        lt: windowEnd,
      },
    },
  });

  if (patientConflict) {
    throw new Error(
      "Patient already has another appointment within 30 minutes of this time"
    );
  }

  /* =========================
     7️⃣ Create Appointment
  ========================== */

  return await prisma.appointment.create({
    data: {
      dateTime: appointmentDate,
      notes: notes || null,
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
export const updateAppointment = async ({
  id,
  patientId,
  doctorId,
  dateTime,
  notes,
}) => {
  const appointmentDate = new Date(dateTime);

  if (appointmentDate < new Date()) {
    throw new Error("Cannot set appointment in the past");
  }

  const existing = await prisma.appointment.findUnique({
    where: { id: Number(id) },
  });

  if (!existing) {
    throw new Error("Appointment not found");
  }

  const windowStart = new Date(appointmentDate);
  windowStart.setMinutes(windowStart.getMinutes() - 30);

  const windowEnd = new Date(appointmentDate);
  windowEnd.setMinutes(windowEnd.getMinutes() + 30);

  const doctorConflict = await prisma.appointment.findFirst({
    where: {
      id: { not: Number(id) },
      doctorId: Number(doctorId),
      status: { not: "CANCELLED" },
      dateTime: {
        gte: windowStart,
        lt: windowEnd,
      },
    },
  });

  if (doctorConflict) {
    throw new Error("Doctor has another appointment within 30 minutes");
  }

  const patientConflict = await prisma.appointment.findFirst({
    where: {
      id: { not: Number(id) },
      patientId: Number(patientId),
      status: { not: "CANCELLED" },
      dateTime: {
        gte: windowStart,
        lt: windowEnd,
      },
    },
  });

  if (patientConflict) {
    throw new Error("Patient has another appointment within 30 minutes");
  }

  return await prisma.appointment.update({
    where: { id: Number(id) },
    data: {
      patientId: Number(patientId),
      doctorId: Number(doctorId),
      dateTime: appointmentDate,
      notes: notes || null,
    },
    include: {
      patient: true,
      doctor: true,
    },
  });
};