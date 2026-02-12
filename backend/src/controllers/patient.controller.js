import {
  createPatient,
  getAllPatients,
  updatePatient,
  deletePatient,
} from "../services/patient.service.js";

export const create = async (req, res) => {
  try {
    const { firstName, lastName, email, phone } = req.body;

    if (!firstName || !lastName) {
      return res.status(400).json({
        message: "First name and last name are required",
      });
    }

    const patient = await createPatient({
      firstName,
      lastName,
      email,
      phone,
    });

    res.status(201).json(patient);
  } catch (error) {
    res.status(400).json({
      message: error.message,
    });
  }
};


export const getAll = async (req, res) => {
  try {
    const patients = await getAllPatients();
    res.json(patients);
  } catch (error) {
    res.status(400).json({
      message: error.message,
    });
  }
};

export const update = async (req, res) => {
  try {
    const patient = await updatePatient(req.params.id, req.body);
    res.json(patient);
  } catch (error) {
    res.status(400).json({
      message: error.message,
    });
  }
};

export const remove = async (req, res) => {
  try {
    await deletePatient(req.params.id);
    res.json({ message: "Patient deleted successfully" });
  } catch (error) {
    res.status(400).json({
      message: error.message,
    });
  }
};
