import prisma from "../prisma.js";

export const getStats = async (req, res) => {
  const totalPatients = await prisma.patient.count();
  const totalDoctors = await prisma.doctor.count();
  const totalAppointments = await prisma.appointment.count();

  const pending = await prisma.appointment.count({
    where: { status: "PENDING" },
  });

  const approved = await prisma.appointment.count({
    where: { status: "APPROVED" },
  });

  const cancelled = await prisma.appointment.count({
    where: { status: "CANCELLED" },
  });

  /* =======================
     WEEKLY DATA
  ======================== */

  const today = new Date();
  const startOfWeek = new Date(today);
  startOfWeek.setDate(today.getDate() - today.getDay());
  startOfWeek.setHours(0, 0, 0, 0);

  const weekAppointments = await prisma.appointment.findMany({
    where: {
      dateTime: {
        gte: startOfWeek,
      },
    },
  });

  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const weekly = days.map((day, index) => {
    const count = weekAppointments.filter((appt) => {
      const apptDate = new Date(appt.dateTime);
      return apptDate.getDay() === index;
    }).length;

    return {
      day,
      count,
    };
  });

  /* =======================
     TODAY APPOINTMENTS
  ======================== */

  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);

  const endOfToday = new Date();
  endOfToday.setHours(23, 59, 59, 999);

  const todayAppointmentsRaw = await prisma.appointment.findMany({
    where: {
      dateTime: {
        gte: startOfToday,
        lte: endOfToday,
      },
    },
    include: {
      patient: true,
      doctor: true,
    },
    orderBy: {
      dateTime: "asc",
    },
  });

  const todayAppointments = todayAppointmentsRaw.map((a) => ({
    id: a.id,
    patientName: `${a.patient.firstName} ${a.patient.lastName}`,
    doctorName: a.doctor.lastName,
    time: new Date(a.dateTime).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    }),
  }));

  /* ======================= */

  res.json({
    totalPatients,
    totalDoctors,
    totalAppointments,
    pending,
    approved,
    cancelled,
    weekly,
    todayAppointments,
  });
};