import { useState, useContext } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/authcontext";

function Login() {
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await axios.post(
  "http://localhost:5000/api/auth/login",
  { email, password }
);

login(res.data);

const user = res.data.user || res.data;
if (user.forcePasswordChange) {
  navigate("/profile");
} else if (user.role === "PATIENT") {
  navigate("/appointments");
} else {
  navigate("/dashboard");
}
    } catch (err) {
      setError("Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-gray-50">

      {/* Left Branding */}
      <div className="hidden lg:flex w-1/2 bg-[#579ec0] text-white flex-col justify-center px-16">
        <h1 className="text-4xl font-bold mb-6">
          Clinic Management System
        </h1>

        <p className="text-lg opacity-90 max-w-md">
          Manage patients, doctors and appointments with a simple and
          efficient dashboard built for modern clinics.
        </p>

        <div className="mt-10 text-sm opacity-70">
          Secure • Fast • Reliable
        </div>
      </div>

      {/* Login Form */}
      <div className="flex flex-1 items-center justify-center p-8">

        <form
          onSubmit={handleSubmit}
          className="bg-white w-full max-w-md p-10 rounded-2xl border border-gray-200 shadow-sm"
        >

          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Welcome back
          </h2>

          <p className="text-gray-500 mb-8">
            Sign in to access the clinic system
          </p>

          {error && (
            <div className="mb-5 bg-red-50 text-red-600 border border-red-100 px-4 py-3 rounded-xl text-sm">
              {error}
            </div>
          )}

          {/* Email */}
          <div className="mb-5">
            <label className="text-sm text-gray-600">Email</label>

            <input
              type="email"
              required
              className="w-full mt-1 px-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#579ec0] focus:outline-none transition"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          {/* Password */}
          <div className="mb-6">
            <label className="text-sm text-gray-600">Password</label>

            <div className="relative mt-1">

              <input
                type={showPassword ? "text" : "password"}
                required
                className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#579ec0] focus:outline-none transition"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />

              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-2 text-sm text-gray-500"
              >
                {showPassword ? "Hide" : "Show"}
              </button>

            </div>
          </div>

          {/* Login Button */}
          <button
            disabled={loading}
            className="w-full bg-[#579ec0] hover:bg-[#4b8fb0] text-white py-2.5 rounded-xl font-medium transition disabled:opacity-60"
          >
            {loading ? "Signing in..." : "Sign in"}
          </button>

          {/* Footer */}
          <div className="text-center text-xs text-gray-400 mt-6">
            Clinic System © {new Date().getFullYear()}
          </div>

        </form>

      </div>

    </div>
  );
}

export default Login;