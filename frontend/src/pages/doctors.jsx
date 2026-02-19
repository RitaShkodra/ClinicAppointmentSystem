import { useEffect, useState, useContext } from "react";
import axios from "axios";
import { AuthContext } from "../context/authcontext";

import PageHeader from "../components/pageheader";
import SearchInput from "../components/searchinput";
import Card from "../components/card";
import TableWrapper from "../components/tablewrapper";
import ActionButtons from "../components/actionbuttons";
function Doctors() {
  const { user } = useContext(AuthContext);

  const [doctors, setDoctors] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

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

  const handleDelete = async (id) => {
    await axios.delete(`http://localhost:5000/api/doctors/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    fetchDoctors();
  };

  const filtered = doctors.filter((d) =>
    `${d.firstName} ${d.lastName} ${d.specialization}`
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-8">

      <PageHeader title="Doctors" />

      <div className="flex justify-between items-center mb-6">
        <SearchInput
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search doctors..."
        />
      </div>

      <TableWrapper>
        <thead className="bg-gray-50 text-gray-600">
          <tr>
            <th className="p-4 text-left">First Name</th>
            <th className="p-4 text-left">Last Name</th>
            <th className="p-4 text-left">Specialization</th>
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
              <td className="p-4">{doctor.email}</td>
              <td className="p-4">
                <ActionButtons
                  onEdit={() => console.log("Edit")}
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