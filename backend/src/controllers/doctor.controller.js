import {
  createDoctor,
  getAllDoctors,
  getDoctorById,
  updateDoctor,
  deleteDoctor,
} from "../services/doctor.service.js";

export const create = async (req, res) => {
  try {
    const { firstName, lastName, specialization, email, phone } = req.body;

    if (!firstName || !lastName || !specialization) {
      return res.status(400).json({
        message: "First name, last name and specialization are required",
      });
    }

    const doctor = await createDoctor({
      firstName,
      lastName,
      specialization,
      email,
      phone,
    });

    res.status(201).json(doctor);
  } catch (error) {
    res.status(400).json({
      message: error.message,
    });
  }
};

export const getAll = async (req, res) => {
  try {
    const doctors = await getAllDoctors();
    res.json(doctors);
  } catch (error) {
    res.status(400).json({
      message: error.message,
    });
  }
};

export const getOne = async (req, res) => {
  try {
    const doctor = await getDoctorById(req.params.id);

    if (!doctor) {
      return res.status(404).json({
        message: "Doctor not found",
      });
    }

    res.json(doctor);
  } catch (error) {
    res.status(400).json({
      message: error.message,
    });
  }
};

export const update = async (req, res) => {
  try {
    const doctor = await updateDoctor(req.params.id, req.body);
    res.json(doctor);
  } catch (error) {
    res.status(400).json({
      message: error.message,
    });
  }
};

export const remove = async (req, res) => {
  try {
    await deleteDoctor(req.params.id);
    res.json({ message: "Doctor deleted successfully" });
  } catch (error) {
    res.status(400).json({
      message: error.message,
    });
  }
};
