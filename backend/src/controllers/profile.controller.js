import prisma from "../prisma.js";
import bcrypt from "bcryptjs";

export const getMe = async (req, res) => {
  try {
    const userId = req.user.id;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        doctorId: true,
        patientId: true,
        // if you have avatar later, add it here
        doctor: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            phone: true,
            specialization: true,
            availability: true,
          },
        },
        patient: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            phone: true,
            email: true,
          },
        },
      },
    });

    if (!user) return res.status(404).json({ message: "User not found" });

    res.json(user);
  } catch (err) {
    res.status(500).json({ message: "Failed to load profile" });
  }
};

export const updateMe = async (req, res) => {
  try {
    const userId = req.user.id;
    const { name, email } = req.body;

    if (!name || !email) {
      return res.status(400).json({ message: "Name and email are required" });
    }

    // prevent duplicate email
    const existing = await prisma.user.findFirst({
      where: {
        email,
        NOT: { id: userId },
      },
    });
    if (existing) {
      return res.status(400).json({ message: "Email already in use" });
    }

    const updated = await prisma.user.update({
      where: { id: userId },
      data: { name, email },
      select: { id: true, name: true, email: true, role: true, doctorId: true, patientId: true },
    });

    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: "Failed to update profile" });
  }
};

export const changeMyPassword = async (req, res) => {
  try {
    const userId = req.user.id;
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: "currentPassword and newPassword are required" });
    }

    const user = await prisma.user.findUnique({
  where: { id: userId },
  include: {
    doctor: true,
    patient: true
  }
});
    if (!user) return res.status(404).json({ message: "User not found" });

    const ok = await bcrypt.compare(currentPassword, user.password);
    if (!ok) return res.status(400).json({ message: "Current password is wrong" });

    const hashed = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({
      where: { id: userId },
      data: { password: hashed, forcePasswordChange: false
 },
    });

    res.json({ message: "Password changed successfully" });
  } catch (err) {
    res.status(500).json({ message: "Failed to change password" });
  }
};

export const updateMyDoctorProfile = async (req, res) => {
  try {
    if (req.user.role !== "DOCTOR") {
      return res.status(403).json({ message: "Only doctors can update doctor profile" });
    }

    const doctorId = req.user.doctorId;
    if (!doctorId) {
      return res.status(400).json({ message: "doctorId missing on user" });
    }

    const { phone, specialization, availability } = req.body;

    // availability can be object OR string, we store as string for consistency
    let availabilityString = undefined;
    if (availability !== undefined) {
      availabilityString =
        typeof availability === "string" ? availability : JSON.stringify(availability);
    }

    const updated = await prisma.doctor.update({
      where: { id: Number(doctorId) },
      data: {
        phone: phone ?? undefined,
        specialization: specialization ?? undefined,
        availability: availabilityString,
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        phone: true,
        specialization: true,
        availability: true,
      },
    });

    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: "Failed to update doctor profile" });
  }
};