import {
  createAppointment,
  getAllAppointments,
  updateAppointmentStatus,
  deleteAppointment,
  updateAppointment,
} from "../services/appointment.service.js";

import { sendEmail } from "../utils/email.js";
import prisma from "../prisma.js";
import { buildAppointmentEmail } from "../utils/emailTemplates.js";

/* ============================
   CREATE APPOINTMENT
============================ */

export const create = async (req, res) => {
  try {
    let { dateTime, notes, patientId, doctorId } = req.body;

    if (!dateTime || !doctorId) {
      return res.status(400).json({
        message: "dateTime and doctorId are required",
      });
    }

    // 🟡 If PATIENT, force patientId to their own
    if (req.user.role === "PATIENT") {
      const patient = await prisma.patient.findUnique({
        where: { userId: req.user.id },
      });

      if (!patient) {
        return res.status(403).json({
          message: "Patient profile not found",
        });
      }

      patientId = patient.id;
    }

    // 🟢 ADMIN & RECEPTIONIST must provide patientId
    if (
      (req.user.role === "ADMIN" || req.user.role === "RECEPTIONIST") &&
      !patientId
    ) {
      return res.status(400).json({
        message: "patientId is required",
      });
    }

    const appointment = await createAppointment({
      dateTime,
      notes,
      patientId,
      doctorId,
    });

    await sendEmail({
      to: appointment.patient.email,
      subject: "Appointment Confirmed",
      html: buildAppointmentEmail({
        type: "CREATED",
        appointment,
      }),
    });

    res.status(201).json(appointment);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

/* ============================
   GET ALL APPOINTMENTS
============================ */

export const getAll = async (req, res) => {
  const user = req.user;

  let where = {};

  if (user.role === "DOCTOR") {
    where.doctorId = user.doctorId;
  }

  if (user.role === "PATIENT") {
    where.patientId = user.patientId;
  }

  const appointments = await prisma.appointment.findMany({
    where,
    include: {
      patient: true,
      doctor: true,
    },
    orderBy: {
      dateTime: "asc",
    },
  });

  res.json(appointments);
};

/* ============================
   UPDATE STATUS
============================ */

export const updateStatus = async (req, res) => {
  try {
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({
        message: "Status is required",
      });
    }

    const appointment = await prisma.appointment.findUnique({
      where: { id: Number(req.params.id) },
      include: { doctor: true, patient: true },
    });

    if (!appointment) {
      return res.status(404).json({
        message: "Appointment not found",
      });
    }

    // 🔵 Doctor can update ONLY their own appointment
    if (req.user.role === "DOCTOR") {
      const doctor = await prisma.doctor.findUnique({
        where: { userId: req.user.id },
      });

      if (!doctor || doctor.id !== appointment.doctorId) {
        return res.status(403).json({
          message: "You can only update your own appointments",
        });
      }
    }

    const updated = await updateAppointmentStatus(req.params.id, status);

    await sendEmail({
      to: updated.patient.email,
      subject: "Appointment Status Updated",
      html: buildAppointmentEmail({
        type: "STATUS",
        appointment: updated,
      }),
    });

    res.json(updated);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

/* ============================
   DELETE APPOINTMENT
============================ */

export const remove = async (req, res) => {
  try {
    await deleteAppointment(req.params.id);
    res.json({ message: "Appointment deleted successfully" });
  } catch (error) {
    res.status(400).json({
      message: error.message,
    });
  }
};
export const update = async (req, res) => {
  try {
    const { id } = req.params;
    const { patientId, doctorId, dateTime, notes } = req.body;

    const updated = await updateAppointment({
      id,
      patientId,
      doctorId,
      dateTime,
      notes,
    });

    await sendEmail({
      to: updated.patient.email,
      subject: "Appointment Updated",
      html: `
        <h2>Appointment Updated</h2>
        <p>Hello ${updated.patient.firstName},</p>
        <p>Your appointment with Dr. ${updated.doctor.firstName}
        on ${new Date(updated.dateTime).toLocaleString()}
        has been updated.</p>
        <br/>
        <p>Clinic Team</p>
      `,
    });

    res.json(updated);
  } catch (error) {
    console.error(error);
    res.status(400).json({
      message: error.message,
    });
  }
};
