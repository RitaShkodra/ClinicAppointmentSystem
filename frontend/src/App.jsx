import { Routes, Route } from "react-router-dom";
import Login from "./pages/login";
import Dashboard from "./pages/dashboard";
import ProtectedRoute from "./components/protectedroute";
import Layout from "./components/layout";
import Patients from "./pages/patients";
import Doctors from "./pages/doctors";
import Appointments from "./pages/appointments";
import Profile from "./pages/profile";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />

      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Layout>
              <Dashboard />
            </Layout>
          </ProtectedRoute>
        }
      />

      <Route
  path="/patients"
  element={
    <ProtectedRoute allowedRoles={["ADMIN", "RECEPTIONIST", "DOCTOR"]}>
      <Layout>
        <Patients />
      </Layout>
    </ProtectedRoute>
  }
/>

<Route
  path="/doctors"
  element={
    <ProtectedRoute allowedRoles={["ADMIN", "RECEPTIONIST", "DOCTOR", "PATIENT"]}>
      <Layout>
        <Doctors />
      </Layout>
    </ProtectedRoute>
  }
/>

<Route
  path="/appointments"
  element={
    <ProtectedRoute allowedRoles={["ADMIN", "RECEPTIONIST", "DOCTOR", "PATIENT"]}>
      <Layout>
        <Appointments />
      </Layout>
    </ProtectedRoute>
  }
/>

      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <Layout>
              <Profile />
            </Layout>
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

export default App;