import {
  createAppointment,
  getAllAppointments,
  updateAppointmentStatus,
  deleteAppointment,
} from "../services/appointment.service.js";

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

    res.status(201).json(appointment);
  } catch (error) {
    res.status(400).json({
      message: error.message,
    });
  }
};

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

    res.json(appointment);
  } catch (error) {
    res.status(400).json({
      message: error.message,
    });
  }
};

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
