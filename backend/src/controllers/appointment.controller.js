import {
  createAppointment,
  getAllAppointments,
  updateAppointmentStatus,
  deleteAppointment,
} from "../services/appointment.service.js";

import { sendEmail } from "../utils/email.js";

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
      subject: "Appointment Created",
      html: `
        <h2>Appointment Confirmed</h2>
        <p>Hello ${appointment.patient.firstName},</p>
        <p>Your appointment with Dr. ${appointment.doctor.firstName} 
        on ${new Date(appointment.dateTime).toLocaleString()} 
        has been successfully scheduled.</p>
        <br/>
        <p>Thank you,<br/>Clinic Team</p>
      `,
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
      html: `
        <h2>Status Update</h2>
        <p>Hello ${appointment.patient.firstName},</p>
        <p>Your appointment on 
        ${new Date(appointment.dateTime).toLocaleString()} 
        is now <strong>${status}</strong>.</p>
        <br/>
        <p>Clinic Team</p>
      `,
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