import { NavLink } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../context/authcontext";

function Layout({ children }) {
  const { logout, user } = useContext(AuthContext);

  const role = user?.role;

  const linkClasses = ({ isActive }) =>
    `
    flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all
    ${
      isActive
        ? "text-gray-900 bg-[#daebed] border border-[#b0d2db]"
        : "text-gray-600 hover:bg-gray-100"
    }
  `;

  const initials =
    user?.name?.split(" ").map((n) => n[0]).join("").toUpperCase() || "?";

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">

      {/* Sidebar */}
      <aside className="w-72 bg-white border-r border-gray-200 flex flex-col sticky top-0 h-screen shadow-sm">

        {/* Logo */}
        <div className="px-6 py-8 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900 tracking-wide">
            🏥 Clinic System
          </h2>

          <p className="text-gray-500 text-sm mt-1">
            {role === "PATIENT" && "Patient Portal"}
            {role === "DOCTOR" && "Doctor Portal"}
            {(role === "ADMIN" || role === "RECEPTIONIST") && "Administration Panel"}
          </p>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 flex flex-col gap-2 overflow-y-auto">

          {/* DASHBOARD */}
          {(role === "ADMIN" || role === "RECEPTIONIST" || role === "DOCTOR") && (
            <NavLink to="/dashboard" className={linkClasses}>
              📊 Dashboard
            </NavLink>
          )}

          {/* PATIENTS */}
          {(role === "ADMIN" || role === "RECEPTIONIST" || role === "DOCTOR") && (
            <NavLink to="/patients" className={linkClasses}>
              🧑‍⚕️ Patients
            </NavLink>
          )}

          {/* DOCTORS */}
          <NavLink to="/doctors" className={linkClasses}>
            🩺 Doctors
          </NavLink>

          {/* APPOINTMENTS */}
          <NavLink to="/appointments" className={linkClasses}>
            📅 Appointments
          </NavLink>

        </nav>

        {/* Bottom Section */}
        <div className="p-4 border-t border-gray-200 bg-white space-y-3">

          {/* User Card */}
          <div className="flex items-center gap-3 px-3 py-3 rounded-xl bg-gray-50 border border-gray-200">

            <div className="w-10 h-10 rounded-full bg-[#daebed] flex items-center justify-center text-sm font-semibold text-gray-700">
              {initials}
            </div>

            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-800 truncate">
                {user?.name}
              </p>

              <span className="text-xs px-2 py-0.5 rounded-full bg-[#daebed] text-gray-600 border border-[#b0d2db]">
                {user?.role}
              </span>
            </div>

          </div>

          {/* Profile */}
          <NavLink to="/profile" className={linkClasses}>
            👤 Profile
          </NavLink>

          {/* Logout */}
          <button
            onClick={logout}
            className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 rounded-xl transition text-sm"
          >
            🚪 Logout
          </button>

        </div>

      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">

        <div className="p-10 max-w-7xl mx-auto">
          {children}
        </div>

      </main>

    </div>
  );
}

export default Layout;