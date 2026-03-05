import prisma from "../prisma.js";
import bcrypt from "bcryptjs";

export const createUserByAdmin = async ({
  name,
  email,
  role,
  doctorData,
  patientData,
}) => {

  console.log("CREATE USER REQUEST:", {
    name,
    email,
    role,
    doctorData,
    patientData
  });

  const TEMP_PASSWORD = "Welcome123!";
  const hashedPassword = await bcrypt.hash(TEMP_PASSWORD, 10);

  return await prisma.$transaction(async (tx) => {

    if (role === "DOCTOR") {

      const doctor = await tx.doctor.create({
        data: {
          firstName: doctorData.firstName,
          lastName: doctorData.lastName,
          specialization: doctorData.specialization,
          phone: doctorData.phone || null,
          email: email,
        },
      });
      console.log("DOCTOR CREATED:", doctor);
      console.log("CREATING USER FOR DOCTOR:", email);
     try {
  const user = await tx.user.create({
    data: {
      name,
      email,
      password: hashedPassword,
      role: "DOCTOR",
      doctorId: doctor.id,
      forcePasswordChange: true,
    },
  });

  console.log("USER CREATED:", user);

  return user;

} catch (err) {
  console.error("USER CREATION FAILED:", err);
  throw err;
}
    }

    if (role === "PATIENT") {

      const patient = await tx.patient.create({
        data: {
          firstName: patientData.firstName,
          lastName: patientData.lastName,
          phone: patientData.phone,
          email: email,
        },
      });

      return await tx.user.create({
        data: {
          name,
          email,
          password: hashedPassword,
          role: "PATIENT",
          patientId: patient.id,
          forcePasswordChange: true,
        },
      });
    }

    return await tx.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role,
        forcePasswordChange: true,
      },
    });

  });
};