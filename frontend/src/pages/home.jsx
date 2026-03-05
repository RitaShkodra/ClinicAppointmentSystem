import { Link, useNavigate } from "react-router-dom";
import { useContext, useEffect } from "react";
import { AuthContext } from "../context/authcontext";

const CLINIC_NAME = "Vitalis Clinic";

// Local images (in public/images/)
const IMG = {
  hero: "/images/hero.png",
  reception: "/images/reception.png",
  doctors: "/images/doctors.png",
  medication: "/images/medication.png",
  clinic: "/images/clinic.png",
};

function Home() {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate(user.role === "PATIENT" ? "/appointments" : "/dashboard", { replace: true });
    }
  }, [user, navigate]);

  if (user) return null;

  return (
    <div className="min-h-screen bg-white text-gray-900">
      {/* ========== HEADER ========== */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-slate-900 text-white shadow-lg">
        <div className="max-w-6xl mx-auto px-6 py-3.5 flex items-center justify-between">
          <Link to="/" className="font-semibold text-white text-lg tracking-tight hover:text-slate-200 transition">
            {CLINIC_NAME}
          </Link>
          <nav className="flex items-center gap-8">
            <a href="#about" className="text-sm text-slate-300 hover:text-white transition hidden sm:inline">About</a>
            <a href="#services" className="text-sm text-slate-300 hover:text-white transition hidden sm:inline">Services</a>
            <Link
              to="/login"
              className="text-sm font-medium text-white bg-slate-700 hover:bg-slate-600 px-4 py-2 rounded-lg transition"
            >
              Staff sign in
            </Link>
          </nav>
        </div>
      </header>

      {/* ========== HERO ========== */}
      <section className="relative min-h-[90vh] flex items-center pt-20">
        <div className="absolute inset-0">
          <img
            src={IMG.hero}
            alt="Modern clinic"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-gray-900/85 via-gray-900/50 to-transparent" />
        </div>
        <div className="relative max-w-6xl mx-auto px-6 py-16 w-full">
          <div className="max-w-xl">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight tracking-tight">
              Welcome to{" "}
              <span className="text-cyan-300">{CLINIC_NAME}</span>
            </h1>
            <p className="mt-6 text-lg md:text-xl text-gray-200/95">
              We’re here to help your practice run smoothly—appointments, your team, and patient care, all in one place.
            </p>
            <div className="mt-10 flex flex-wrap gap-4">
              <Link
                to="/login"
                className="inline-flex items-center gap-2 bg-[#579ec0] hover:bg-[#4a8fb5] text-white font-semibold px-8 py-4 rounded-xl shadow-xl transition-all"
              >
                Sign in to dashboard
              </Link>
              <a href="#services" className="inline-flex items-center gap-2 bg-white/15 hover:bg-white/25 text-white font-semibold px-8 py-4 rounded-xl border border-white/30 backdrop-blur transition-all">
                See what we offer
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ========== ABOUT / OUR CLINIC ========== */}
      <section id="about" className="py-20 md:py-28 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-12 md:gap-16 items-center">
            <div className="relative overflow-hidden rounded-2xl shadow-2xl">
              <img
                src={IMG.reception}
                alt="Clinic interior and waiting area"
                className="w-full h-[320px] md:h-[400px] object-cover"
              />
              <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-black/40 to-transparent" />
            </div>
            <div>
              <span className="text-sm font-semibold text-[#579ec0] uppercase tracking-wider">About {CLINIC_NAME}</span>
              <h2 className="mt-2 text-3xl md:text-4xl font-bold text-gray-900">
                A place built for your patients and your team
              </h2>
              <p className="mt-6 text-gray-600 leading-relaxed">
                {CLINIC_NAME} brings together a calm, professional environment and a system that works the way you do. Book appointments, manage your doctors and their schedules, and keep medication and records in one secure place.
              </p>
              <ul className="mt-8 space-y-3">
                {["Online appointment booking", "Secure patient records", "Your doctors & staff in one place"].map((item) => (
                  <li key={item} className="flex items-center gap-3 text-gray-700">
                    <span className="w-6 h-6 rounded-full bg-[#daebed] flex items-center justify-center text-[#579ec0] text-xs font-bold">✓</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ========== SERVICES (Doctors, Medication, Appointments) ========== */}
      <section id="services" className="py-20 md:py-28 bg-gray-50">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-sm font-semibold text-[#579ec0] uppercase tracking-wider">What we offer</span>
            <h2 className="mt-2 text-3xl md:text-4xl font-bold text-gray-900">
              Everything {CLINIC_NAME} needs
            </h2>
            <p className="mt-4 text-gray-600">
              From scheduling to prescriptions, we support the way your practice works every day.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Doctors */}
            <div className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl border border-gray-100 transition-all duration-300">
              <div className="relative h-56 overflow-hidden">
                <img
                  src={IMG.doctors}
                  alt="Our medical team"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <span className="absolute bottom-4 left-4 right-4 text-white font-semibold text-lg">Our doctors</span>
              </div>
              <div className="p-6">
                <h3 className="font-bold text-gray-900 text-lg">Expert care team</h3>
                <p className="mt-2 text-gray-600 text-sm">
                  Manage your team’s schedules, specializations, and availability. Patients see and book with the right doctor.
                </p>
              </div>
            </div>

            {/* Medication / Pharmacy */}
            <div className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl border border-gray-100 transition-all duration-300">
              <div className="relative h-56 overflow-hidden">
                <img
                  src={IMG.medication}
                  alt="Medication and pharmacy"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <span className="absolute bottom-4 left-4 right-4 text-white font-semibold text-lg">Medication & care</span>
              </div>
              <div className="p-6">
                <h3 className="font-bold text-gray-900 text-lg">Prescriptions & records</h3>
                <p className="mt-2 text-gray-600 text-sm">
                  Keep your patients’ treatment plans and medication history in one place—safe, compliant, and easy to access.
                </p>
              </div>
            </div>

            {/* Appointments / Clinic */}
            <div className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl border border-gray-100 transition-all duration-300">
              <div className="relative h-56 overflow-hidden">
                <img
                  src={IMG.clinic}
                  alt="Appointments and scheduling"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <span className="absolute bottom-4 left-4 right-4 text-white font-semibold text-lg">Smart scheduling</span>
              </div>
              <div className="p-6">
                <h3 className="font-bold text-gray-900 text-lg">Appointments that work</h3>
                <p className="mt-2 text-gray-600 text-sm">
                  Book, reschedule, and confirm in one system. Fewer no-shows and a smoother day for your patients and staff.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========== WHY VITALIS CLINIC ========== */}
      <section className="py-16 md:py-20 bg-white border-y border-gray-100">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-center text-xl md:text-2xl font-bold text-gray-900 mb-10">
            Why {CLINIC_NAME}
          </h2>
          <div className="grid md:grid-cols-3 gap-8 md:gap-12">
            <div className="text-center">
              <div className="w-14 h-14 mx-auto rounded-2xl bg-[#daebed] flex items-center justify-center text-[#579ec0] font-bold text-lg mb-4">1</div>
              <h3 className="font-semibold text-gray-900">Easy booking</h3>
              <p className="mt-2 text-gray-600 text-sm">Patients and staff book and manage appointments in one place.</p>
            </div>
            <div className="text-center">
              <div className="w-14 h-14 mx-auto rounded-2xl bg-[#daebed] flex items-center justify-center text-[#579ec0] font-bold text-lg mb-4">2</div>
              <h3 className="font-semibold text-gray-900">Secure & private</h3>
              <p className="mt-2 text-gray-600 text-sm">Records and data are protected with role-based access.</p>
            </div>
            <div className="text-center">
              <div className="w-14 h-14 mx-auto rounded-2xl bg-[#daebed] flex items-center justify-center text-[#579ec0] font-bold text-lg mb-4">3</div>
              <h3 className="font-semibold text-gray-900">Built for your day</h3>
              <p className="mt-2 text-gray-600 text-sm">Less admin, more time for what matters—your patients.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ========== CTA ========== */}
      <section className="py-20 md:py-28 bg-gradient-to-br from-[#579ec0] via-[#4a8fb5] to-[#3d7a9e] text-white">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-bold">
            Ready to run {CLINIC_NAME} better?
          </h2>
          <p className="mt-4 text-white/90 text-lg">
            Sign in to your dashboard and manage appointments, your doctors, and your patients in one place.
          </p>
          <Link
            to="/login"
            className="mt-10 inline-flex items-center gap-2 bg-white text-[#579ec0] hover:bg-gray-100 font-semibold px-10 py-4 rounded-xl shadow-xl transition-all"
          >
            Sign in to get started
          </Link>
          <div className="mt-12 flex flex-wrap justify-center gap-8 text-white/80 text-sm">
            <span className="flex items-center gap-2">🔒 Secure</span>
            <span className="flex items-center gap-2">⚡ Fast</span>
            <span className="flex items-center gap-2">👥 Role-based access</span>
          </div>
        </div>
      </section>

      {/* ========== FOOTER ========== */}
      <footer className="py-10 bg-gray-900 text-gray-400">
        <div className="max-w-6xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <span className="font-semibold text-white">{CLINIC_NAME}</span>
          <div className="flex items-center gap-6 text-sm">
            <Link to="/" className="hover:text-white transition">Home</Link>
            <Link to="/login" className="hover:text-white transition">Sign in</Link>
          </div>
        </div>
        <div className="max-w-6xl mx-auto px-6 mt-6 pt-6 border-t border-gray-800 text-center text-sm">
          {CLINIC_NAME} © {new Date().getFullYear()}. Built for practices like yours.
        </div>
      </footer>
    </div>
  );
}

export default Home;
