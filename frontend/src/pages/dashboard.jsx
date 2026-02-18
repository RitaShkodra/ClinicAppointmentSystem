import { useEffect, useState } from "react";
import axios from "axios";

function Dashboard() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem("accessToken");

        const res = await axios.get(
          "http://localhost:5000/api/dashboard/stats",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        setStats(res.data);
      } catch (err) {
        console.error("Failed to load stats");
      }
    };

    fetchStats();
  }, []);

  if (!stats) {
    return <div>Loading dashboard...</div>;
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Dashboard Overview</h1>

      {/* Top Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <div className="bg-white p-6 rounded-xl shadow">
          <h2 className="text-gray-500">Total Patients</h2>
          <p className="text-3xl font-bold mt-2">{stats.totalPatients}</p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow">
          <h2 className="text-gray-500">Total Doctors</h2>
          <p className="text-3xl font-bold mt-2">{stats.totalDoctors}</p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow">
          <h2 className="text-gray-500">Total Appointments</h2>
          <p className="text-3xl font-bold mt-2">{stats.totalAppointments}</p>
        </div>
      </div>

      {/* Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-yellow-100 p-6 rounded-xl">
          <h2 className="text-yellow-800 font-semibold">Pending</h2>
          <p className="text-2xl mt-2">{stats.pending}</p>
        </div>

        <div className="bg-green-100 p-6 rounded-xl">
          <h2 className="text-green-800 font-semibold">Approved</h2>
          <p className="text-2xl mt-2">{stats.approved}</p>
        </div>

        <div className="bg-red-100 p-6 rounded-xl">
          <h2 className="text-red-800 font-semibold">Cancelled</h2>
          <p className="text-2xl mt-2">{stats.cancelled}</p>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
