import { useEffect, useState, useContext } from "react";
import axios from "axios";
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

  const [scheduleDoctor, setScheduleDoctor] = useState(null);
  const [availability, setAvailability] = useState({});

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    specialization: "",
    phone: "",
    email: "",
  });

  const token = localStorage.getItem("accessToken");

  /* ================= FETCH ================= */

  const fetchDoctors = async () => {
    const res = await axios.get("http://localhost:5000/api/doctors", {
      headers: { Authorization: `Bearer ${token}` },
    });
    setDoctors(res.data);
  };

  useEffect(() => {
    fetchDoctors();
  }, []);

  /* ================= HANDLE FORM ================= */

  const handleChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleDelete = async (id) => {
    await axios.delete(`http://localhost:5000/api/doctors/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    fetchDoctors();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (editingDoctor) {
      await axios.put(
        `http://localhost:5000/api/doctors/${editingDoctor.id}`,
        form,
        { headers: { Authorization: `Bearer ${token}` } }
      );
    } else {
      await axios.post("http://localhost:5000/api/doctors", form, {
        headers: { Authorization: `Bearer ${token}` },
      });
    }

    setForm({
      firstName: "",
      lastName: "",
      specialization: "",
      phone: "",
      email: "",
    });

    setEditingDoctor(null);
    setFormOpen(false);
    fetchDoctors();
  };

  /* ================= SCHEDULE ================= */

  useEffect(() => {
    if (scheduleDoctor?.availability) {
      setAvailability(JSON.parse(scheduleDoctor.availability));
    } else if (scheduleDoctor) {
      setAvailability({
        MONDAY: null,
        TUESDAY: null,
        WEDNESDAY: null,
        THURSDAY: null,
        FRIDAY: null,
      });
    }
  }, [scheduleDoctor]);

  const handleSaveSchedule = async () => {
    await axios.put(
      `http://localhost:5000/api/doctors/${scheduleDoctor.id}`,
      {
        availability: JSON.stringify(availability),
      },
      { headers: { Authorization: `Bearer ${token}` } }
    );

    setScheduleDoctor(null);
    fetchDoctors();
  };

  const filtered = doctors.filter((d) =>
    `${d.firstName} ${d.lastName} ${d.specialization} ${d.email || ""}`
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-8">
      <PageHeader title="Doctors" />

      {user?.role === "ADMIN" && (
        <div className="flex justify-end mb-6">
          <button
            onClick={() => {
              setEditingDoctor(null);
              setFormOpen(!formOpen);
            }}
            className="bg-teal-500 text-white px-5 py-2 rounded-lg hover:bg-teal-600 transition"
          >
            {formOpen ? "Close" : "+ Add Doctor"}
          </button>
        </div>
      )}

      {formOpen && (
        <DoctorFormCard
          editingDoctor={editingDoctor}
          form={form}
          onChange={handleChange}
          onCancel={() => {
            setFormOpen(false);
            setEditingDoctor(null);
          }}
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
        <thead className="bg-gray-50 text-gray-600">
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
              <td className="p-4 flex gap-2">
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
                    setFormOpen(true);
                  }}
                  onDelete={() => handleDelete(doctor.id)}
                  showDelete={user?.role === "ADMIN"}
                />

                <button
                  onClick={() => setScheduleDoctor(doctor)}
                  className="text-sm px-3 py-1 rounded bg-blue-50 text-blue-600 hover:bg-blue-100 transition"
                >
                  Manage Schedule
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </TableWrapper>

      {/* ===== Schedule Modal ===== */}

      {scheduleDoctor && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/20 z-50">
          <div className="bg-white w-[520px] rounded-3xl p-8 shadow-2xl">

            <h3 className="text-xl font-semibold mb-6">
              Manage Schedule -  Dr. {scheduleDoctor.lastName}
            </h3>

            <div className="space-y-4">
              {["Monday","Tuesday","Wednesday","Thursday","Friday"].map(day => (
                <div key={day} className="flex items-center justify-between">

                  <span className="text-sm font-medium text-gray-700 w-28">
                    {day}
                  </span>

                  {availability[day] ? (
                    <div className="flex gap-2 items-center">
                      <input
                        type="time"
                        value={availability[day].start}
                        onChange={(e) =>
                          setAvailability({
                            ...availability,
                            [day]: {
                              ...availability[day],
                              start: e.target.value
                            }
                          })
                        }
                        className="border rounded px-2 py-1 text-sm"
                      />

                      <span>-</span>

                      <input
                        type="time"
                        value={availability[day].end}
                        onChange={(e) =>
                          setAvailability({
                            ...availability,
                            [day]: {
                              ...availability[day],
                              end: e.target.value
                            }
                          })
                        }
                        className="border rounded px-2 py-1 text-sm"
                      />

                      <button
                        onClick={() =>
                          setAvailability({ ...availability, [day]: null })
                        }
                        className="text-xs text-red-500"
                      >
                        OFF
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() =>
                        setAvailability({
                          ...availability,
                          [day]: { start: "09:00", end: "17:00" }
                        })
                      }
                      className="text-sm text-blue-500"
                    >
                      Set Hours
                    </button>
                  )}

                </div>
              ))}
            </div>

            <div className="flex justify-end gap-3 mt-8">
              <button
                onClick={() => setScheduleDoctor(null)}
                className="px-4 py-2 border rounded-xl"
              >
                Cancel
              </button>

              <button
                onClick={handleSaveSchedule}
                className="px-4 py-2 bg-teal-500 text-white rounded-xl hover:bg-teal-600 transition"
              >
                Save
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}

export default Doctors;