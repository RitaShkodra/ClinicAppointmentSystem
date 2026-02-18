import { Routes, Route } from "react-router-dom";
import Login from "./pages/login";
import Dashboard from "./pages/dashboard";
import ProtectedRoute from "./components/protectedroute";
import Layout from "./components/layout";
import Patients from "./pages/patients";


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
    <ProtectedRoute>
      <Layout>
        <Patients />
      </Layout>
    </ProtectedRoute>
  }
/>


      <Route
        path="/doctors"
        element={
          <ProtectedRoute>
            <Layout>
              <div>Doctors Page</div>
            </Layout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/appointments"
        element={
          <ProtectedRoute>
            <Layout>
              <div>Appointments Page</div>
            </Layout>
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

export default App;
