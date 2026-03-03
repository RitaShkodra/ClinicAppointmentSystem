import { useEffect, useState, useContext } from "react";
import api from "../utils/api";
import { AuthContext } from "../context/authcontext";

import PageHeader from "../components/pageheader";
import SearchInput from "../components/searchinput";
import TableWrapper from "../components/tablewrapper";
import ActionButtons from "../components/actionbuttons";
import DoctorFormCard from "../components/doctorcard";

function Doctors() {
  const { user } = useContext(AuthContext);

  const [doctors, setDoctors] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [editingDoctor, setEditingDoctor] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [scheduleDoctor, setScheduleDoctor] = useState(null);
  const [availability, setAvailability] = useState({});

  const [successMessage, setSuccessMessage] = useState("");
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    specialization: "",
    phone: "",
    email: "",
  });

  /* =========================
     HANDLE INPUT CHANGE
  ========================= */
  const handleChange = (e) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const fetchDoctors = async () => {
    try {
      const res = await api.get("/doctors");
      setDoctors(res.data);
    } catch {
      setError("Failed to load doctors");
    }
  };

  useEffect(() => {
    fetchDoctors();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      if (editingDoctor) {
        await api.put(`/doctors/${editingDoctor.id}`, form);
      } else {
        await api.post("/doctors", form);
      }

      fetchDoctors();
      setFormOpen(false);
      setEditingDoctor(null);
      setSuccessMessage("Operation successful");
    } catch {
      setError("Operation failed");
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;

    try {
      await api.delete(`/doctors/${deleteTarget.id}`);
      fetchDoctors();
      setDeleteTarget(null);
      setSuccessMessage("Doctor deleted successfully");
    } catch {
      setError("Failed to delete doctor");
    }
  };

  const handleSaveSchedule = async () => {
    try {
      await api.put(`/doctors/${scheduleDoctor.id}`, {
        availability: JSON.stringify(availability),
      });

      setSuccessMessage("Schedule updated successfully");
      setScheduleDoctor(null);
      fetchDoctors();
    } catch {
      setError("Failed to update schedule");
    }
  };

  const filtered = doctors.filter((d) =>
    `${d.firstName} ${d.lastName} ${d.specialization} ${d.email || ""}`
      .toLowerCase()
      .includes(searchTerm.toLowerCase()),
  );

  return (
    <div className="p-8">
      <PageHeader title="Doctors" />

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

      {user?.role === "ADMIN" && (
        <div className="flex justify-end mb-6">
          <button
            onClick={() => {
              setEditingDoctor(null);
              setForm({
                firstName: "",
                lastName: "",
                specialization: "",
                phone: "",
                email: "",
              });
              setFormOpen(!formOpen);
            }}
            className="text-white px-5 py-2 rounded-lg transition shadow-sm"
            style={{ backgroundColor: "#579ec0" }}
          >
            {formOpen ? "Close" : "+ Add Doctor"}
          </button>
        </div>
      )}

      {formOpen && (
        <DoctorFormCard
          editingDoctor={null}
          form={form}
          onChange={handleChange}
          onCancel={() => setFormOpen(false)}
          onSubmit={handleSubmit}
        />
      )}

      <div className="flex justify-between items-center mb-6">
        <SearchInput
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search doctors..."
        />
        <p className="text-sm text-gray-500">
          Showing {filtered.length} of {doctors.length} doctors
        </p>
      </div>

      <TableWrapper>
        <thead className="bg-gray-100 text-gray-700 border-b border-gray-200">
          <tr>
            <th className="p-4 text-left">First Name</th>
            <th className="p-4 text-left">Last Name</th>
            <th className="p-4 text-left">Specialization</th>
            <th className="p-4 text-left">Phone</th>
            <th className="p-4 text-left">Email</th>
            <th className="p-4 text-left">Actions</th>
          </tr>
        </thead>

        <tbody>
          {filtered.map((doctor) => (
            <tr key={doctor.id} className="hover:bg-gray-50">
              <td className="p-4">{doctor.firstName}</td>
              <td className="p-4">{doctor.lastName}</td>
              <td className="p-4">{doctor.specialization}</td>
              <td className="p-4">{doctor.phone}</td>
              <td className="p-4">{doctor.email}</td>
              <td className="p-4">
                <div className="flex items-center gap-3">
                  <ActionButtons
                    onEdit={() => {
                      setEditingDoctor(doctor);
                      setForm({
                        firstName: doctor.firstName,
                        lastName: doctor.lastName,
                        specialization: doctor.specialization,
                        phone: doctor.phone || "",
                        email: doctor.email || "",
                      });
                    }}
                    onDelete={() => setDeleteTarget(doctor)}
                    showDelete={user?.role === "ADMIN"}
                  />

                  <button
                    onClick={() => {
                      setScheduleDoctor(doctor);
                      setAvailability(
                        doctor.availability
                          ? JSON.parse(doctor.availability)
                          : {},
                      );
                    }}
                    className="text-sm px-3 py-1 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition"
                  >
                    Manage Schedule
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </TableWrapper>

      {/* EDIT MODAL */}
      {editingDoctor && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/20 z-50">
          <div className="bg-white w-[520px] rounded-3xl p-8 shadow-2xl">
            <h3 className="text-xl font-semibold mb-6">Edit Doctor</h3>
            <DoctorFormCard
              editingDoctor={editingDoctor}
              form={form}
              onChange={handleChange}
              onCancel={() => setEditingDoctor(null)}
              onSubmit={handleSubmit}
            />
          </div>
        </div>
      )}

      {/* DELETE MODAL */}
      {deleteTarget && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/20 z-50">
          <div className="bg-white w-[420px] rounded-3xl p-8 shadow-2xl">
            <h3 className="text-xl font-semibold mb-4">Delete Doctor</h3>
            <p className="text-sm text-gray-500 mb-6">
              Are you sure you want to delete Dr. {deleteTarget.lastName}?
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setDeleteTarget(null)}
                className="px-5 py-2 rounded-xl border border-gray-200"
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

      {/* SCHEDULE MODAL */}
      {scheduleDoctor && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/20 z-50">
          <div className="bg-white w-[560px] rounded-3xl p-8 shadow-2xl">
            <h3 className="text-xl font-semibold mb-6">
              Manage Schedule – Dr. {scheduleDoctor.lastName}
            </h3>

            <div className="space-y-5">
              {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"].map(
                (day) => (
                  <div key={day} className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700 w-28">
                      {day}
                    </span>

                    {availability[day] ? (
                      <div className="flex gap-3 items-center">
                        <input
                          type="time"
                          value={availability[day].start}
                          onChange={(e) =>
                            setAvailability({
                              ...availability,
                              [day]: {
                                ...availability[day],
                                start: e.target.value,
                              },
                            })
                          }
                          className="border border-gray-200 rounded-xl px-3 py-1.5 text-sm"
                        />
                        <span className="text-gray-400">–</span>
                        <input
                          type="time"
                          value={availability[day].end}
                          onChange={(e) =>
                            setAvailability({
                              ...availability,
                              [day]: {
                                ...availability[day],
                                end: e.target.value,
                              },
                            })
                          }
                          className="border border-gray-200 rounded-xl px-3 py-1.5 text-sm"
                        />
                        <button
                          onClick={() =>
                            setAvailability({ ...availability, [day]: null })
                          }
                          className="text-xs px-3 py-1 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition"
                        >
                          OFF
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() =>
                          setAvailability({
                            ...availability,
                            [day]: { start: "09:00", end: "17:00" },
                          })
                        }
                        className="text-sm px-3 py-1 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition"
                      >
                        Set Hours
                      </button>
                    )}
                  </div>
                ),
              )}
            </div>

            <div className="flex justify-end gap-3 mt-8">
              <button
                onClick={() => setScheduleDoctor(null)}
                className="px-5 py-2 rounded-xl border border-gray-200"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveSchedule}
                className="text-white px-5 py-2 rounded-xl"
                style={{ backgroundColor: "#579ec0" }}
              >
                Save Schedule
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Doctors;
