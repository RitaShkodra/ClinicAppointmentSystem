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

    const role = req.user.role;

    // PATIENT → force their own patientId
    if (role === "PATIENT") {
      patientId = req.user.patientId;

      if (!patientId) {
        return res.status(403).json({
          message: "Patient profile not found",
        });
      }
    }

    // ADMIN / RECEPTIONIST must provide patientId
    if (
      (role === "ADMIN" || role === "RECEPTIONIST") &&
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
      subject: "Appointment Created",
      html: buildAppointmentEmail({
        type: "CREATED",
        appointment,
      }),
    });

    res.status(201).json(appointment);

  } catch (error) {
    console.error(error);
    res.status(400).json({ message: error.message });
  }
};


/* ============================
   GET ALL APPOINTMENTS
============================ */

export const getAll = async (req, res) => {
  try {
    const role = req.user.role;
    const doctorId = req.user.doctorId;
    const patientId = req.user.patientId;

    let where = { deletedAt: null };

    // Doctor sees only their appointments
    if (role === "DOCTOR") {
      if (!doctorId) {
        return res.status(403).json({ message: "Doctor profile not found" });
      }
      where.doctorId = Number(doctorId);
    }

    // Patient sees only their appointments
    if (role === "PATIENT") {
      if (!patientId) {
        return res.status(403).json({ message: "Patient profile not found" });
      }
      where.patientId = Number(patientId);
    }

    const appointments = await prisma.appointment.findMany({
      where,
      include: {
        doctor: true,
        patient: true,
      },
      orderBy: {
        dateTime: "asc",
      },
    });

    res.json(appointments);
  } catch (error) {
    console.error(error);
    res.status(400).json({ message: error.message });
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

    const appointment = await prisma.appointment.findFirst({
  where: { id: Number(req.params.id), deletedAt: null },
  include: { doctor: true, patient: true },
});

    if (!appointment) {
      return res.status(404).json({
        message: "Appointment not found",
      });
    }

    // Doctor can update only their own appointments
    if (req.user.role === "DOCTOR") {
      if (req.user.doctorId !== appointment.doctorId) {
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

// appointment.controller.js
export const remove = async (req, res) => {
  try {
    const id = Number(req.params.id);

    if (!id || Number.isNaN(id)) {
      return res.status(400).json({ message: "Invalid appointment id" });
    }

    // helpful debug
    console.log("DELETE APPOINTMENT:", {
      id,
      userId: req.user?.id,
      role: req.user?.role,
    });

    await deleteAppointment(id);

    return res.json({ message: "Appointment deleted successfully" });
  } catch (error) {
    console.error("DELETE APPOINTMENT ERROR:", error);

    // Prisma "Record not found"
    if (error?.code === "P2025") {
      return res.status(404).json({ message: "Appointment not found" });
    }

    // Prisma foreign key constraint etc (rare for appointment)
    if (error?.code === "P2003") {
      return res.status(409).json({ message: "Cannot delete appointment due to relations" });
    }

    return res.status(500).json({ message: error?.message || "Failed to delete appointment" });
  }
};


/* ============================
   UPDATE APPOINTMENT
============================ */

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
        <p>
          Your appointment with Dr. ${updated.doctor.firstName}
          on ${new Date(updated.dateTime).toLocaleString()}
          has been updated.
        </p>
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