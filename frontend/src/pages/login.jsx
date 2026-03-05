import { useState, useContext, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../utils/api";
import { AuthContext } from "../context/authcontext";

function Login() {
  const { user, login } = useContext(AuthContext);
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (user) {
      navigate(user.role === "PATIENT" ? "/appointments" : "/dashboard", { replace: true });
    }
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await api.post("/auth/login", { email, password });
      login(res.data);

      const userData = res.data.user || res.data;
      if (userData.forcePasswordChange) {
        navigate("/profile");
      } else if (userData.role === "PATIENT") {
        navigate("/appointments");
      } else {
        navigate("/dashboard");
      }
    } catch {
      setError("Invalid email or password. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (user) return null;

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-gray-50">
      {/* Left: Image + overlay (desktop) */}
      <div className="hidden lg:flex lg:w-[48%] relative flex-col justify-between p-12 overflow-hidden">
        <img
          src="/images/login-bg.png"
          alt=""
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gray-900/60" />
        <Link to="/" className="relative inline-flex items-center gap-2 text-white/90 hover:text-white text-sm font-medium transition-colors">
          ← Back to home
        </Link>
        <div className="relative">
          <h1 className="text-3xl xl:text-4xl font-bold leading-tight text-white">
            Vitalis Clinic
          </h1>
          <p className="mt-5 text-lg text-white/90 max-w-sm">
            Manage patients, doctors, and appointments with a simple dashboard built for modern clinics.
          </p>
          <ul className="mt-8 space-y-3 text-white/80">
            {["Secure sign-in", "Role-based access", "Real-time updates"].map((item) => (
              <li key={item} className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-white/90" />
                {item}
              </li>
            ))}
          </ul>
        </div>
        <p className="relative text-sm text-white/60">Vitalis Clinic © {new Date().getFullYear()}</p>
      </div>

      {/* Right: Form */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Mobile: back link */}
        <div className="lg:hidden px-6 pt-6">
          <Link to="/" className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-700 text-sm font-medium">
            ← Back to home
          </Link>
        </div>

        <div className="flex-1 flex items-center justify-center p-6 md:p-10">
          <div className="w-full max-w-md">
            <div className="lg:hidden mb-8 text-center">
              <h2 className="text-xl font-bold text-gray-900">Vitalis Clinic</h2>
            </div>

            <form
              onSubmit={handleSubmit}
              className="bg-white rounded-2xl border border-gray-200 shadow-sm shadow-gray-200/50 p-8"
            >
              <h2 className="text-2xl font-bold text-gray-900">Welcome back</h2>
              <p className="text-gray-500 mt-1 mb-8">Sign in to access your account</p>

              {error && (
                <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-100 text-red-700 text-sm flex items-start gap-2">
                  <span aria-hidden>⚠️</span>
                  <span>{error}</span>
                </div>
              )}

              <div className="space-y-5">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1.5">
                    Email
                  </label>
                  <input
                    id="email"
                    type="email"
                    required
                    autoComplete="email"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#579ec0] focus:border-[#579ec0] focus:outline-none transition text-gray-900 placeholder:text-gray-400"
                    placeholder="you@clinic.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>

                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1.5">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      required
                      autoComplete="current-password"
                      className="w-full px-4 py-3 pr-24 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#579ec0] focus:border-[#579ec0] focus:outline-none transition text-gray-900 placeholder:text-gray-400"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-sm font-medium text-gray-500 hover:text-gray-700"
                    >
                      {showPassword ? "Hide" : "Show"}
                    </button>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="mt-8 w-full bg-[#579ec0] hover:bg-[#4a8fb5] disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-semibold py-3.5 rounded-xl transition-colors shadow-sm"
              >
                {loading ? "Signing in…" : "Sign in"}
              </button>
            </form>

            <p className="mt-6 text-center text-sm text-gray-400 lg:hidden">
              Vitalis Clinic © {new Date().getFullYear()}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
