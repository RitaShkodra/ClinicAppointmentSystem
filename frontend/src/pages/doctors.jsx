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

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    specialization: "",
    phone: "",
    email: "",
  });

  const token = localStorage.getItem("accessToken");

  const fetchDoctors = async () => {
    const res = await axios.get("http://localhost:5000/api/doctors", {
      headers: { Authorization: `Bearer ${token}` },
    });
    setDoctors(res.data);
  };

  useEffect(() => {
    fetchDoctors();
  }, []);

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
              <td className="p-4">
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
              </td>
            </tr>
          ))}
        </tbody>
      </TableWrapper>
    </div>
  );
}

export default Doctors;
