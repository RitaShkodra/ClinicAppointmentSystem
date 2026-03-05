import { Link, NavLink } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../context/authcontext";

function Layout({ children }) {
  const { logout, user } = useContext(AuthContext);

  const role = user?.role;

  const linkClasses = ({ isActive }) =>
    `flex items-center px-4 py-2.5 rounded-lg text-sm font-medium transition-colors
     ${isActive ? "bg-slate-700 text-white" : "text-slate-300 hover:bg-slate-800 hover:text-white"}`;

  const initials =
    user?.name
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase() || "?";

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 flex-shrink-0 flex flex-col h-screen bg-slate-900 border-r border-slate-700/60">
        {/* Logo block - click goes to landing */}
        <Link to="/" className="block px-5 py-6 border-b border-slate-700/60 hover:bg-slate-800/50 transition rounded-t-lg">
          <h2 className="text-xl font-bold text-white tracking-tight">
            Vitalis Clinic
          </h2>
          <p className="mt-1 text-xs font-medium uppercase tracking-wider text-slate-500">
            {role === "PATIENT" && "Patient"}
            {role === "DOCTOR" && "Doctor"}
            {(role === "ADMIN" || role === "RECEPTIONIST") && "Admin"}
          </p>
        </Link>

        {/* Nav */}
        <nav className="flex-1 px-3 py-5 flex flex-col gap-0.5 overflow-y-auto">
          {(role === "ADMIN" || role === "RECEPTIONIST" || role === "DOCTOR") && (
            <NavLink to="/dashboard" className={linkClasses}>
              Dashboard
            </NavLink>
          )}
          {(role === "ADMIN" || role === "RECEPTIONIST" || role === "DOCTOR") && (
            <NavLink to="/patients" className={linkClasses}>
              Patients
            </NavLink>
          )}
          <NavLink to="/doctors" className={linkClasses}>
            Doctors
          </NavLink>
          <NavLink to="/appointments" className={linkClasses}>
            Appointments
          </NavLink>
        </nav>

        {/* User + actions */}
        <div className="p-3 border-t border-slate-700/60 space-y-2">
          <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-slate-800/70">
            <div className="w-9 h-9 rounded-full bg-slate-600 flex items-center justify-center text-xs font-semibold text-white flex-shrink-0">
              {initials}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-white truncate">{user?.name}</p>
              <p className="text-xs text-slate-400 truncate">{user?.role}</p>
            </div>
          </div>
          <NavLink to="/profile" className={linkClasses}>
            Profile
          </NavLink>
          <button
            onClick={logout}
            className="w-full py-2.5 rounded-lg text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
          >
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto flex flex-col min-h-0">
        <div className="flex-1 p-10 max-w-7xl mx-auto w-full">{children}</div>
        <footer className="py-3 border-t border-gray-200 bg-gray-50/80">
          <div className="max-w-7xl mx-auto px-10 text-center text-xs text-gray-500">
            Vitalis Clinic © {new Date().getFullYear()}
          </div>
        </footer>
      </main>
    </div>
  );
}

export default Layout;
