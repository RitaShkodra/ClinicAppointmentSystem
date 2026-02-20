import { useEffect, useState, useContext, useMemo } from "react";
import axios from "axios";
import { AuthContext } from "../context/authcontext";

import PageHeader from "../components/pageheader";
import SearchInput from "../components/searchinput";
import SearchableSelect from "../components/searchableselect";

function Appointments() {
  const { user } = useContext(AuthContext);

  const [showCreate, setShowCreate] = useState(false);

  const [appointments, setAppointments] = useState([]);
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);

  const [searchTerm, setSearchTerm] = useState("");

  const [form, setForm] = useState({
    patientId: "",
    doctorId: "",
    dateTime: "",
    notes: "",
  });

  const token = localStorage.getItem("accessToken");

  /* ================= FETCH DATA ================= */

  const fetchAppointments = async () => {
    const res = await axios.get(
      "http://localhost:5000/api/appointments",
      { headers: { Authorization: `Bearer ${token}` } }
    );
    setAppointments(res.data);
  };

  const fetchPatients = async () => {
    const res = await axios.get(
      "http://localhost:5000/api/patients",
      { headers: { Authorization: `Bearer ${token}` } }
    );
    setPatients(res.data);
  };

  const fetchDoctors = async () => {
    const res = await axios.get(
      "http://localhost:5000/api/doctors",
      { headers: { Authorization: `Bearer ${token}` } }
    );
    setDoctors(res.data);
  };

  useEffect(() => {
    fetchAppointments();
    fetchPatients();
    fetchDoctors();
  }, []);

  /* ================= CREATE ================= */

  const handleCreate = async (e) => {
    e.preventDefault();

    await axios.post(
      "http://localhost:5000/api/appointments",
      form,
      { headers: { Authorization: `Bearer ${token}` } }
    );

    setForm({
      patientId: "",
      doctorId: "",
      dateTime: "",
      notes: "",
    });

    setShowCreate(false);
    fetchAppointments();
  };

  /* ================= UPDATE / DELETE ================= */

  const handleStatusChange = async (id, status) => {
    await axios.patch(
      `http://localhost:5000/api/appointments/${id}/status`,
      { status },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    fetchAppointments();
  };

  const handleDelete = async (id) => {
    await axios.delete(
      `http://localhost:5000/api/appointments/${id}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    fetchAppointments();
  };

  /* ================= FILTERING ================= */

  const filtered = useMemo(() => {
    return appointments.filter((a) =>
      `${a.patient.firstName} ${a.patient.lastName} ${a.doctor.firstName} ${a.doctor.lastName}`
        .toLowerCase()
        .includes(searchTerm.toLowerCase())
    );
  }, [appointments, searchTerm]);

  const groupedAppointments = useMemo(() => {
    return filtered.reduce((acc, appt) => {
      const dateKey = new Date(appt.dateTime).toDateString();
      if (!acc[dateKey]) acc[dateKey] = [];
      acc[dateKey].push(appt);
      return acc;
    }, {});
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

  return (
    <div className="p-8">

      <PageHeader title="Appointments Calendar" />

      {/* ================= CREATE TOGGLE ================= */}
      <div className="mb-8 flex justify-between items-center">
        <h2 className="text-lg font-semibold text-gray-800">
          Appointments
        </h2>

        <button
          onClick={() => setShowCreate(!showCreate)}
          className="bg-teal-500 text-white px-4 py-2 rounded-lg text-sm hover:bg-teal-600 transition"
        >
          {showCreate ? "Cancel" : "+ New Appointment"}
        </button>
      </div>

      {/* ================= CREATE FORM ================= */}
      {showCreate && (
        <div className="mb-10 bg-white border border-gray-100 rounded-xl shadow-sm p-6">

          <form onSubmit={handleCreate} className="grid grid-cols-1 md:grid-cols-2 gap-5">

            <SearchableSelect
              label="Patient"
              options={patients}
              selectedId={form.patientId}
              placeholder="Search patient..."
              getLabel={(p) => `${p.firstName} ${p.lastName}`}
              onSelect={(p) =>
                setForm({ ...form, patientId: p.id })
              }
            />

            <SearchableSelect
              label="Doctor"
              options={doctors}
              selectedId={form.doctorId}
              placeholder="Search doctor..."
              getLabel={(d) => `Dr. ${d.firstName} ${d.lastName}`}
              onSelect={(d) =>
                setForm({ ...form, doctorId: d.id })
              }
            />

            <div className="flex flex-col">
              <label className="text-xs text-gray-500 mb-1">
                Date & Time
              </label>
              <input
                type="datetime-local"
                required
                value={form.dateTime}
                onChange={(e) =>
                  setForm({ ...form, dateTime: e.target.value })
                }
                className="border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-400 transition"
              />
            </div>

            <div className="flex flex-col">
              <label className="text-xs text-gray-500 mb-1">
                Notes
              </label>
              <textarea
                rows="1"
                value={form.notes}
                onChange={(e) =>
                  setForm({ ...form, notes: e.target.value })
                }
                className="border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-400 transition resize-none"
              />
            </div>

            <div className="md:col-span-2">
              <button
                type="submit"
                className="bg-teal-500 text-white px-6 py-2 rounded-lg font-medium hover:bg-teal-600 transition shadow-sm"
              >
                Create Appointment
              </button>
            </div>

          </form>
        </div>
      )}

      {/* ================= SEARCH ================= */}
      <div className="flex justify-between items-center mb-8">
        <SearchInput
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search by patient or doctor..."
        />

        <p className="text-sm text-gray-500">
          Showing {filtered.length} of {appointments.length} appointments
        </p>
      </div>

      {/* ================= CALENDAR ================= */}
      <div className="space-y-10">

        {Object.entries(groupedAppointments)
          .sort((a, b) => new Date(a[0]) - new Date(b[0]))
          .map(([date, appts]) => (

            <div key={date}>

              <h2 className="text-lg font-semibold text-gray-700 mb-4 border-b pb-2">
                {new Date(date).toLocaleDateString(undefined, {
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
                    className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 flex justify-between items-center hover:shadow-md transition"
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
                        <p className="text-sm text-gray-600 mt-2 bg-gray-50 px-3 py-1 rounded">
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
                        className="text-sm border border-gray-200 rounded px-2 py-1 bg-white"
                      >
                        <option value="PENDING">PENDING</option>
                        <option value="APPROVED">APPROVED</option>
                        <option value="COMPLETED">COMPLETED</option>
                        <option value="CANCELLED">CANCELLED</option>
                      </select>

                      {user?.role === "ADMIN" && (
                        <button
                          onClick={() => handleDelete(appointment.id)}
                          className="bg-red-100 text-red-600 px-3 py-1 rounded hover:bg-red-200 transition text-sm"
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

    </div>
  );
}

export default Appointments;