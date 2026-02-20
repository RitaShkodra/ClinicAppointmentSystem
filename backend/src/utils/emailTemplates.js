export const buildAppointmentEmail = ({
  type, // "CREATED" | "UPDATED" | "STATUS"
  appointment,
}) => {
  const { patient, doctor, dateTime, status } = appointment;

  const formattedDate = new Date(dateTime).toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  const formattedTime = new Date(dateTime).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  let title = "";
  let message = "";

  if (type === "CREATED") {
    title = "Appointment Confirmed";
    message = `Your appointment has been successfully scheduled.`;
  }

  if (type === "UPDATED") {
    title = "Appointment Updated";
    message = `Your appointment details have been updated.`;
  }

  if (type === "STATUS") {
    title = "Appointment Status Updated";
    message = `Your appointment status is now <strong>${status}</strong>.`;
  }

  return `
  <div style="font-family: Arial, sans-serif; background:#f6f7fb; padding:40px 0;">
    <div style="max-width:600px; margin:0 auto; background:white; border-radius:16px; overflow:hidden; box-shadow:0 10px 25px rgba(0,0,0,0.05);">

      <div style="background:#14b8a6; padding:24px; text-align:center;">
        <h1 style="color:white; margin:0; font-size:20px;">Clinic Appointment</h1>
      </div>

      <div style="padding:30px;">
        <h2 style="margin-top:0; color:#111;">Hello ${patient.firstName},</h2>

        <p style="color:#555; line-height:1.6;">
          ${message}
        </p>

        <div style="background:#f3f4f6; padding:16px; border-radius:12px; margin:20px 0;">
          <p style="margin:6px 0;"><strong>Doctor:</strong> Dr. ${doctor.firstName} ${doctor.lastName}</p>
          <p style="margin:6px 0;"><strong>Date:</strong> ${formattedDate}</p>
          <p style="margin:6px 0;"><strong>Time:</strong> ${formattedTime}</p>
          ${
            type === "STATUS"
              ? `<p style="margin:6px 0;"><strong>Status:</strong> ${status}</p>`
              : ""
          }
        </div>

        <p style="color:#666; font-size:14px;">
          If you need to reschedule, please contact the clinic.
        </p>
      </div>

      <div style="background:#f9fafb; padding:20px; text-align:center; font-size:12px; color:#999;">
        © ${new Date().getFullYear()} Clinic System
      </div>

    </div>
  </div>
  `;
};