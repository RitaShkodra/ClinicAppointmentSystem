import prisma from "../src/prisma.js";
import bcrypt from "bcrypt";

async function main() {
  console.log("🌱 Seeding database...");

  const password = await bcrypt.hash("123456", 10);

  /* =========================
     ADMIN
  ========================= */
  const admin = await prisma.user.create({
    data: {
      name: "System Admin",
      email: "admin@clinic.com",
      password,
      role: "ADMIN",
    },
  });

  /* =========================
     RECEPTIONIST
  ========================= */
  const receptionist = await prisma.user.create({
    data: {
      name: "Reception Staff",
      email: "reception@clinic.com",
      password,
      role: "RECEPTIONIST",
    },
  });

  /* =========================
     DOCTOR + USER
  ========================= */
  const doctor = await prisma.doctor.create({
    data: {
      firstName: "John",
      lastName: "Smith",
      specialization: "Cardiology",
      phone: "049123456",
    },
  });

  const doctorUser = await prisma.user.create({
    data: {
      name: "Dr. John Smith",
      email: "doctor@clinic.com",
      password,
      role: "DOCTOR",
      doctorId: doctor.id,
    },
  });

  /* =========================
     PATIENT + USER
  ========================= */
  const patient = await prisma.patient.create({
    data: {
      firstName: "Jane",
      lastName: "Doe",
      phone: "049987654",
    },
  });

  const patientUser = await prisma.user.create({
    data: {
      name: "Jane Doe",
      email: "patient@clinic.com",
      password,
      role: "PATIENT",
      patientId: patient.id,
    },
  });

  /* =========================
     SAMPLE APPOINTMENT
  ========================= */
  const appointmentDate = new Date();
  appointmentDate.setHours(appointmentDate.getHours() + 2);

  await prisma.appointment.create({
    data: {
      dateTime: appointmentDate,
      duration: 30,
      status: "CONFIRMED",
      notes: "Initial consultation",
      patientId: patient.id,
      doctorId: doctor.id,
    },
  });

  console.log("✅ Seeding completed successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
