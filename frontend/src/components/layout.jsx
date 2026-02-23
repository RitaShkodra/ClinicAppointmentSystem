import { NavLink } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../context/authcontext";

function Layout({ children }) {
  const { logout, user } = useContext(AuthContext);

  const ACCENT = "#579ec0";
  const ACCENT_SOFT = "#daebed";

  const linkClasses = ({ isActive }) =>
    `
    flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all
    ${
      isActive
        ? "text-gray-900 bg-[#daebed]"
        : "text-gray-600 hover:bg-gray-100"
    }
  `;

  return (
    <div className="flex min-h-screen bg-gray-50">
      
      {/* Sidebar */}
      <aside className="w-72 bg-white border-r border-gray-200 flex flex-col">

        {/* Logo */}
        <div className="px-6 py-8 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900 tracking-wide">
            🏥 Clinic System
          </h2>
          <p className="text-gray-500 text-sm mt-1">
            Administration Panel
          </p>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 flex flex-col gap-2">

          <NavLink to="/dashboard" className={linkClasses}>
            📊 Dashboard
          </NavLink>

          <NavLink to="/patients" className={linkClasses}>
            🧑‍⚕️ Patients
          </NavLink>

          {user?.role === "ADMIN" && (
            <NavLink to="/doctors" className={linkClasses}>
              🩺 Doctors
            </NavLink>
          )}

          <NavLink to="/appointments" className={linkClasses}>
            📅 Appointments
          </NavLink>

        </nav>

        {/* Logout */}
        <div className="p-4 border-t border-gray-200">
          <button
            onClick={logout}
            className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 rounded-xl transition"
          >
            🚪 Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-10">
        {children}
      </main>
    </div>
  );
}

export default Layout;