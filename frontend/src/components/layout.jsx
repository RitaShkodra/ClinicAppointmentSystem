import { NavLink } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../context/authcontext";

function Layout({ children }) {
  const { logout } = useContext(AuthContext);
  const { user } = useContext(AuthContext);


  const linkClasses = ({ isActive }) =>
    `
    flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all
    ${
      isActive
        ? "bg-white/20 border-l-4 border-white text-white"
        : "text-teal-100 hover:bg-white/10 hover:text-white"
    }
  `;

  return (
    <div className="flex min-h-screen bg-gray-100">

      {/* Sidebar */}
      <aside className="w-72 bg-gradient-to-b from-teal-600 to-teal-700 text-white shadow-xl flex flex-col">

        {/* Logo Section */}
        <div className="px-6 py-8 border-b border-white/20">
          <h2 className="text-2xl font-bold tracking-wide">
            🏥 Clinic System
          </h2>
          <p className="text-teal-200 text-sm mt-1">
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
        <div className="p-4 border-t border-white/20">
          <button
            onClick={logout}
            className="w-full bg-white/10 hover:bg-white/20 text-white py-2 rounded-lg transition"
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
