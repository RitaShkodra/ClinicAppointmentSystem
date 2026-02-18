import { NavLink } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../context/authcontext";

function Layout({ children }) {
  const { logout } = useContext(AuthContext);

  return (
    <div className="flex min-h-screen bg-gray-100">

      {/* Sidebar */}
      <aside className="w-64 bg-white shadow-lg p-6 flex flex-col">
        <h2 className="text-2xl font-bold mb-10 text-blue-600">
          Clinic Admin
        </h2>

        <nav className="flex flex-col gap-4">
          <NavLink
            to="/dashboard"
            className={({ isActive }) =>
              `p-2 rounded ${
                isActive ? "bg-blue-500 text-white" : "hover:bg-gray-200"
              }`
            }
          >
            Dashboard
          </NavLink>

          <NavLink
            to="/patients"
            className={({ isActive }) =>
              `p-2 rounded ${
                isActive ? "bg-blue-500 text-white" : "hover:bg-gray-200"
              }`
            }
          >
            Patients
          </NavLink>

          <NavLink
            to="/doctors"
            className={({ isActive }) =>
              `p-2 rounded ${
                isActive ? "bg-blue-500 text-white" : "hover:bg-gray-200"
              }`
            }
          >
            Doctors
          </NavLink>

          <NavLink
            to="/appointments"
            className={({ isActive }) =>
              `p-2 rounded ${
                isActive ? "bg-blue-500 text-white" : "hover:bg-gray-200"
              }`
            }
          >
            Appointments
          </NavLink>
        </nav>

        <button
          onClick={logout}
          className="mt-auto bg-red-500 text-white p-2 rounded hover:bg-red-600"
        >
          Logout
        </button>
      </aside>

      {/* Content */}
      <main className="flex-1 p-10">
        {children}
      </main>
    </div>
  );
}

export default Layout;
