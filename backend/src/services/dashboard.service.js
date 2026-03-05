import prisma from "../prisma.js";

export const getDashboardStats = async () => {
  const totalPatients = await prisma.patient.count();
  const totalDoctors = await prisma.doctor.count();
  const totalAppointments = await prisma.appointment.count();

  const pendingAppointments = await prisma.appointment.count({
    where: { status: "PENDING" },
  });

  const confirmedAppointments = await prisma.appointment.count({
    where: { status: "CONFIRMED" },
  });

  const cancelledAppointments = await prisma.appointment.count({
    where: { status: "CANCELLED" },
  });

  return {
    totalPatients,
    totalDoctors,
    totalAppointments,
    pendingAppointments,
    confirmedAppointments,
    cancelledAppointments,
  };
};
