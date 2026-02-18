import { useEffect, useState } from "react";
import axios from "axios";

function Patients() {
  const [patients, setPatients] = useState([]);
  const [formOpen, setFormOpen] = useState(false);
  const [editingPatient, setEditingPatient] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    email: "",
  });

  const token = localStorage.getItem("accessToken");

  const fetchPatients = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/patients", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setPatients(res.data);
    } catch (err) {
      console.error("Failed to fetch patients");
    }
  };

  useEffect(() => {
    fetchPatients();
  }, []);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (editingPatient) {
        await axios.put(
          `http://localhost:5000/api/patients/${editingPatient.id}`,
          form,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
      } else {
        await axios.post(
          "http://localhost:5000/api/patients",
          form,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
      }

      setForm({
        firstName: "",
        lastName: "",
        phone: "",
        email: "",
      });

      setEditingPatient(null);
      setFormOpen(false);
      fetchPatients();
    } catch (err) {
      console.error("Save failed");
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(
        `http://localhost:5000/api/patients/${id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      fetchPatients();
    } catch (err) {
      console.error("Failed to delete patient");
    }
  };

  // 🔎 FILTER LOGIC
  const filteredPatients = patients.filter((patient) => {
    const fullName =
      `${patient.firstName} ${patient.lastName}`.toLowerCase();
    const phone = patient.phone?.toLowerCase() || "";
    const email = patient.email?.toLowerCase() || "";

    return (
      fullName.includes(searchTerm.toLowerCase()) ||
      phone.includes(searchTerm.toLowerCase()) ||
      email.includes(searchTerm.toLowerCase())
    );
  });

  return (
    <div className="p-6">

      {/* HEADER */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">
            Patients
          </h1>
          <div className="w-16 h-1 bg-teal-500 mt-2 rounded"></div>
        </div>

        <button
          onClick={() => {
            setFormOpen(!formOpen);
            setEditingPatient(null);
          }}
          className="bg-teal-500 text-white px-5 py-2 rounded-lg hover:bg-teal-600 transition"
        >
          {formOpen ? "Close" : "+ Add Patient"}
        </button>
      </div>

      {/* INLINE FORM */}
      {formOpen && (
        <div className="bg-white p-6 rounded-2xl shadow-md mb-6">
          <h2 className="text-lg font-semibold mb-4 text-gray-700">
            {editingPatient ? "Edit Patient" : "Add New Patient"}
          </h2>

          <form
            onSubmit={handleSubmit}
            className="grid grid-cols-2 gap-4"
          >
            <input
              type="text"
              name="firstName"
              placeholder="First Name"
              value={form.firstName}
              onChange={handleChange}
              className="border p-2 rounded-lg focus:ring-2 focus:ring-teal-400 outline-none"
              required
            />

            <input
              type="text"
              name="lastName"
              placeholder="Last Name"
              value={form.lastName}
              onChange={handleChange}
              className="border p-2 rounded-lg focus:ring-2 focus:ring-teal-400 outline-none"
              required
            />

            <input
              type="text"
              name="phone"
              placeholder="Phone"
              value={form.phone}
              onChange={handleChange}
              className="border p-2 rounded-lg focus:ring-2 focus:ring-teal-400 outline-none"
              required
            />

            <input
              type="email"
              name="email"
              placeholder="Email"
              value={form.email}
              onChange={handleChange}
              className="border p-2 rounded-lg focus:ring-2 focus:ring-teal-400 outline-none"
            />

            <div className="col-span-2 flex justify-end gap-3 mt-4">
              <button
                type="button"
                onClick={() => {
                  setFormOpen(false);
                  setEditingPatient(null);
                }}
                className="px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300"
              >
                Cancel
              </button>

              <button
                type="submit"
                className="px-4 py-2 rounded-lg bg-teal-500 text-white hover:bg-teal-600"
              >
                Save
              </button>
            </div>
          </form>
        </div>
      )}

      {/* SEARCH BAR */}
      <div className="flex justify-between items-center mb-4">
        <div className="relative w-72">
          <input
            type="text"
            placeholder="Search patients..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-400"
          />
          <span className="absolute left-3 top-2.5 text-gray-400">
            🔎
          </span>
        </div>

        <p className="text-sm text-gray-500">
          Showing {filteredPatients.length} of {patients.length} patients
        </p>
      </div>

      {/* TABLE */}
      <div className="bg-white rounded-2xl shadow-md overflow-hidden">
        <table className="w-full">
          <thead className="bg-teal-50">
            <tr>
              <th className="p-4 text-left text-gray-600">First Name</th>
              <th className="p-4 text-left text-gray-600">Last Name</th>
              <th className="p-4 text-left text-gray-600">Phone</th>
              <th className="p-4 text-left text-gray-600">Email</th>
              <th className="p-4 text-left text-gray-600">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredPatients.map((patient) => (
              <tr
                key={patient.id}
                className="border-t hover:bg-teal-50 transition"
              >
                <td className="p-4">{patient.firstName}</td>
                <td className="p-4">{patient.lastName}</td>
                <td className="p-4">{patient.phone}</td>
                <td className="p-4">{patient.email}</td>
                <td className="p-4 flex gap-3">
                  <button
                    onClick={() => {
                      setEditingPatient(patient);
                      setForm({
                        firstName: patient.firstName,
                        lastName: patient.lastName,
                        phone: patient.phone,
                        email: patient.email || "",
                      });
                      setFormOpen(true);
                    }}
                    className="bg-teal-100 text-teal-700 px-3 py-1 rounded hover:bg-teal-200 transition"
                  >
                    Edit
                  </button>

                  <button
                    onClick={() => handleDelete(patient.id)}
                    className="bg-red-100 text-red-600 px-3 py-1 rounded hover:bg-red-200 transition"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}

            {filteredPatients.length === 0 && (
              <tr>
                <td colSpan="5" className="text-center p-8 text-gray-400">
                  No patients found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Patients;
