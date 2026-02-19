import { Routes, Route } from "react-router-dom";
import Login from "./pages/login";
import Dashboard from "./pages/dashboard";
import ProtectedRoute from "./components/protectedroute";
import Layout from "./components/layout";
import Patients from "./pages/patients";
import Doctors from "./pages/doctors";


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
    <ProtectedRoute allowedRoles={["ADMIN", "STAFF"]}>
      <Layout>
        <Patients />
      </Layout>
    </ProtectedRoute>
  }
/>

<Route
  path="/doctors"
  element={
    <ProtectedRoute allowedRoles={["ADMIN"]}>
      <Layout>
        <Doctors />
      </Layout>
    </ProtectedRoute>
  }
/>

{/* <Route
  path="/appointments"
  element={
    <ProtectedRoute allowedRoles={["ADMIN", "STAFF"]}>
      <Layout>
        <Appointments />
      </Layout>
    </ProtectedRoute>
  }
/> */}

    </Routes>
  );
}

export default App;
