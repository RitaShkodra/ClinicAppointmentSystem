import { useEffect, useState, useContext } from "react";
import api from "../utils/api";
import { AuthContext } from "../context/authcontext";

import PageHeader from "../components/pageheader";
import SearchInput from "../components/searchinput";
import TableWrapper from "../components/tablewrapper";
import ActionButtons from "../components/actionbuttons";
import PatientFormCard from "../components/patientcard";

function Patients() {
  const { user } = useContext(AuthContext);

  const canViewPatients =
    user?.role === "ADMIN" ||
    user?.role === "RECEPTIONIST" ||
    user?.role === "DOCTOR";

  const canManagePatients =
    user?.role === "ADMIN" || user?.role === "RECEPTIONIST";

  const canDeletePatient = user?.role === "ADMIN";

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

  useEffect(() => {
    if (canViewPatients) {
      fetchPatients();
    }
  }, []);

  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(""), 4000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  if (!canViewPatients) {
    return (
      <div className="p-10 text-gray-500">
        You do not have permission to view this page.
      </div>
    );
  }

  const fetchPatients = async () => {
    try {
      const res = await api.get("/patients");
      setPatients(res.data);
    } catch {
      setError("Failed to load patients");
    }
  };

  const handleChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!canManagePatients) return;

    try {
      if (editingPatient) {
        await api.put(`/patients/${editingPatient.id}`, form);
        setSuccessMessage("Patient updated successfully");
      } else {
        await api.post("/patients", form);
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
    if (!deleteTarget || !canDeletePatient) return;

    try {
      await api.delete(`/patients/${deleteTarget.id}`);
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
      .includes(searchTerm.toLowerCase()),
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

      {(user?.role === "ADMIN" || user?.role === "RECEPTIONIST") && (
        <div className="flex justify-end mb-6">
          <button
            onClick={() => {
              setEditingPatient(null);
              setFormOpen(!formOpen);
            }}
            className="text-white px-5 py-2 rounded-lg transition shadow-sm"
            style={{ backgroundColor: "#579ec0" }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.backgroundColor = "#4b8fb0")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.backgroundColor = "#579ec0")
            }
          >
            {formOpen ? "Close" : "+ Add Patient"}
          </button>
        </div>
      )}

      {formOpen && canManagePatients && (
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

      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <TableWrapper>
          <thead className="bg-gray-100 text-gray-700 border-b border-gray-200">
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
                  {canManagePatients && (
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
                      showDelete={canDeletePatient}
                    />
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </TableWrapper>
      </div>

      {editingPatient && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20">
          <div className="bg-white w-[520px] rounded-3xl p-8 shadow-2xl">
            <h3 className="text-xl font-semibold mb-6">Edit Patient</h3>

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
              Are you sure you want to delete {deleteTarget.firstName}{" "}
              {deleteTarget.lastName}?
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