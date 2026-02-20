import { useEffect, useState } from "react";
import axios from "axios";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
} from "chart.js";
import { Line } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend
);

function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [animatedValues, setAnimatedValues] = useState({
    patients: 0,
    doctors: 0,
    appointments: 0,
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem("accessToken");

        const res = await axios.get(
          "http://localhost:5000/api/dashboard/stats",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        setStats(res.data);
      } catch {
        console.error("Failed to load stats");
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  // Animated counters
  useEffect(() => {
    if (!stats) return;

    const duration = 1000;
    const steps = 30;
    const interval = duration / steps;

    let currentStep = 0;

    const timer = setInterval(() => {
      currentStep++;

      setAnimatedValues({
        patients: Math.floor(
          (stats.totalPatients / steps) * currentStep
        ),
        doctors: Math.floor(
          (stats.totalDoctors / steps) * currentStep
        ),
        appointments: Math.floor(
          (stats.totalAppointments / steps) * currentStep
        ),
      });

      if (currentStep >= steps) {
        clearInterval(timer);
        setAnimatedValues({
          patients: stats.totalPatients,
          doctors: stats.totalDoctors,
          appointments: stats.totalAppointments,
        });
      }
    }, interval);

    return () => clearInterval(timer);
  }, [stats]);

  if (loading) {
    return (
      <div className="p-10 text-gray-400 animate-pulse">
        Loading dashboard...
      </div>
    );
  }

  const completionRate =
    stats.totalAppointments > 0
      ? Math.round(
          (stats.approved / stats.totalAppointments) * 100
        )
      : 0;

  const chartData = {
    labels: stats.weekly?.map((w) => w.day) || [],
    datasets: [
      {
        label: "Appointments",
        data: stats.weekly?.map((w) => w.count) || [],
        borderColor: "#14b8a6",
        backgroundColor: "rgba(20,184,166,0.1)",
        tension: 0.4,
        fill: true,
      },
    ],
  };

  return (
    <div className="p-10 space-y-14 bg-gray-50 min-h-screen">

      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold text-gray-800 mb-2">
          Dashboard
        </h1>
        <p className="text-gray-500">
          Analytics & insights for your clinic
        </p>
      </div>

      {/* Hero Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <StatCard
          title="Total Patients"
          value={animatedValues.patients}
          color="blue"
        />
        <StatCard
          title="Total Doctors"
          value={animatedValues.doctors}
          color="purple"
        />
        <StatCard
          title="Total Appointments"
          value={animatedValues.appointments}
          color="teal"
        />
      </div>

      {/* Chart + Completion */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">

        {/* Weekly Chart */}
        <div className="bg-white rounded-3xl p-8 shadow-md">
          <h2 className="text-lg font-semibold text-gray-700 mb-6">
            Weekly Appointments
          </h2>
          <Line data={chartData} />
        </div>

        {/* Completion Rate */}
        <div className="bg-white rounded-3xl p-8 shadow-md">
          <h2 className="text-lg font-semibold text-gray-700 mb-6">
            Completion Rate
          </h2>

          <div className="relative w-full h-5 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="absolute left-0 top-0 h-full bg-teal-500 transition-all duration-1000"
              style={{ width: `${completionRate}%` }}
            />
          </div>

          <div className="mt-6 text-4xl font-bold text-gray-800">
            {completionRate}%
          </div>

          <p className="text-sm text-gray-500 mt-2">
            Approved vs total appointments
          </p>
        </div>
      </div>

      {/* Status + Today */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">

        {/* Status Breakdown */}
        <div className="bg-white rounded-3xl p-8 shadow-md">
          <h2 className="text-lg font-semibold text-gray-700 mb-6">
            Status Overview
          </h2>

          <div className="space-y-5">
            <StatusRow label="Pending" value={stats.pending} color="yellow" />
            <StatusRow label="Approved" value={stats.approved} color="green" />
            <StatusRow label="Cancelled" value={stats.cancelled} color="red" />
          </div>
        </div>

        {/* Upcoming Today */}
        <div className="bg-white rounded-3xl p-8 shadow-md">
          <h2 className="text-lg font-semibold text-gray-700 mb-6">
            Today’s Appointments
          </h2>

          {stats.todayAppointments?.length === 0 ? (
            <p className="text-gray-400">No appointments today.</p>
          ) : (
            <div className="space-y-4">
              {stats.todayAppointments?.map((appt) => (
                <div
                  key={appt.id}
                  className="flex justify-between items-center border-b pb-3 last:border-none"
                >
                  <div>
                    <p className="font-medium text-gray-800">
                      {appt.patientName}
                    </p>
                    <p className="text-sm text-gray-500">
                      Dr. {appt.doctorName}
                    </p>
                  </div>
                  <p className="text-sm text-gray-400">
                    {appt.time}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ===== Components ===== */

function StatCard({ title, value, color }) {
  const colors = {
    blue: "bg-blue-50 text-blue-600",
    purple: "bg-purple-50 text-purple-600",
    teal: "bg-teal-50 text-teal-600",
  };

  return (
    <div className="bg-white rounded-3xl p-8 shadow-md hover:shadow-xl transition-all duration-300">
      <h2 className="text-gray-500">{title}</h2>
      <div className="flex items-center justify-between mt-4">
        <p className="text-4xl font-bold text-gray-800">{value}</p>
        <div className={`px-4 py-2 rounded-full text-sm ${colors[color]}`}>
          ●
        </div>
      </div>
    </div>
  );
}

function StatusRow({ label, value, color }) {
  const colors = {
    yellow: "bg-yellow-100 text-yellow-700",
    green: "bg-green-100 text-green-700",
    red: "bg-red-100 text-red-700",
  };

  return (
    <div className="flex justify-between items-center">
      <span className="text-gray-600">{label}</span>
      <span
        className={`px-3 py-1 rounded-full text-sm font-medium ${colors[color]}`}
      >
        {value}
      </span>
    </div>
  );
}

export default Dashboard;