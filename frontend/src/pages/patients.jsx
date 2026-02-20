import { useEffect, useState, useContext } from "react";
import axios from "axios";
import { AuthContext } from "../context/authcontext";

import PageHeader from "../components/pageheader";
import SearchInput from "../components/searchinput";
import TableWrapper from "../components/tablewrapper";
import ActionButtons from "../components/actionbuttons";
import PatientFormCard from "../components/patientcard";

function Patients() {
  const { user } = useContext(AuthContext);

  const [patients, setPatients] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [editingPatient, setEditingPatient] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const [successMessage, setSuccessMessage] = useState("");
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    email: "",
  });

  const token = localStorage.getItem("accessToken");

  useEffect(() => {
    fetchPatients();
  }, []);

  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(""), 4000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  const fetchPatients = async () => {
    const res = await axios.get("http://localhost:5000/api/patients", {
      headers: { Authorization: `Bearer ${token}` },
    });
    setPatients(res.data);
  };

  const handleChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      if (editingPatient) {
        await axios.put(
          `http://localhost:5000/api/patients/${editingPatient.id}`,
          form,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setSuccessMessage("Patient updated successfully");
      } else {
        await axios.post("http://localhost:5000/api/patients", form, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setSuccessMessage("Patient created successfully");
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
    } catch {
      setError("Operation failed");
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;

    try {
      await axios.delete(
        `http://localhost:5000/api/patients/${deleteTarget.id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setSuccessMessage("Patient deleted successfully");
      setDeleteTarget(null);
      fetchPatients();
    } catch {
      setError("Failed to delete patient");
    }
  };

  const filtered = patients.filter((p) =>
    `${p.firstName} ${p.lastName} ${p.email || ""}`
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-8">
      <PageHeader title="Patients" />

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

      {(user?.role === "ADMIN" || user?.role === "STAFF") && (
        <div className="flex justify-end mb-6">
          <button
            onClick={() => {
              setEditingPatient(null);
              setFormOpen(!formOpen);
            }}
            className="bg-teal-500 text-white px-5 py-2 rounded-lg hover:bg-teal-600 transition"
          >
            {formOpen ? "Close" : "+ Add Patient"}
          </button>
        </div>
      )}
      {formOpen && (
  <PatientFormCard
    editingPatient={null}
    form={form}
    onChange={handleChange}
    onCancel={() => {
      setFormOpen(false);
    }}
    onSubmit={handleSubmit}
  />
)}
      

      <div className="flex justify-between items-center mb-6">
        <SearchInput
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search patients..."
        />
        <p className="text-sm text-gray-500">
          Showing {filtered.length} of {patients.length} patients
        </p>
      </div>

      <TableWrapper>
        <thead className="bg-gray-50 text-gray-600">
          <tr>
            <th className="p-4 text-left">First Name</th>
            <th className="p-4 text-left">Last Name</th>
            <th className="p-4 text-left">Phone</th>
            <th className="p-4 text-left">Email</th>
            <th className="p-4 text-left">Actions</th>
          </tr>
        </thead>
        <tbody>
          {filtered.map((patient) => (
            <tr key={patient.id} className="hover:bg-gray-50">
              <td className="p-4">{patient.firstName}</td>
              <td className="p-4">{patient.lastName}</td>
              <td className="p-4">{patient.phone}</td>
              <td className="p-4">{patient.email}</td>
              <td className="p-4">
                <ActionButtons
                  onEdit={() => {
                    setEditingPatient(patient);
                    setForm({
                      firstName: patient.firstName,
                      lastName: patient.lastName,
                      phone: patient.phone || "",
                      email: patient.email || "",
                    });
                    
                  }}
                  onDelete={() => setDeleteTarget(patient)}
                  showDelete={user?.role === "ADMIN"}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </TableWrapper>
      {editingPatient && (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20">
    <div className="bg-white w-[520px] rounded-3xl p-8 shadow-2xl">

      <h3 className="text-xl font-semibold mb-6">
        Edit Patient
      </h3>

      <PatientFormCard
        editingPatient={editingPatient}
        form={form}
        onChange={handleChange}
        onCancel={() => {
          setEditingPatient(null);
        }}
        onSubmit={handleSubmit}
      />

    </div>
  </div>
)}
      {deleteTarget && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/20 z-50">
          <div className="bg-white w-[420px] rounded-3xl p-8 shadow-2xl">
            <h3 className="text-xl font-semibold mb-4">Delete Patient</h3>
            <p className="text-sm text-gray-500 mb-6">
              Are you sure you want to delete {deleteTarget.firstName} {deleteTarget.lastName}?
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
    </div>
  );
}

export default Patients;