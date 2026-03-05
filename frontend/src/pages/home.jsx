import { Link } from "react-router-dom";
import { useContext } from "react";
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
  const { user, logout } = useContext(AuthContext);

  const dashboardPath = user?.role === "PATIENT" ? "/appointments" : "/dashboard";

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
            {user ? (
              <>
                <Link
                  to={dashboardPath}
                  className="text-sm font-medium text-white bg-slate-700 hover:bg-slate-600 px-4 py-2 rounded-lg transition"
                >
                  Dashboard
                </Link>
                <button
                  onClick={logout}
                  className="text-sm font-medium text-slate-300 hover:text-white transition"
                >
                  Logout
                </button>
              </>
            ) : (
              <Link
                to="/login"
                className="text-sm font-medium text-white bg-slate-700 hover:bg-slate-600 px-4 py-2 rounded-lg transition"
              >
                Sign in
              </Link>
            )}
          </nav>
        </div>
      </header>

      {/* ========== HERO ========== */}
      <section className="relative min-h-[92vh] flex items-center pt-20">
        <div className="absolute inset-0">
          <img
            src={IMG.hero}
            alt=""
            className="w-full h-full object-cover scale-[1.02]"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-gray-900/88 via-gray-900/55 to-transparent" />
        </div>
        <div className="relative max-w-6xl mx-auto px-6 py-20 w-full">
          <div className="max-w-xl">
            <p className="text-sm font-semibold uppercase tracking-widest text-cyan-300/90 mb-4">
              For patients and staff
            </p>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-[1.1] tracking-tight">
              Welcome to{" "}
              <span className="text-cyan-300">{CLINIC_NAME}</span>
            </h1>
            <p className="mt-6 text-lg md:text-xl text-gray-200/95 max-w-lg">
              Book and view your appointments, browse our doctors, or manage the clinic—one place for patients and staff.
            </p>
            <div className="mt-10 flex flex-wrap gap-4">
              {user ? (
                <Link
                  to={dashboardPath}
                  className="inline-flex items-center gap-2 bg-white text-slate-900 font-semibold px-8 py-4 rounded-xl shadow-xl hover:bg-gray-100 transition-all"
                >
                  Dashboard
                </Link>
              ) : (
                <Link
                  to="/login"
                  className="inline-flex items-center gap-2 bg-white text-slate-900 font-semibold px-8 py-4 rounded-xl shadow-xl hover:bg-gray-100 transition-all"
                >
                  Sign in
                </Link>
              )}
              <a href="#services" className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white font-semibold px-8 py-4 rounded-xl border-2 border-white/40 backdrop-blur-sm transition-all">
                See what we offer
              </a>
            </div>
            <a href="#about" className="mt-16 inline-flex flex-col items-center gap-1 text-white/70 hover:text-white transition text-sm">
              <span>Scroll to explore</span>
              <svg className="w-5 h-5 animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" /></svg>
            </a>
          </div>
        </div>
      </section>

      {/* ========== ABOUT / OUR CLINIC ========== */}
      <section id="about" className="py-24 md:py-32 bg-gradient-to-b from-slate-50 to-white">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-14 md:gap-20 items-center">
            <div className="relative overflow-hidden rounded-2xl shadow-2xl ring-1 ring-black/5">
              <img
                src={IMG.reception}
                alt=""
                className="w-full h-[320px] md:h-[400px] object-cover"
              />
              <div className="absolute bottom-0 left-0 right-0 h-28 bg-gradient-to-t from-black/50 to-transparent" />
            </div>
            <div>
              <span className="text-sm font-semibold text-[#579ec0] uppercase tracking-wider">About {CLINIC_NAME}</span>
              <h2 className="mt-3 text-3xl md:text-4xl font-bold text-gray-900 leading-tight">
                Built for patients and staff
              </h2>
              <p className="mt-6 text-gray-600 leading-relaxed text-lg">
                {CLINIC_NAME} is one place for everyone: patients can book and view appointments and see our doctors; staff can manage schedules, records, and the practice—all secure and easy to use.
              </p>
              <ul className="mt-8 space-y-4">
                {["Book and view appointments online", "Secure records and privacy", "Doctors and staff in one system"].map((item) => (
                  <li key={item} className="flex items-center gap-3 text-gray-700">
                    <span className="w-7 h-7 rounded-full bg-[#daebed] flex items-center justify-center text-[#579ec0] flex-shrink-0">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                    </span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ========== SERVICES ========== */}
      <section id="services" className="py-24 md:py-32 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-20">
            <span className="text-sm font-semibold text-[#579ec0] uppercase tracking-wider">What we offer</span>
            <h2 className="mt-3 text-3xl md:text-4xl font-bold text-gray-900">
              For patients and the team
            </h2>
            <p className="mt-4 text-gray-600 text-lg">
              View doctors, book appointments, and manage your care—or run the clinic. One system for everyone.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { img: IMG.doctors, label: "Our doctors", title: "Expert care team", text: "Manage your team’s schedules, specializations, and availability. Patients see and book with the right doctor." },
              { img: IMG.medication, label: "Medication & care", title: "Prescriptions & records", text: "Keep your patients’ treatment plans and medication history in one place—safe, compliant, and easy to access." },
              { img: IMG.clinic, label: "Smart scheduling", title: "Appointments that work", text: "Book, reschedule, and confirm in one system. Fewer no-shows and a smoother day for your patients and staff." },
            ].map((card) => (
              <div key={card.title} className="group bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-2xl border border-gray-100 hover:border-[#b0d2db]/50 transition-all duration-300 hover:-translate-y-1">
                <div className="relative h-56 overflow-hidden">
                  <img src={card.img} alt="" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                  <span className="absolute bottom-4 left-4 right-4 text-white font-semibold text-lg drop-shadow-lg">{card.label}</span>
                </div>
                <div className="p-6">
                  <h3 className="font-bold text-gray-900 text-lg">{card.title}</h3>
                  <p className="mt-2 text-gray-600 text-sm leading-relaxed">{card.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ========== WHY VITALIS CLINIC ========== */}
      <section className="py-20 md:py-24 bg-slate-50 border-y border-slate-200/80">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-center text-2xl md:text-3xl font-bold text-gray-900 mb-14">
            Why {CLINIC_NAME}
          </h2>
          <div className="grid md:grid-cols-3 gap-10 md:gap-14">
            {[
              { title: "Easy booking", text: "Patients and staff book and manage appointments in one place." },
              { title: "Secure & private", text: "Records and data are protected with role-based access." },
              { title: "Built for your day", text: "Whether you’re a patient or staff, everything you need in one place." },
            ].map((item, i) => (
              <div key={item.title} className="text-center">
                <div className="w-12 h-12 mx-auto rounded-xl bg-slate-700 text-white flex items-center justify-center font-bold text-lg mb-5">
                  {i + 1}
                </div>
                <h3 className="font-semibold text-gray-900 text-lg">{item.title}</h3>
                <p className="mt-2 text-gray-600 text-sm max-w-xs mx-auto">{item.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ========== CTA ========== */}
      <section className="py-24 md:py-32 bg-gradient-to-br from-slate-800 via-slate-900 to-slate-900 text-white">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-bold">
            Ready to get started?
          </h2>
          <p className="mt-5 text-slate-300 text-lg">
            {user
              ? "Go back to your dashboard or appointments."
              : "Sign in to view your appointments, browse doctors, or manage the clinic. For patients and staff."}
          </p>
          {user ? (
            <Link
              to={dashboardPath}
              className="mt-10 inline-flex items-center gap-2 bg-white text-slate-900 hover:bg-slate-100 font-semibold px-10 py-4 rounded-xl shadow-xl transition-all"
            >
              Dashboard
            </Link>
          ) : (
            <Link
              to="/login"
              className="mt-10 inline-flex items-center gap-2 bg-white text-slate-900 hover:bg-slate-100 font-semibold px-10 py-4 rounded-xl shadow-xl transition-all"
            >
              Sign in to get started
            </Link>
          )}
          <div className="mt-14 flex flex-wrap justify-center gap-10 text-slate-400 text-sm">
            <span>Secure</span>
            <span>Fast</span>
            <span>Role-based access</span>
          </div>
        </div>
      </section>

      {/* ========== FOOTER ========== */}
      <footer className="py-12 bg-slate-950 text-slate-400">
        <div className="max-w-6xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-6">
          <span className="font-semibold text-white">{CLINIC_NAME}</span>
          <div className="flex items-center gap-8 text-sm">
            <a href="#about" className="hover:text-white transition">About</a>
            <a href="#services" className="hover:text-white transition">Services</a>
            <Link to="/" className="hover:text-white transition">Home</Link>
            {user ? (
              <>
                <Link to={dashboardPath} className="hover:text-white transition">Dashboard</Link>
                <button onClick={logout} className="hover:text-white transition">Logout</button>
              </>
            ) : (
              <Link to="/login" className="hover:text-white transition">Sign in</Link>
            )}
          </div>
        </div>
        <div className="max-w-6xl mx-auto px-6 mt-8 pt-8 border-t border-slate-800 text-center text-sm text-slate-500">
          {CLINIC_NAME} © {new Date().getFullYear()}. For patients and staff.
        </div>
      </footer>
    </div>
  );
}

export default Home;
