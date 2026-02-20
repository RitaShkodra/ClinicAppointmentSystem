import { useEffect, useState, useContext, useMemo } from "react";
import axios from "axios";
import { AuthContext } from "../context/authcontext";

import PageHeader from "../components/pageheader";
import SearchInput from "../components/searchinput";
import SearchableSelect from "../components/searchableselect";

function Appointments() {
  const { user } = useContext(AuthContext);

  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  

  const [appointments, setAppointments] = useState([]);
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);

  const [searchTerm, setSearchTerm] = useState("");

  const [form, setForm] = useState({
    patientId: "",
    doctorId: "",
    date: "",
    time: "",
    notes: "",
  });
  const resetForm = () => {
  setForm({
    patientId: "",
    doctorId: "",
    date: "",
    time: "",
    notes: "",
  });
  setError("");
};

  const token = localStorage.getItem("accessToken");

  useEffect(() => {
    const fetchData = async () => {
      const [apptRes, patientRes, doctorRes] = await Promise.all([
        axios.get("http://localhost:5000/api/appointments", {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get("http://localhost:5000/api/patients", {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get("http://localhost:5000/api/doctors", {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      setAppointments(apptRes.data);
      setPatients(patientRes.data);
      setDoctors(doctorRes.data);
    };

    fetchData();
  }, []);

  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(""), 4000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  const getWeekdayKey = (dateString) => {
  return new Date(dateString)
    .toLocaleDateString("en-US", { weekday: "long" })
    .toLowerCase();
};

  const generateTimeSlots = () => {
    if (!form.doctorId || !form.date) return [];

    const selectedDoctor = doctors.find(
      (d) => d.id === Number(form.doctorId)
    );

    if (!selectedDoctor?.availability) return [];

    let parsedAvailability;

    if (typeof selectedDoctor.availability === "string") {
      try {
        parsedAvailability = JSON.parse(selectedDoctor.availability);
      } catch {
        return [];
      }
    } else {
      parsedAvailability = selectedDoctor.availability;
    }

    const weekday = getWeekdayKey(form.date);
   const dayAvailability =
  parsedAvailability[weekday] ||
  parsedAvailability[weekday.toUpperCase()] ||
  parsedAvailability[
    weekday.charAt(0).toUpperCase() + weekday.slice(1)
  ];

    if (!dayAvailability) return [];

    const { start, end } = dayAvailability;

    const slots = [];
    const startDate = new Date(`${form.date}T${start}`);
    const endDate = new Date(`${form.date}T${end}`);

    while (startDate < endDate) {
      const hours = startDate.getHours().toString().padStart(2, "0");
      const mins = startDate.getMinutes().toString().padStart(2, "0");
      slots.push(`${hours}:${mins}`);
      startDate.setMinutes(startDate.getMinutes() + 30);
    }

    return slots;
  };

  const timeSlots = useMemo(() => {
    return generateTimeSlots();
  }, [form.doctorId, form.date, doctors]);

  const isDoctorOffDay =
    form.doctorId && form.date && timeSlots.length === 0;

  useEffect(() => {
    setForm((prev) => ({ ...prev, time: "" }));
  }, [form.doctorId, form.date]);

  const isSlotBlocked = (slot) => {
    if (!form.doctorId || !form.date) return false;

    const selected = new Date(`${form.date}T${slot}`);

    return appointments.some((appt) => {
      if (appt.doctor.id !== Number(form.doctorId)) return false;
      if (appt.status === "CANCELLED") return false;

      const apptTime = new Date(appt.dateTime);
      const diff = Math.abs(apptTime - selected) / (1000 * 60);

      return diff < 30;
    });
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setError("");

    if (!form.patientId || !form.doctorId || !form.date) {
      setError("Please complete all required fields");
      return;
    }

    if (isDoctorOffDay) {
      setError("This doctor is not available on the selected day.");
      return;
    }

    if (!form.time) {
      setError("Please select a valid available time.");
      return;
    }

    try {
      const response = await axios.post(
        "http://localhost:5000/api/appointments",
        {
          patientId: form.patientId,
          doctorId: form.doctorId,
          notes: form.notes,
          dateTime: `${form.date}T${form.time}`,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setSuccessMessage("Appointment created successfully");

      setAppointments((prev) => [
        ...prev,
        response.data.appointment || response.data,
      ]);

      setForm({
        patientId: "",
        doctorId: "",
        date: "",
        time: "",
        notes: "",
      });

      setShowCreate(false);

    } catch (err) {
      setError(err.response?.data?.message || "Failed to create appointment");
    }
  };

  const handleStatusChange = async (id, status) => {
    try {
      await axios.patch(
        `http://localhost:5000/api/appointments/${id}/status`,
        { status },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setSuccessMessage("Status updated successfully");

      setAppointments((prev) =>
        prev.map((a) => (a.id === id ? { ...a, status } : a))
      );

    } catch {
      setError("Failed to update status");
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;

    try {
      await axios.delete(
        `http://localhost:5000/api/appointments/${deleteTarget.id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setAppointments((prev) =>
        prev.filter((a) => a.id !== deleteTarget.id)
      );

      setSuccessMessage("Appointment deleted successfully");
      setDeleteTarget(null);

    } catch {
      setError("Failed to delete appointment");
    }
  };

  const filtered = useMemo(() => {
    return appointments.filter((a) =>
      `${a.patient.firstName} ${a.patient.lastName} ${a.doctor.firstName} ${a.doctor.lastName}`
        .toLowerCase()
        .includes(searchTerm.toLowerCase())
    );
  }, [appointments, searchTerm]);

  const groupedAppointments = useMemo(() => {
    const grouped = filtered.reduce((acc, appt) => {
      const key = new Date(appt.dateTime).toDateString();
      if (!acc[key]) acc[key] = [];
      acc[key].push(appt);
      return acc;
    }, {});

    Object.keys(grouped).forEach((date) => {
      grouped[date].sort(
        (a, b) => new Date(a.dateTime) - new Date(b.dateTime)
      );
    });

    return grouped;
  }, [filtered]);

  const getStatusColor = (status) => {
    switch (status) {
      case "PENDING": return "bg-yellow-100 text-yellow-700";
      case "APPROVED": return "bg-blue-100 text-blue-700";
      case "COMPLETED": return "bg-green-100 text-green-700";
      case "CANCELLED": return "bg-red-100 text-red-700";
      default: return "bg-gray-100 text-gray-600";
    }
  };

  return (
    <div className="p-8">

      <PageHeader title="Appointments Calendar" />

      {successMessage && (
        <div className="mb-6 bg-green-50 text-green-700 px-4 py-3 rounded-xl">
          {successMessage}
        </div>
      )}

      {error && (
        <div className="mb-6 bg-red-50 text-red-600 px-4 py-3 rounded-xl">
          {error}
        </div>
      )}

      <div className="mb-8 flex justify-between items-center">
        <h2 className="text-lg font-semibold text-gray-800">Appointments</h2>

        <button
          onClick={() => {
    if (showCreate) resetForm();
    setShowCreate(!showCreate);
  }}
          className="bg-teal-500 text-white px-4 py-2 rounded-lg text-sm hover:bg-teal-600 transition"
        >
          {showCreate ? "Cancel" : "+ New Appointment"}
        </button>
      </div>

      {showCreate && (
        <div className="mb-10 p-8 bg-white rounded-2xl shadow-sm border border-gray-100">
          <form onSubmit={handleCreate} className="grid md:grid-cols-2 gap-6">

            <SearchableSelect
              label="Patient"
              options={patients}
              selectedId={form.patientId}
              placeholder="Search patient..."
              getLabel={(p) => `${p.firstName} ${p.lastName}`}
              onSelect={(p) => setForm({ ...form, patientId: p.id })}
            />

            <SearchableSelect
              label="Doctor"
              options={doctors}
              selectedId={form.doctorId}
              placeholder="Search doctor..."
              getLabel={(d) => `Dr. ${d.firstName} ${d.lastName}`}
              onSelect={(d) => setForm({ ...form, doctorId: d.id })}
            />

            <div>
              <input
                type="date"
                value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
                className="w-full rounded-xl px-4 py-2 border border-gray-200 focus:ring-2 focus:ring-teal-200 outline-none transition"
              />
              {form.doctorId && form.date && isDoctorOffDay && (
                <div className="text-sm text-red-500 mt-2">
                  This doctor is not available on this day.
                </div>
              )}
            </div>

            <select
              disabled={isDoctorOffDay}
              value={form.time}
              onChange={(e) => setForm({ ...form, time: e.target.value })}
              className="rounded-xl px-4 py-2 border border-gray-200 focus:ring-2 focus:ring-teal-200 outline-none transition"
            >
              <option value="">Select Time</option>
              {timeSlots.map((slot) => (
                <option key={slot} value={slot} disabled={isSlotBlocked(slot)}>
                  {slot}
                </option>
              ))}
            </select>

            <textarea
              placeholder="Notes (optional)"
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              className="md:col-span-2 rounded-xl px-4 py-2 border border-gray-200 focus:ring-2 focus:ring-teal-200 outline-none resize-none transition"
            />

            <button
              type="submit"
              className="md:col-span-2 bg-teal-500 text-white py-2.5 rounded-xl hover:bg-teal-600 transition"
            >
              Create Appointment
            </button>

          </form>
        </div>
      )}

      <div className="mb-8">
        <SearchInput
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search..."
        />
      </div>

      <div className="space-y-10">
        {Object.entries(groupedAppointments)
          .sort((a, b) => new Date(a[0]) - new Date(b[0]))
          .map(([date, appts]) => (
            <div key={date}>
              <h2 className="sticky top-0 z-10 text-lg font-semibold text-gray-700 py-3">
                {new Date(date).toLocaleDateString("en-US", {
                  weekday: "long",
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                })}
              </h2>

              <div className="grid gap-4">
                {appts.map((appointment) => (
                  <div
                    key={appointment.id}
                    className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300 flex justify-between items-center"
                  >
                    <div>
                      <p className="font-medium text-gray-800">
                        {appointment.patient.firstName} {appointment.patient.lastName}
                      </p>

                      <p className="text-sm text-gray-500">
                        Dr. {appointment.doctor.firstName} {appointment.doctor.lastName}
                      </p>

                      <p className="text-sm text-gray-400 mt-1">
                        {new Date(appointment.dateTime).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>

                      {appointment.notes && (
                        <p className="text-sm text-gray-600 mt-2">
                          📝 {appointment.notes}
                        </p>
                      )}
                    </div>

                    <div className="flex gap-3 items-center">
                      <span className={`px-3 py-1 text-xs rounded-full font-medium ${getStatusColor(appointment.status)}`}>
                        {appointment.status}
                      </span>

                      <select
                        value={appointment.status}
                        onChange={(e) =>
                          handleStatusChange(appointment.id, e.target.value)
                        }
                        className="text-sm border border-gray-200 rounded px-2 py-1"
                      >
                        <option value="PENDING">PENDING</option>
                        <option value="APPROVED">APPROVED</option>
                        <option value="COMPLETED">COMPLETED</option>
                        <option value="CANCELLED">CANCELLED</option>
                      </select>

                      {user?.role === "ADMIN" && (
                        <button
                          onClick={() => setDeleteTarget(appointment)}
                          className="text-sm px-3 py-1 rounded bg-red-50 text-red-600 hover:bg-red-100 transition"
                        >
                          Delete
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
      </div>

      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20">
          <div className="bg-white w-[420px] rounded-3xl p-8 shadow-2xl animate-[fadeIn_.2s_ease-out]">
            <div className="mb-6">
              <h3 className="text-xl font-semibold text-gray-800 mb-2">
                Delete Appointment
              </h3>
              <p className="text-sm text-gray-500 leading-relaxed">
                This action cannot be undone.
                <br />
                Are you sure you want to remove this appointment?
              </p>
            </div>

            <div className="bg-gray-50 rounded-2xl p-4 mb-6">
              <p className="text-sm font-medium text-gray-700">
                {deleteTarget.patient.firstName} {deleteTarget.patient.lastName}
              </p>
              <p className="text-xs text-gray-500">
                Dr. {deleteTarget.doctor.firstName} {deleteTarget.doctor.lastName}
              </p>
              <p className="text-xs text-gray-400 mt-1">
                {new Date(deleteTarget.dateTime).toLocaleDateString("en-US", {
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                })}{" "}
                at{" "}
                {new Date(deleteTarget.dateTime).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </div>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setDeleteTarget(null)}
                className="px-5 py-2 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 transition"
              >
                Cancel
              </button>

              <button
                onClick={handleDelete}
                className="px-5 py-2 rounded-xl bg-red-50 text-red-600 hover:bg-red-100 transition"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

export default Appointments;