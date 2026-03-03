import prisma from "../prisma.js";

/*
  Allowed STATUS values
*/
const ALLOWED_STATUSES = ["PENDING", "CONFIRMED", "CANCELLED", "COMPLETED"];

/*
  Status transition rules
*/
const STATUS_TRANSITIONS = {
  PENDING: ["CONFIRMED", "CANCELLED"],
  CONFIRMED: ["COMPLETED", "CANCELLED"],
  CANCELLED: [],
  COMPLETED: [],
};

const toDate = (value) => {
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) throw new Error("Invalid dateTime");
  return d;
};

const minutesToMs = (m) => Number(m) * 60 * 1000;

const validateDuration = (duration) => {
  const n = Number(duration);
  if (!Number.isInteger(n) || n <= 0 || n > 480) {
    throw new Error("Invalid duration (must be 1-480 minutes)");
  }
  return n;
};

const computeEnd = (start, durationMinutes) =>
  new Date(start.getTime() + minutesToMs(durationMinutes));

/*
  Overlap check:
  newStart < existingEnd && newEnd > existingStart
*/
const findOverlappingAppointments = async ({
  doctorId,
  patientId,
  excludeAppointmentId,
  newStart,
  newEnd,
}) => {
  const broadStart = new Date(newStart.getTime() - minutesToMs(480));

  const where = {
    deletedAt: null,
    status: { not: "CANCELLED" },
    dateTime: {
      lt: newEnd,
      gte: broadStart,
    },
    ...(doctorId && { doctorId: Number(doctorId) }),
    ...(patientId && { patientId: Number(patientId) }),
    ...(excludeAppointmentId && {
      id: { not: Number(excludeAppointmentId) },
    }),
  };

  const candidates = await prisma.appointment.findMany({
    where,
    select: {
      id: true,
      dateTime: true,
      duration: true,
    },
  });

  return candidates.filter((a) => {
    const existingStart = new Date(a.dateTime);
    const existingEnd = computeEnd(existingStart, a.duration || 30);
    return newStart < existingEnd && newEnd > existingStart;
  });
};

/* =========================
   CREATE APPOINTMENT
========================= */
export const createAppointment = async ({
  dateTime,
  notes,
  patientId,
  doctorId,
  duration = 30,
}) => {
  if (!dateTime || !patientId || !doctorId) {
    throw new Error("dateTime, patientId and doctorId are required");
  }

  const start = toDate(dateTime);
  const dur = validateDuration(duration);
  const end = computeEnd(start, dur);

  if (start < new Date()) {
    throw new Error("Cannot book appointment in the past");
  }

  const numericPatientId = Number(patientId);
  const numericDoctorId = Number(doctorId);

  const patient = await prisma.patient.findFirst({
    where: { id: numericPatientId, deletedAt: null },
  });
  if (!patient) throw new Error("Patient not found");

  const doctor = await prisma.doctor.findFirst({
    where: { id: numericDoctorId, deletedAt: null },
  });
  if (!doctor) throw new Error("Doctor not found");

  const doctorOverlaps = await findOverlappingAppointments({
    doctorId: numericDoctorId,
    newStart: start,
    newEnd: end,
  });
  if (doctorOverlaps.length) {
    throw new Error("Doctor has another appointment during this time");
  }

  const patientOverlaps = await findOverlappingAppointments({
    patientId: numericPatientId,
    newStart: start,
    newEnd: end,
  });
  if (patientOverlaps.length) {
    throw new Error("Patient already has an appointment during this time");
  }

  return await prisma.appointment.create({
    data: {
      dateTime: start,
      duration: dur,
      notes: notes || null,
      patientId: numericPatientId,
      doctorId: numericDoctorId,
      status: "PENDING",
    },
    include: {
      patient: true,
      doctor: true,
    },
  });
};

/* =========================
   GET ALL APPOINTMENTS
========================= */
export const getAllAppointments = async (page = 1, limit = 10) => {
  const p = Math.max(1, Number(page) || 1);
  const l = Math.min(100, Math.max(1, Number(limit) || 10));

  return await prisma.appointment.findMany({
    where: { deletedAt: null },
    skip: (p - 1) * l,
    take: l,
    include: {
      patient: true,
      doctor: true,
    },
    orderBy: { dateTime: "asc" },
  });
};

/* =========================
   UPDATE STATUS
========================= */
export const updateAppointmentStatus = async (id, newStatus) => {
  if (!newStatus) throw new Error("Status is required");

  const status = String(newStatus).toUpperCase();

  if (!ALLOWED_STATUSES.includes(status)) {
    throw new Error("Invalid appointment status");
  }

  const appointment = await prisma.appointment.findUnique({
    where: { id: Number(id) },
  });

  if (!appointment || appointment.deletedAt) {
    throw new Error("Appointment not found");
  }

  const current = appointment.status;

  if (current === "CANCELLED" || current === "COMPLETED") {
    throw new Error("Cannot modify this appointment");
  }

  const allowedNext = STATUS_TRANSITIONS[current] || [];

  if (!allowedNext.includes(status)) {
    throw new Error(`Invalid status transition: ${current} → ${status}`);
  }

  return await prisma.appointment.update({
    where: { id: Number(id) },
    data: { status },
    include: {
      patient: true,
      doctor: true,
    },
  });
};

/* =========================
   UPDATE APPOINTMENT
========================= */
export const updateAppointment = async ({
  id,
  patientId,
  doctorId,
  dateTime,
  notes,
  duration = 30,
}) => {
  if (!id || !patientId || !doctorId || !dateTime) {
    throw new Error("Missing required fields");
  }

  const existing = await prisma.appointment.findUnique({
    where: { id: Number(id) },
  });

  if (!existing || existing.deletedAt) {
    throw new Error("Appointment not found");
  }

  if (["COMPLETED", "CANCELLED"].includes(existing.status)) {
    throw new Error("Cannot modify this appointment");
  }

  const start = toDate(dateTime);
  const dur = validateDuration(duration);
  const end = computeEnd(start, dur);

  if (start < new Date()) {
    throw new Error("Cannot set appointment in the past");
  }

  const numericPatientId = Number(patientId);
  const numericDoctorId = Number(doctorId);

  const patient = await prisma.patient.findFirst({
    where: { id: numericPatientId, deletedAt: null },
  });
  if (!patient) throw new Error("Patient not found");

  const doctor = await prisma.doctor.findFirst({
    where: { id: numericDoctorId, deletedAt: null },
  });
  if (!doctor) throw new Error("Doctor not found");

  const doctorOverlaps = await findOverlappingAppointments({
    doctorId: numericDoctorId,
    excludeAppointmentId: id,
    newStart: start,
    newEnd: end,
  });
  if (doctorOverlaps.length) {
    throw new Error("Doctor has another appointment during this time");
  }

  const patientOverlaps = await findOverlappingAppointments({
    patientId: numericPatientId,
    excludeAppointmentId: id,
    newStart: start,
    newEnd: end,
  });
  if (patientOverlaps.length) {
    throw new Error("Patient already has an appointment during this time");
  }

  return await prisma.appointment.update({
    where: { id: Number(id) },
    data: {
      patientId: numericPatientId,
      doctorId: numericDoctorId,
      dateTime: start,
      duration: dur,
      notes: notes || null,
    },
    include: {
      patient: true,
      doctor: true,
    },
  });
};

/* =========================
   SOFT DELETE
========================= */
export const deleteAppointment = async (id) => {
  const appointment = await prisma.appointment.findUnique({
    where: { id: Number(id) },
  });

  if (!appointment || appointment.deletedAt) {
    throw new Error("Appointment not found");
  }

  if (appointment.status === "COMPLETED") {
    throw new Error("Cannot delete completed appointment");
  }

  return await prisma.appointment.update({
    where: { id: Number(id) },
    data: { deletedAt: new Date() },
  });
};
