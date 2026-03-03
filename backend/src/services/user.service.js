import prisma from "../prisma.js";
import bcrypt from "bcrypt";

export const createUserByAdmin = async ({
  name,
  email,
  password,
  role,
  doctorData,
  patientData,
}) => {
  const hashedPassword = await bcrypt.hash(password, 10);

  // 🔴 If role is DOCTOR
  if (role === "DOCTOR") {
    const doctor = await prisma.doctor.create({
      data: {
        firstName: doctorData.firstName,
        lastName: doctorData.lastName,
        specialization: doctorData.specialization,
        phone: doctorData.phone || null,
      },
    });

    return await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: "DOCTOR",
        doctorId: doctor.id,
      },
    });
  }

  // 🟡 If role is PATIENT
  if (role === "PATIENT") {
    const patient = await prisma.patient.create({
      data: {
        firstName: patientData.firstName,
        lastName: patientData.lastName,
        phone: patientData.phone,
      },
    });

    return await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: "PATIENT",
        patientId: patient.id,
      },
    });
  }

  // 🟢 Receptionist or Admin
  return await prisma.user.create({
    data: {
      name,
      email,
      password: hashedPassword,
      role,
    },
  });
};
