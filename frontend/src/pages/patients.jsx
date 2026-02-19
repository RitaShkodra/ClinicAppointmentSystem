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

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    email: "",
  });

  const token = localStorage.getItem("accessToken");

  const fetchPatients = async () => {
    const res = await axios.get("http://localhost:5000/api/patients", {
      headers: { Authorization: `Bearer ${token}` },
    });
    setPatients(res.data);
  };

  useEffect(() => {
    fetchPatients();
  }, []);

  const handleChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleDelete = async (id) => {
    await axios.delete(`http://localhost:5000/api/patients/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    fetchPatients();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (editingPatient) {
      await axios.put(
        `http://localhost:5000/api/patients/${editingPatient.id}`,
        form,
        { headers: { Authorization: `Bearer ${token}` } }
      );
    } else {
      await axios.post("http://localhost:5000/api/patients", form, {
        headers: { Authorization: `Bearer ${token}` },
      });
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
  };

  const filtered = patients.filter((p) =>
    `${p.firstName} ${p.lastName} ${p.email || ""}`
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-8">

      <PageHeader title="Patients" />

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
          editingPatient={editingPatient}
          form={form}
          onChange={handleChange}
          onCancel={() => {
            setFormOpen(false);
            setEditingPatient(null);
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
                    setFormOpen(true);
                  }}
                  onDelete={() => handleDelete(patient.id)}
                  showDelete={user?.role === "ADMIN"}
                />
              </td>
            </tr>
          ))}

          {filtered.length === 0 && (
            <tr>
              <td colSpan="5" className="text-center p-8 text-gray-400">
                No patients found
              </td>
            </tr>
          )}
        </tbody>
      </TableWrapper>
    </div>
  );
}

export default Patients;
