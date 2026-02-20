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
    const { dateTime, notes, patientId, doctorId } = req.body;

    if (!dateTime || !patientId || !doctorId) {
      return res.status(400).json({
        message: "dateTime, patientId and doctorId are required",
      });
    }

    const appointment = await createAppointment({
      dateTime,
      notes,
      patientId,
      doctorId,
    });

    // ✅ SEND EMAIL AFTER CREATION
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
    console.error(error);
    res.status(400).json({
      message: error.message,
    });
  }
};


/* ============================
   GET ALL APPOINTMENTS
============================ */

export const getAll = async (req, res) => {
  try {
    const appointments = await getAllAppointments();
    res.json(appointments);
  } catch (error) {
    res.status(400).json({
      message: error.message,
    });
  }
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

    const appointment = await updateAppointmentStatus(
      req.params.id,
      status
    );

    // ✅ SEND EMAIL AFTER STATUS UPDATE
    await sendEmail({
  to: appointment.patient.email,
  subject: "Appointment Status Updated",
  html: buildAppointmentEmail({
    type: "STATUS",
    appointment,
  }),
});

    res.json(appointment);

  } catch (error) {
    console.error(error);
    res.status(400).json({
      message: error.message,
    });
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