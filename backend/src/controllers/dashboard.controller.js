import prisma from "../prisma.js";

export const getStats = async (req, res) => {

  const role = req.user.role;
  const doctorId = req.user.doctorId;
  const patientId = req.user.patientId;

  let appointmentFilter = { deletedAt: null };

  if (role === "DOCTOR" && doctorId) {
    appointmentFilter = {
      deletedAt: null,
      doctorId,
    };
  }

  if (role === "PATIENT" && patientId) {
    appointmentFilter = {
      deletedAt: null,
      patientId,
    };
  }

  /* =======================
     COUNTS
  ======================= */

  const totalPatients =
    role === "PATIENT"
      ? 1
      : await prisma.patient.count({
          where: { deletedAt: null },
        });

  const totalDoctors = await prisma.doctor.count({
    where: { deletedAt: null },
  });

  const totalAppointments = await prisma.appointment.count({
    where: appointmentFilter,
  });

  const pending = await prisma.appointment.count({
    where: { ...appointmentFilter, status: "PENDING" },
  });

  const confirmed = await prisma.appointment.count({
    where: { ...appointmentFilter, status: "CONFIRMED" },
  });

  const cancelled = await prisma.appointment.count({
    where: { ...appointmentFilter, status: "CANCELLED" },
  });

  /* =======================
     WEEKLY DATA
  ======================= */

  const today = new Date();

  const startOfWeek = new Date(today);
  startOfWeek.setDate(today.getDate() - today.getDay());
  startOfWeek.setHours(0, 0, 0, 0);

  const weekAppointments = await prisma.appointment.findMany({
    where: {
      ...appointmentFilter,
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
  ======================= */

  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);

  const endOfToday = new Date();
  endOfToday.setHours(23, 59, 59, 999);

  const todayAppointmentsRaw = await prisma.appointment.findMany({
    where: {
      ...appointmentFilter,
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

  /* =======================
     WEEKLY GROWTH
  ======================= */

  const lastWeekStart = new Date(startOfWeek);
  lastWeekStart.setDate(startOfWeek.getDate() - 7);

  const lastWeekAppointments = await prisma.appointment.count({
    where: {
      ...appointmentFilter,
      dateTime: {
        gte: lastWeekStart,
        lt: startOfWeek,
      },
    },
  });

  const thisWeekCount = weekAppointments.length;

  const weeklyGrowth =
    lastWeekAppointments > 0
      ? Math.round(
          ((thisWeekCount - lastWeekAppointments) /
            lastWeekAppointments) *
            100
        )
      : 0;

  /* ======================= */

  res.json({
    totalPatients,
    totalDoctors,
    totalAppointments,
    pending,
    confirmed,
    cancelled,
    weekly,
    todayAppointments,
    weeklyGrowth,
  });
};