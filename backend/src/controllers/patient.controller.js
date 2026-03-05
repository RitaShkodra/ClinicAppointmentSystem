import prisma from "../prisma.js";
import {
  updatePatient,
  deletePatient,
} from "../services/patient.service.js";
import { createUserByAdmin } from "../services/user.service.js";

export const create = async (req, res) => {
  try {
    const { firstName, lastName, email, phone } = req.body;

    // If patients must be able to login, email is required
    if (!firstName || !lastName || !email) {
      return res.status(400).json({
        message: "First name, last name and email are required",
      });
    }

    // This creates BOTH Patient + User (temp password + force change)
    const user = await createUserByAdmin({
      name: `${firstName} ${lastName}`,
      email,
      role: "PATIENT",
      patientData: { firstName, lastName, phone },
    });

    const patient = await prisma.patient.findUnique({
      where: { id: user.patientId },
    });

    return res.status(201).json({
      message: "Patient account created. Temp password: Welcome123!",
      user: { id: user.id, email: user.email, role: user.role },
      patient,
    });
  } catch (error) {
    // Very common: unique constraint violation for email
    if (error?.code === "P2002") {
      return res.status(400).json({ message: "Email already in use" });
    }

    return res.status(400).json({ message: error.message });
  }
};

export const getAll = async (req, res) => {
  try {
    const role = req.user.role;
    const doctorId = req.user.doctorId;
    const patientId = req.user.patientId;

    let where = { deletedAt: null };

    if (role === "DOCTOR") {
      where = {
        deletedAt: null,
        appointments: { some: { doctorId } },
      };
    }

    if (role === "PATIENT") {
      where = {
        deletedAt: null,
        id: patientId,
      };
    }

    const patients = await prisma.patient.findMany({ where });

    res.json(patients);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const update = async (req, res) => {
  try {
    const patient = await updatePatient(req.params.id, req.body);
    res.json(patient);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const remove = async (req, res) => {
  try {
    await deletePatient(req.params.id);
    res.json({ message: "Patient deleted successfully" });
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};