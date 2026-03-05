import { useEffect, useState } from "react";
import api from "../utils/api";
import { useContext } from "react";
import { AuthContext } from "../context/authcontext";
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
  Legend,
);

function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const { user } = useContext(AuthContext);

  const [animatedValues, setAnimatedValues] = useState({
    patients: 0,
    doctors: 0,
    appointments: 0,
  });

  const isAdmin = user?.role === "ADMIN";
  const isReceptionist = user?.role === "RECEPTIONIST";
  const canSeeAnalytics = isAdmin || isReceptionist;

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get("/dashboard/stats");
        setStats(res.data);
      } catch {
        console.error("Failed to load stats");
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  useEffect(() => {
    if (!stats) return;

    const duration = 900;
    const steps = 30;
    const interval = duration / steps;

    let currentStep = 0;

    const timer = setInterval(() => {
      currentStep++;

      setAnimatedValues({
        patients: Math.floor((stats.totalPatients / steps) * currentStep),
        doctors: Math.floor((stats.totalDoctors / steps) * currentStep),
        appointments: Math.floor(
          (stats.totalAppointments / steps) * currentStep,
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

  if (!stats) {
    return <div className="p-10 text-red-500">Failed to load dashboard.</div>;
  }

  const completionRate =
    stats.totalAppointments > 0
      ? Math.round((stats.confirmed / stats.totalAppointments) * 100)
      : 0;

  const chartData = {
    labels: stats.weekly?.map((w) => w.day) || [],
    datasets: [
      {
        label: "Appointments",
        data: stats.weekly?.map((w) => w.count) || [],
        borderColor: "#579ec0",
        backgroundColor: "rgba(87,158,192,0.14)",
        tension: 0.4,
        fill: true,
        pointRadius: 3,
        pointHoverRadius: 5,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: { display: false },
      tooltip: { intersect: false, mode: "index" },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { color: "#6b7280" },
      },
      y: {
        grid: { color: "rgba(229,231,235,0.9)" },
        ticks: { color: "#6b7280" },
      },
    },
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="p-10 space-y-10 max-w-6xl mx-auto">

        {/* Header */}
        <div className="flex items-end justify-between gap-6">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Dashboard</h1>
            <p className="text-gray-600">
              Analytics & insights for your clinic
            </p>
          </div>

          <div className="hidden md:flex items-center gap-2 text-sm text-gray-500">
            <span className="inline-flex h-2 w-2 rounded-full bg-emerald-500" />
            Live stats
          </div>
        </div>

        {/* KPI row */}
        {canSeeAnalytics && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <KpiCard
              title="Total Patients"
              value={animatedValues.patients}
              hint="Active in system"
              accent="ring-[#b0d2db]"
              dot="bg-[#579ec0]"
            />
            <KpiCard
              title="Total Doctors"
              value={animatedValues.doctors}
              hint="Registered doctors"
              accent="ring-[#b0d2db]"
              dot="bg-[#506063]"
            />
            <KpiCard
              title="Total Appointments"
              value={animatedValues.appointments}
              hint="All-time bookings"
              accent="ring-[#b0d2db]"
              dot="bg-[#232b2a]"
            />
          </div>
        )}

        {/* Insight + Completion */}
        {canSeeAnalytics && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

            <div className="lg:col-span-1 bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-semibold text-gray-700">
                  Weekly Insight
                </h2>
                <span className="text-xs px-2.5 py-1 rounded-full bg-gray-100 text-gray-600">
                  vs last week
                </span>
              </div>

              <div className="mt-4">
                <p className="text-4xl font-bold text-gray-900">
                  {stats.weeklyGrowth >= 0 ? "+" : ""}
                  {stats.weeklyGrowth}%
                </p>
                <p className="text-gray-600 mt-2">
                  Change in weekly appointments
                </p>
              </div>

              <div className="mt-6 rounded-xl bg-[#daebed] border border-[#b0d2db] p-4">
                <p className="text-sm text-gray-700">
                  Tip: keep an eye on days with spikes to avoid overbooking.
                </p>
              </div>
            </div>

            <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-semibold text-gray-700">
                  Completion Rate
                </h2>
                <span className="text-xs px-2.5 py-1 rounded-full bg-gray-100 text-gray-600">
                  Confirmed / Total
                </span>
              </div>

              <div className="mt-5">
                <div className="relative w-full h-3 bg-gray-100 rounded-full overflow-hidden border border-gray-200">
                  <div
                    className="absolute left-0 top-0 h-full bg-[#579ec0] transition-all duration-1000"
                    style={{ width: `${completionRate}%` }}
                  />
                </div>

                <div className="mt-4 flex items-end justify-between">
                  <div>
                    <div className="text-4xl font-bold text-gray-900">
                      {completionRate}%
                    </div>
                    <p className="text-sm text-gray-600 mt-1">
                      Higher is better — indicates successful approvals.
                    </p>
                  </div>

                  <div className="hidden md:flex gap-2">
                    <StatusPill label="Pending" value={stats.pending} type="pending" />
                    <StatusPill label="Confirmed" value={stats.confirmed} type="confirmed" />
                    <StatusPill label="Cancelled" value={stats.cancelled} type="cancelled" />
                  </div>
                </div>
              </div>
            </div>

          </div>
        )}

        {/* Weekly chart */}
        {canSeeAnalytics && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-sm font-semibold text-gray-700">
                  Weekly Appointments
                </h2>
                <span className="text-xs px-2.5 py-1 rounded-full bg-[#daebed] text-gray-700 border border-[#b0d2db]">
                  last 7 days
                </span>
              </div>

              <div className="rounded-xl border border-gray-100 p-3">
                <Line data={chartData} options={chartOptions} />
              </div>
            </div>

            {/* Today */}
            <TodayAppointments stats={stats} />

          </div>
        )}

        {!canSeeAnalytics && (
          <TodayAppointments stats={stats} />
        )}

        {/* Status Overview */}
        {canSeeAnalytics && (
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
            <h2 className="text-sm font-semibold text-gray-700 mb-5">
              Status Overview
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <StatusBigCard title="Pending" value={stats.pending} type="pending" />
              <StatusBigCard title="Confirmed" value={stats.confirmed} type="confirmed" />
              <StatusBigCard title="Cancelled" value={stats.cancelled} type="cancelled" />
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

function TodayAppointments({ stats }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-sm font-semibold text-gray-700">
          Today’s Appointments
        </h2>
        <span className="text-xs px-2.5 py-1 rounded-full bg-gray-100 text-gray-600">
          {stats.todayAppointments?.length || 0} total
        </span>
      </div>

      {stats.todayAppointments?.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-200 p-6 text-gray-500">
          No appointments today.
        </div>
      ) : (
        <div className="space-y-3">
          {stats.todayAppointments?.map((appt) => (
            <div
              key={appt.id}
              className="flex justify-between items-center rounded-xl border border-gray-200 bg-white px-4 py-3 hover:bg-gray-50 transition"
            >
              <div>
                <p className="font-medium text-gray-900">{appt.patientName}</p>
                <p className="text-sm text-gray-600">
                  Dr. {appt.doctorName}
                </p>
              </div>
              <p className="text-sm text-gray-500">{appt.time}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* Components unchanged */

function KpiCard({ title, value, hint, accent, dot }) {
  return (
    <div className={`bg-white rounded-2xl border border-gray-200 shadow-sm p-6 ring-1 ${accent}`}>
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-gray-700">{title}</p>
        <span className={`h-2.5 w-2.5 rounded-full ${dot}`} />
      </div>
      <p className="text-4xl font-bold text-gray-900 mt-4">{value}</p>
      <p className="text-sm text-gray-500 mt-2">{hint}</p>
    </div>
  );
}

function StatusPill({ label, value, type }) {
  const map = {
    pending: "bg-yellow-100 text-yellow-700",
    confirmed: "bg-blue-100 text-blue-700",
    cancelled: "bg-red-100 text-red-700",
  };

  return (
    <div className={`px-3 py-1 rounded-full text-xs font-medium ${map[type]}`}>
      {label}: {value}
    </div>
  );
}

function StatusBigCard({ title, value, type }) {
  const map = {
    pending: "bg-yellow-100 text-yellow-800",
    confirmed: "bg-blue-100 text-blue-800",
    cancelled: "bg-red-100 text-red-800",
  };

  return (
    <div className={`rounded-2xl p-5 ${map[type]} border border-white/40`}>
      <p className="text-sm font-semibold">{title}</p>
      <p className="text-3xl font-bold mt-3">{value}</p>
      <p className="text-sm opacity-80 mt-1">appointments</p>
    </div>
  );
}

export default Dashboard;