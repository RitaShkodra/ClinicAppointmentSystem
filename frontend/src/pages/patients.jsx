import { useEffect, useState, useContext } from "react";
import axios from "axios";
import { AuthContext } from "../context/authcontext";

function Patients() {
  const { user } = useContext(AuthContext);

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
      const res = await axios.get(
        "http://localhost:5000/api/patients",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
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
          { headers: { Authorization: `Bearer ${token}` } }
        );
      } else {
        await axios.post(
          "http://localhost:5000/api/patients",
          form,
          { headers: { Authorization: `Bearer ${token}` } }
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
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchPatients();
    } catch (err) {
      console.error("Failed to delete patient");
    }
  };

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
    <div className="p-8">

      {/* HEADER */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-semibold text-gray-800">
            Patients
          </h1>
          <div className="w-12 h-0.5 bg-teal-500 mt-2 rounded"></div>
        </div>

        <button
          onClick={() => {
            setFormOpen(!formOpen);
            setEditingPatient(null);
          }}
          className="bg-teal-500 text-white px-4 py-2 text-sm rounded-md hover:bg-teal-600 transition"
        >
          {formOpen ? "Close" : "+ Add Patient"}
        </button>
      </div>

      {/* FORM */}
      {formOpen && (
        <div className="bg-white rounded-xl shadow-sm p-6 mb-8 max-w-3xl">

          <h2 className="text-lg font-medium text-gray-700 mb-6">
            {editingPatient ? "Edit Patient" : "Add New Patient"}
          </h2>

          <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-5">

            <div className="flex flex-col">
              <label className="text-xs text-gray-400 mb-1">First Name</label>
              <input
                type="text"
                name="firstName"
                value={form.firstName}
                onChange={handleChange}
                className="bg-gray-50 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-teal-400 focus:outline-none transition"
                required
              />
            </div>

            <div className="flex flex-col">
              <label className="text-xs text-gray-400 mb-1">Last Name</label>
              <input
                type="text"
                name="lastName"
                value={form.lastName}
                onChange={handleChange}
                className="bg-gray-50 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-teal-400 focus:outline-none transition"
                required
              />
            </div>

            <div className="flex flex-col">
              <label className="text-xs text-gray-400 mb-1">Phone</label>
              <input
                type="text"
                name="phone"
                value={form.phone}
                onChange={handleChange}
                className="bg-gray-50 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-teal-400 focus:outline-none transition"
                required
              />
            </div>

            <div className="flex flex-col">
              <label className="text-xs text-gray-400 mb-1">Email</label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                className="bg-gray-50 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-teal-400 focus:outline-none transition"
              />
            </div>

            <div className="col-span-2 flex justify-end gap-3 mt-4">
              <button
                type="button"
                onClick={() => {
                  setFormOpen(false);
                  setEditingPatient(null);
                }}
                className="px-4 py-2 text-sm rounded-md text-gray-600 hover:text-gray-800 transition"
              >
                Cancel
              </button>

              <button
                type="submit"
                className="px-5 py-2 text-sm rounded-md bg-teal-500 text-white hover:bg-teal-600 transition"
              >
                {editingPatient ? "Update" : "Save"}
              </button>
            </div>

          </form>
        </div>
      )}

      {/* SEARCH */}
      <div className="flex justify-between items-center mb-6">
        <div className="relative w-72">
          <input
            type="text"
            placeholder="Search patients..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-gray-50 rounded-md text-sm focus:ring-2 focus:ring-teal-400 focus:outline-none transition"
          />
          <span className="absolute left-3 top-2 text-gray-400 text-sm">
            🔎
          </span>
        </div>

        <p className="text-sm text-gray-400">
          Showing {filteredPatients.length} of {patients.length}
        </p>
      </div>

      {/* TABLE */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-500">
            <tr>
              <th className="px-6 py-3 text-left font-medium">First Name</th>
              <th className="px-6 py-3 text-left font-medium">Last Name</th>
              <th className="px-6 py-3 text-left font-medium">Phone</th>
              <th className="px-6 py-3 text-left font-medium">Email</th>
              <th className="px-6 py-3 text-left font-medium">Actions</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-100">
            {filteredPatients.map((patient) => (
              <tr key={patient.id} className="hover:bg-gray-50 transition">
                <td className="px-6 py-4">{patient.firstName}</td>
                <td className="px-6 py-4">{patient.lastName}</td>
                <td className="px-6 py-4">{patient.phone}</td>
                <td className="px-6 py-4">{patient.email}</td>
               <td className="px-6 py-4 flex gap-3">

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
    className="bg-teal-50 text-teal-700 px-3 py-1.5 rounded-md text-xs font-medium hover:bg-teal-100 transition"
  >
    Edit
  </button>

  {user?.role === "ADMIN" && (
    <button
      onClick={() => handleDelete(patient.id)}
      className="bg-red-50 text-red-600 px-3 py-1.5 rounded-md text-xs font-medium hover:bg-red-100 transition"
    >
      Delete
    </button>
  )}

</td>

              </tr>
            ))}

            {filteredPatients.length === 0 && (
              <tr>
                <td colSpan="5" className="text-center py-8 text-gray-400">
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
