import { useEffect, useState, useContext, useMemo } from "react";
import axios from "axios";
import { AuthContext } from "../context/authcontext";

import PageHeader from "../components/pageheader";
import SearchInput from "../components/searchinput";
import SearchableSelect from "../components/searchableselect";
import ActionButtons from "../components/actionbuttons";

function Appointments() {
  const { user } = useContext(AuthContext);

  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const [editTarget, setEditTarget] = useState(null);
  const [editForm, setEditForm] = useState({
    patientId: "",
    doctorId: "",
    date: "",
    time: "",
    notes: "",
  });

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

  const token = localStorage.getItem("accessToken");

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

  const closeEdit = () => {
    setEditTarget(null);
    setEditForm({
      patientId: "",
      doctorId: "",
      date: "",
      time: "",
      notes: "",
    });
    setError("");
  };

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
  }, [token]);

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

  const parseAvailability = (doctor) => {
    if (!doctor?.availability) return null;

    if (typeof doctor.availability === "string") {
      try {
        return JSON.parse(doctor.availability);
      } catch {
        return null;
      }
    }
    return doctor.availability;
  };

  const getDayAvailability = (availability, weekdayLower) => {
    if (!availability) return null;

    return (
      availability[weekdayLower] ||
      availability[weekdayLower.toUpperCase()] ||
      availability[weekdayLower.charAt(0).toUpperCase() + weekdayLower.slice(1)] ||
      null
    );
  };

  const generateTimeSlotsFor = (doctorId, date) => {
    if (!doctorId || !date) return [];

    const selectedDoctor = doctors.find((d) => d.id === Number(doctorId));
    const availability = parseAvailability(selectedDoctor);
    if (!availability) return [];

    const weekday = getWeekdayKey(date);
    const dayAvailability = getDayAvailability(availability, weekday);
    if (!dayAvailability) return [];

    const { start, end } = dayAvailability || {};
    if (!start || !end) return [];

    const slots = [];
    const startDate = new Date(`${date}T${start}`);
    const endDate = new Date(`${date}T${end}`);

    if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime()))
      return [];

    while (startDate < endDate) {
      const hours = startDate.getHours().toString().padStart(2, "0");
      const mins = startDate.getMinutes().toString().padStart(2, "0");
      slots.push(`${hours}:${mins}`);
      startDate.setMinutes(startDate.getMinutes() + 30);
    }

    return slots;
  };

  const createTimeSlots = useMemo(() => {
    return generateTimeSlotsFor(form.doctorId, form.date);
  }, [form.doctorId, form.date, doctors]);

  const editTimeSlots = useMemo(() => {
    return generateTimeSlotsFor(editForm.doctorId, editForm.date);
  }, [editForm.doctorId, editForm.date, doctors]);

  const isCreateDoctorOffDay = Boolean(
    form.doctorId && form.date && createTimeSlots.length === 0
  );

  const isEditDoctorOffDay = Boolean(
    editForm.doctorId &&
      editForm.date &&
      editTimeSlots.length === 0 &&
      (editForm.doctorId !== String(editTarget?.doctor?.id) ||
        editForm.date !== new Date(editTarget?.dateTime).toISOString().slice(0, 10))
  );

  const isPastDateTime = (date, time) => {
    if (!date || !time) return false;
    const selected = new Date(`${date}T${time}`);
    if (Number.isNaN(selected.getTime())) return false;
    return selected < new Date();
  };

  const isCreatePast = isPastDateTime(form.date, form.time);
  const isEditPast = isPastDateTime(editForm.date, editForm.time);

  useEffect(() => {
    setForm((prev) => ({ ...prev, time: "" }));
    setError("");
  }, [form.doctorId, form.date]);

  useEffect(() => {
    setEditForm((prev) => ({ ...prev, time: "" }));
    setError("");
  }, [editForm.doctorId, editForm.date]);

  const isSlotBlockedFor = (
    { doctorId, patientId, date, slot },
    excludeAppointmentId = null
  ) => {
    if (!doctorId || !date || !slot) return false;

    const selected = new Date(`${date}T${slot}`);
    if (Number.isNaN(selected.getTime())) return false;

    return appointments.some((appt) => {
      if (excludeAppointmentId && appt.id === excludeAppointmentId) return false;
      if (appt.status === "CANCELLED") return false;

      const apptTime = new Date(appt.dateTime);
      const diffMin = Math.abs(apptTime - selected) / (1000 * 60);

      const doctorMatch = appt.doctor?.id === Number(doctorId);
      const patientMatch = patientId ? appt.patient?.id === Number(patientId) : false;

      return diffMin < 30 && (doctorMatch || patientMatch);
    });
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setError("");

    if (!form.patientId || !form.doctorId || !form.date) {
      setError("Please complete all required fields");
      return;
    }

    if (isCreateDoctorOffDay) {
      setError("This doctor is not available on the selected day.");
      return;
    }

    if (!form.time) {
      setError("Please select a valid available time.");
      return;
    }

    if (isCreatePast) {
      setError("Cannot set appointment in the past.");
      return;
    }

    const blocked = isSlotBlockedFor({
      doctorId: form.doctorId,
      patientId: form.patientId,
      date: form.date,
      slot: form.time,
    });

    if (blocked) {
      setError("This slot is blocked (doctor or patient has a nearby appointment).");
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

      setAppointments((prev) => [...prev, response.data.appointment || response.data]);

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
    setError("");
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
    setError("");

    try {
      await axios.delete(
        `http://localhost:5000/api/appointments/${deleteTarget.id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setAppointments((prev) => prev.filter((a) => a.id !== deleteTarget.id));
      setSuccessMessage("Appointment deleted successfully");
      setDeleteTarget(null);
    } catch {
      setError("Failed to delete appointment");
    }
  };

  const openEdit = (appt) => {
    setError("");
    setEditTarget(appt);

    const dt = new Date(appt.dateTime);
    const date = dt.toISOString().slice(0, 10);

    const hh = dt.getHours().toString().padStart(2, "0");
    const mm = dt.getMinutes().toString().padStart(2, "0");
    const time = `${hh}:${mm}`;

    setEditForm({
      patientId: appt.patient?.id || "",
      doctorId: appt.doctor?.id || "",
      date,
      time,
      notes: appt.notes || "",
    });
  };

  const handleEditSave = async (e) => {
    e.preventDefault();
    if (!editTarget) return;
    setError("");

    if (!editForm.patientId || !editForm.doctorId || !editForm.date) {
      setError("Please complete all required fields");
      return;
    }

    if (isEditDoctorOffDay) {
      setError("This doctor is not available on the selected day.");
      return;
    }

    if (!editForm.time) {
      setError("Please select a valid available time.");
      return;
    }

    if (isEditPast) {
      setError("Cannot set appointment in the past.");
      return;
    }

    const blocked = isSlotBlockedFor(
      {
        doctorId: editForm.doctorId,
        patientId: editForm.patientId,
        date: editForm.date,
        slot: editForm.time,
      },
      editTarget.id
    );

    if (blocked) {
      setError("This slot is blocked (doctor or patient has a nearby appointment).");
      return;
    }

    try {
      const res = await axios.put(
        `http://localhost:5000/api/appointments/${editTarget.id}`,
        {
          patientId: editForm.patientId,
          doctorId: editForm.doctorId,
          notes: editForm.notes,
          dateTime: `${editForm.date}T${editForm.time}`,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const updated = res.data.appointment || res.data;

      setAppointments((prev) =>
        prev.map((a) => (a.id === editTarget.id ? updated : a))
      );
      setSuccessMessage("Appointment updated successfully");
      closeEdit();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update appointment");
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
      grouped[date].sort((a, b) => new Date(a.dateTime) - new Date(b.dateTime));
    });

    return grouped;
  }, [filtered]);

  const getStatusColor = (status) => {
    switch (status) {
      case "PENDING":
        return "bg-yellow-100 text-yellow-700";
      case "APPROVED":
        return "bg-blue-100 text-blue-700";
      case "COMPLETED":
        return "bg-green-100 text-green-700";
      case "CANCELLED":
        return "bg-red-100 text-red-700";
      default:
        return "bg-gray-100 text-gray-600";
    }
  };

  const canEdit = user?.role === "ADMIN" || user?.role === "STAFF";

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
              onSelect={(p) => {
                setError("");
                setForm({ ...form, patientId: p.id });
              }}
            />

            <SearchableSelect
              label="Doctor"
              options={doctors}
              selectedId={form.doctorId}
              placeholder="Search doctor..."
              getLabel={(d) => `Dr. ${d.firstName} ${d.lastName}`}
              onSelect={(d) => {
                setError("");
                setForm({ ...form, doctorId: d.id });
              }}
            />

            <div>
              <input
                type="date"
                value={form.date}
                onChange={(e) => {
                  setError("");
                  setForm({ ...form, date: e.target.value });
                }}
                className="w-full rounded-xl px-4 py-2 border border-gray-200 focus:ring-2 focus:ring-teal-200 outline-none transition"
              />
              {form.doctorId && form.date && isCreateDoctorOffDay && (
                <div className="text-sm text-red-500 mt-2">
                  This doctor is not available on this day.
                </div>
              )}
            </div>

            <div>
              <select
                disabled={isCreateDoctorOffDay}
                value={form.time}
                onChange={(e) => {
                  setError("");
                  setForm({ ...form, time: e.target.value });
                }}
                className="w-full rounded-xl px-4 py-2 border border-gray-200 focus:ring-2 focus:ring-teal-200 outline-none transition"
              >
                <option value="">Select Time</option>
                {createTimeSlots.map((slot) => (
                  <option
                    key={slot}
                    value={slot}
                    disabled={isSlotBlockedFor({
                      doctorId: form.doctorId,
                      patientId: form.patientId,
                      date: form.date,
                      slot,
                    })}
                  >
                    {slot}
                  </option>
                ))}
              </select>

              {form.date && form.time && isCreatePast && (
                <div className="text-sm text-red-500 mt-2">
                  Cannot set appointment in the past.
                </div>
              )}
            </div>

            <textarea
              placeholder="Notes (optional)"
              value={form.notes}
              onChange={(e) => {
                setError("");
                setForm({ ...form, notes: e.target.value });
              }}
              className="md:col-span-2 rounded-xl px-4 py-2 border border-gray-200 focus:ring-2 focus:ring-teal-200 outline-none resize-none transition"
            />

            <button
              type="submit"
              disabled={isCreatePast}
              className={`md:col-span-2 py-2.5 rounded-xl transition ${
                isCreatePast
                  ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                  : "bg-teal-500 text-white hover:bg-teal-600"
              }`}
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
                        {appointment.patient.firstName}{" "}
                        {appointment.patient.lastName}
                      </p>

                      <p className="text-sm text-gray-500">
                        Dr. {appointment.doctor.firstName}{" "}
                        {appointment.doctor.lastName}
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
                      <span
                        className={`px-3 py-1 text-xs rounded-full font-medium ${getStatusColor(
                          appointment.status
                        )}`}
                      >
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

                     {canEdit && (
  <ActionButtons
    onEdit={() => openEdit(appointment)}
    onDelete={() => setDeleteTarget(appointment)}
    showDelete={user?.role === "ADMIN"}
  />
)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
      </div>

      {editTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20">
          <div className="bg-white w-[520px] rounded-3xl p-8 shadow-2xl animate-[fadeIn_.2s_ease-out]">
            <div className="mb-6">
              <h3 className="text-xl font-semibold text-gray-800 mb-2">
                Edit Appointment
              </h3>
              <p className="text-sm text-gray-500 leading-relaxed">
                Update details for this appointment.
              </p>
            </div>

            <form
              onSubmit={handleEditSave}
              className="grid grid-cols-1 md:grid-cols-2 gap-6"
            >
              <SearchableSelect
                label="Patient"
                options={patients}
                selectedId={editForm.patientId}
                placeholder="Search patient..."
                getLabel={(p) => `${p.firstName} ${p.lastName}`}
                onSelect={(p) => {
                  setError("");
                  setEditForm((prev) => ({ ...prev, patientId: p.id }));
                }}
              />

              <SearchableSelect
                label="Doctor"
                options={doctors}
                selectedId={editForm.doctorId}
                placeholder="Search doctor..."
                getLabel={(d) => `Dr. ${d.firstName} ${d.lastName}`}
                onSelect={(d) => {
                  setError("");
                  setEditForm((prev) => ({ ...prev, doctorId: d.id }));
                }}
              />

              <div>
                <input
                  type="date"
                  value={editForm.date}
                  onChange={(e) => {
                    setError("");
                    setEditForm((prev) => ({ ...prev, date: e.target.value }));
                  }}
                  className="w-full rounded-xl px-4 py-2 border border-gray-200 focus:ring-2 focus:ring-teal-200 outline-none transition"
                />
                {editForm.doctorId && editForm.date && isEditDoctorOffDay && (
                  <div className="text-sm text-red-500 mt-2">
                    This doctor is not available on this day.
                  </div>
                )}
              </div>

              <div>
                <select
                  disabled={isEditDoctorOffDay}
                  value={editForm.time}
                  onChange={(e) => {
                    setError("");
                    setEditForm((prev) => ({ ...prev, time: e.target.value }));
                  }}
                  className="w-full rounded-xl px-4 py-2 border border-gray-200 focus:ring-2 focus:ring-teal-200 outline-none transition"
                >
                  <option value="">Select Time</option>
                  {editTimeSlots.map((slot) => (
                    <option
                      key={slot}
                      value={slot}
                      disabled={isSlotBlockedFor(
                        {
                          doctorId: editForm.doctorId,
                          patientId: editForm.patientId,
                          date: editForm.date,
                          slot,
                        },
                        editTarget.id
                      )}
                    >
                      {slot}
                    </option>
                  ))}
                </select>

                {editForm.date && editForm.time && isEditPast && (
                  <div className="text-sm text-red-500 mt-2">
                    Cannot set appointment in the past.
                  </div>
                )}
              </div>

              <textarea
                placeholder="Notes (optional)"
                value={editForm.notes}
                onChange={(e) => {
                  setError("");
                  setEditForm((prev) => ({ ...prev, notes: e.target.value }));
                }}
                className="md:col-span-2 rounded-xl px-4 py-2 border border-gray-200 focus:ring-2 focus:ring-teal-200 outline-none resize-none transition"
              />

              <div className="md:col-span-2 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={closeEdit}
                  className="px-5 py-2 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 transition"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={isEditPast}
                  className={`px-5 py-2 rounded-xl transition ${
                    isEditPast
                      ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                      : "bg-teal-500 text-white hover:bg-teal-600"
                  }`}
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

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