import { useEffect, useMemo, useState, useContext } from "react";
import api from "../utils/api";
import { AuthContext } from "../context/authcontext";
import PageHeader from "../components/pageheader";
import { useSearchParams } from "react-router-dom";

function Profile() {
  const { user } = useContext(AuthContext);

  // palette (match your system)
  const ACCENT = "#579ec0";
  const ACCENT_SOFT = "#daebed";
  const ACCENT_RING = "#b0d2db";
  const ACCENT_DARK = "#4b8fb0";

  const [loading, setLoading] = useState(true);
  const [me, setMe] = useState(null);

  const [successMessage, setSuccessMessage] = useState("");
  const [error, setError] = useState("");

  // account edit
  const [editingAccount, setEditingAccount] = useState(false);
  const [accountForm, setAccountForm] = useState({ name: "", email: "", phone: "", });
  const [searchParams] = useSearchParams();
  const forcePasswordChange = searchParams.get("forcePasswordChange");
  
  const [showForcePasswordModal, setShowForcePasswordModal] = useState(
  forcePasswordChange === "true"
);

  // password
  const [pwForm, setPwForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  // doctor edit
  const isDoctor = user?.role === "DOCTOR";
  const [editingDoctor, setEditingDoctor] = useState(false);
  const [doctorForm, setDoctorForm] = useState({
    phone: "",
    specialization: "",
  });
  const [availability, setAvailability] = useState({});

  useEffect(() => {
    const fetchMe = async () => {
      setError("");
      try {
        const res = await api.get("/profile/me");
        setMe(res.data);

        setAccountForm({
          name: res.data?.name || "",
          email: res.data?.email || "",
        });

        if (res.data?.doctor) {
          setDoctorForm({
            phone: res.data.doctor.phone || "",
            specialization: res.data.doctor.specialization || "",
            phone: res.data?.patient?.phone || res.data?.doctor?.phone || "",
          });

          // availability can be string or object
          let parsed = {};
          try {
            parsed =
              typeof res.data.doctor.availability === "string"
                ? JSON.parse(res.data.doctor.availability || "{}")
                : res.data.doctor.availability || {};
          } catch {
            parsed = {};
          }
          setAvailability(parsed || {});
        }
      } catch {
        setError("Failed to load profile");
      } finally {
        setLoading(false);
      }
    };

    fetchMe();
  }, []);

  useEffect(() => {
    if (!successMessage) return;
    const t = setTimeout(() => setSuccessMessage(""), 4000);
    return () => clearTimeout(t);
  }, [successMessage]);

  const initials = useMemo(() => {
    const n = me?.name || "";
    const parts = n.trim().split(" ").filter(Boolean);
    if (parts.length === 0) return "U";
    if (parts.length === 1) return parts[0][0].toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }, [me]);

  const handleAccountSave = async () => {
    setError("");
    try {
      const res = await api.put("/profile/me", accountForm);
      setMe((prev) => ({ ...prev, ...res.data }));
      setSuccessMessage("Profile updated successfully");
      setEditingAccount(false);
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to update profile");
    }
  };

  const handlePasswordSave = async () => {
    setError("");

    if (!pwForm.currentPassword || !pwForm.newPassword) {
      setError("Please fill current and new password");
      return;
    }
    if (pwForm.newPassword.length < 6) {
      setError("New password must be at least 6 characters");
      return;
    }
    if (pwForm.newPassword !== pwForm.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    try {
  await api.put("/profile/me/password", {
    currentPassword: pwForm.currentPassword,
    newPassword: pwForm.newPassword,
  });

  setPwForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
  setSuccessMessage("Password changed successfully");

  // close modal if it was forced
  setShowForcePasswordModal(false);

} catch (err) {
  setError(err?.response?.data?.message || "Failed to change password");
}};

  const handleDoctorSave = async () => {
    setError("");
    try {
      const res = await api.put("/profile/me/doctor", {
        phone: doctorForm.phone,
        specialization: doctorForm.specialization,
        availability, // send object, backend stringifies
      });

      setMe((prev) => ({ ...prev, doctor: res.data }));
      setSuccessMessage("Doctor profile updated successfully");
      setEditingDoctor(false);
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to update doctor profile");
    }
  };

  if (loading) {
    return <div className="p-10 text-gray-400 animate-pulse">Loading profile...</div>;
  }

  if (!me) {
    return <div className="p-10 text-red-500">Failed to load profile.</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="p-10 space-y-8 max-w-6xl mx-auto">
        <PageHeader title="Profile" />

        {successMessage && (
          <div
            className="mb-2 px-4 py-3 rounded-xl border"
            style={{
              backgroundColor: "rgba(16,185,129,0.08)",
              borderColor: "rgba(16,185,129,0.20)",
              color: "rgb(21,128,61)",
            }}
          >
            {successMessage}
          </div>
        )}

        {error && (
          <div className="mb-2 bg-red-50 text-red-600 px-4 py-3 rounded-xl border border-red-100">
            {error}
          </div>
        )}

        {/* Top card */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8">
          <div className="flex items-center gap-5">
            <div
              className="h-16 w-16 rounded-2xl flex items-center justify-center text-xl font-bold border"
              style={{ backgroundColor: ACCENT_SOFT, borderColor: ACCENT_RING, color: "#1f2937" }}
            >
              {initials}
            </div>

            <div className="flex-1">
              <p className="text-2xl font-bold text-gray-900">{me.name}</p>
              <p className="text-gray-600">{me.email}</p>
              <p className="text-xs mt-2 inline-flex px-2 py-1 rounded-full bg-gray-100 text-gray-600 border border-gray-200">
                Role: {me.role}
              </p>
            </div>
          </div>
        </div>

        {/* Account settings */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-sm font-semibold text-gray-700">Account</h2>

            {!editingAccount ? (
              <button
                onClick={() => setEditingAccount(true)}
                className="text-sm px-4 py-2 rounded-xl border border-gray-200 hover:bg-gray-50 transition"
              >
                Edit
              </button>
            ) : (
              <button
                onClick={() => {
                  setEditingAccount(false);
                  setAccountForm({ name: me.name || "", email: me.email || "" });
                }}
                className="text-sm px-4 py-2 rounded-xl border border-gray-200 hover:bg-gray-50 transition"
              >
                Cancel
              </button>
            )}
          </div>

          <div className="grid md:grid-cols-2 gap-5">
            <div>
              <label className="text-xs text-gray-500">Name</label>
              <input
                disabled={!editingAccount}
                value={accountForm.name}
                onChange={(e) => setAccountForm((p) => ({ ...p, name: e.target.value }))}
                className={`mt-1 w-full rounded-xl px-4 py-2 border border-gray-200 outline-none transition focus:ring-2 ${
                  editingAccount ? "" : "bg-gray-50"
                }`}
              />
            </div>

            <div>
              <label className="text-xs text-gray-500">Email</label>
              <input
                disabled={!editingAccount}
                value={accountForm.email}
                onChange={(e) => setAccountForm((p) => ({ ...p, email: e.target.value }))}
                className={`mt-1 w-full rounded-xl px-4 py-2 border border-gray-200 outline-none transition focus:ring-2 ${
                  editingAccount ? "" : "bg-gray-50"
                }`}
              />
            </div>
            <div>
  <label className="text-xs text-gray-500">Phone</label>
  <input
    disabled={!editingAccount}
    value={accountForm.phone}
    onChange={(e) =>
      setAccountForm((p) => ({ ...p, phone: e.target.value }))
    }
    className={`mt-1 w-full rounded-xl px-4 py-2 border border-gray-200 ${
      editingAccount ? "" : "bg-gray-50"
    }`}
  />
</div>
          </div>

          {editingAccount && (
            <div className="flex justify-end mt-6">
              <button
                onClick={handleAccountSave}
                className="text-white px-5 py-2 rounded-xl transition shadow-sm"
                style={{ backgroundColor: ACCENT }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = ACCENT_DARK)}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = ACCENT)}
              >
                Save
              </button>
            </div>
          )}
        </div>

        {/* Doctor-only settings */}
        {isDoctor && (
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-sm font-semibold text-gray-700">Doctor Profile</h2>

              {!editingDoctor ? (
                <button
                  onClick={() => setEditingDoctor(true)}
                  className="text-sm px-4 py-2 rounded-xl border border-gray-200 hover:bg-gray-50 transition"
                >
                  Edit
                </button>
              ) : (
                <button
                  onClick={() => {
                    setEditingDoctor(false);

                    const d = me?.doctor;
                    setDoctorForm({
                      phone: d?.phone || "",
                      specialization: d?.specialization || "",
                    });

                    let parsed = {};
                    try {
                      parsed =
                        typeof d?.availability === "string"
                          ? JSON.parse(d?.availability || "{}")
                          : d?.availability || {};
                    } catch {
                      parsed = {};
                    }
                    setAvailability(parsed || {});
                  }}
                  className="text-sm px-4 py-2 rounded-xl border border-gray-200 hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
              )}
            </div>

            <div className="grid md:grid-cols-2 gap-5">
              <div>
                <label className="text-xs text-gray-500">Phone</label>
                <input
                  disabled={!editingDoctor}
                  value={doctorForm.phone}
                  onChange={(e) => setDoctorForm((p) => ({ ...p, phone: e.target.value }))}
                  className={`mt-1 w-full rounded-xl px-4 py-2 border border-gray-200 outline-none transition focus:ring-2 ${
                    editingDoctor ? "" : "bg-gray-50"
                  }`}
                />
              </div>

              <div>
                <label className="text-xs text-gray-500">Specialization</label>
                <input
                  disabled={!editingDoctor}
                  value={doctorForm.specialization}
                  onChange={(e) =>
                    setDoctorForm((p) => ({ ...p, specialization: e.target.value }))
                  }
                  className={`mt-1 w-full rounded-xl px-4 py-2 border border-gray-200 outline-none transition focus:ring-2 ${
                    editingDoctor ? "" : "bg-gray-50"
                  }`}
                />
              </div>
            </div>

            {/* Availability editor */}
            <div className="mt-7">
              <div
                className="rounded-xl border p-4 mb-5"
                style={{ backgroundColor: ACCENT_SOFT, borderColor: ACCENT_RING }}
              >
                <p className="text-sm font-semibold text-gray-700">Availability</p>
                <p className="text-sm text-gray-600 mt-1">
                  Set working hours for each weekday.
                </p>
              </div>

              <div className="space-y-5">
                {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"].map((day) => (
                  <div key={day} className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700 w-28">{day}</span>

                    {availability?.[day] ? (
                      <div className="flex gap-3 items-center">
                        <input
                          type="time"
                          disabled={!editingDoctor}
                          value={availability[day].start}
                          onChange={(e) =>
                            setAvailability({
                              ...availability,
                              [day]: { ...availability[day], start: e.target.value },
                            })
                          }
                          className={`border border-gray-200 rounded-xl px-3 py-1.5 text-sm ${
                            editingDoctor ? "" : "bg-gray-50"
                          }`}
                        />

                        <span className="text-gray-400">–</span>

                        <input
                          type="time"
                          disabled={!editingDoctor}
                          value={availability[day].end}
                          onChange={(e) =>
                            setAvailability({
                              ...availability,
                              [day]: { ...availability[day], end: e.target.value },
                            })
                          }
                          className={`border border-gray-200 rounded-xl px-3 py-1.5 text-sm ${
                            editingDoctor ? "" : "bg-gray-50"
                          }`}
                        />

                        <button
                          disabled={!editingDoctor}
                          onClick={() => setAvailability({ ...availability, [day]: null })}
                          className={`text-xs px-3 py-1 rounded-lg transition ${
                            editingDoctor
                              ? "bg-red-50 text-red-600 hover:bg-red-100"
                              : "bg-gray-100 text-gray-400 cursor-not-allowed"
                          }`}
                        >
                          OFF
                        </button>
                      </div>
                    ) : (
                      <button
                        disabled={!editingDoctor}
                        onClick={() =>
                          setAvailability({
                            ...availability,
                            [day]: { start: "09:00", end: "17:00" },
                          })
                        }
                        className={`text-sm px-3 py-1 rounded-lg transition ${
                          editingDoctor
                            ? "bg-blue-50 text-blue-600 hover:bg-blue-100"
                            : "bg-gray-100 text-gray-400 cursor-not-allowed"
                        }`}
                      >
                        Set Hours
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {editingDoctor && (
              <div className="flex justify-end mt-7">
                <button
                  onClick={handleDoctorSave}
                  className="text-white px-5 py-2 rounded-xl transition shadow-sm"
                  style={{ backgroundColor: ACCENT }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = ACCENT_DARK)}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = ACCENT)}
                >
                  Save Doctor Profile
                </button>
              </div>
            )}
          </div>
        )}

        {/* Change password */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8">
          <h2 className="text-sm font-semibold text-gray-700 mb-5">Change Password</h2>

          <div className="grid md:grid-cols-3 gap-5">
            <div>
              <label className="text-xs text-gray-500">Current password</label>
              <input
                type="password"
                value={pwForm.currentPassword}
                onChange={(e) => setPwForm((p) => ({ ...p, currentPassword: e.target.value }))}
                className="mt-1 w-full rounded-xl px-4 py-2 border border-gray-200 outline-none transition focus:ring-2"
              />
            </div>

            <div>
              <label className="text-xs text-gray-500">New password</label>
              <input
                type="password"
                value={pwForm.newPassword}
                onChange={(e) => setPwForm((p) => ({ ...p, newPassword: e.target.value }))}
                className="mt-1 w-full rounded-xl px-4 py-2 border border-gray-200 outline-none transition focus:ring-2"
              />
            </div>

            <div>
              <label className="text-xs text-gray-500">Confirm new password</label>
              <input
                type="password"
                value={pwForm.confirmPassword}
                onChange={(e) => setPwForm((p) => ({ ...p, confirmPassword: e.target.value }))}
                className="mt-1 w-full rounded-xl px-4 py-2 border border-gray-200 outline-none transition focus:ring-2"
              />
            </div>
          </div>

          <div className="flex justify-end mt-6">
            <button
              onClick={handlePasswordSave}
              className="text-white px-5 py-2 rounded-xl transition shadow-sm"
              style={{ backgroundColor: ACCENT }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = ACCENT_DARK)}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = ACCENT)}
            >
              Update Password
            </button>
          </div>
        </div>
      </div>
      {showForcePasswordModal && (
  <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50">

    <div className="bg-white rounded-2xl shadow-lg border border-gray-200 w-[420px] p-8">

      <h2 className="text-xl font-semibold text-gray-900 mb-2">
        Change your password
      </h2>

      <p className="text-sm text-gray-500 mb-6">
        You must change your password before using the system.
      </p>

      <input
        type="password"
        placeholder="Current password"
        className="w-full border border-gray-200 rounded-xl px-4 py-2 mb-4"
        value={pwForm.currentPassword}
        onChange={(e) =>
          setPwForm((p) => ({ ...p, currentPassword: e.target.value }))
        }
      />

      <input
        type="password"
        placeholder="New password"
        className="w-full border border-gray-200 rounded-xl px-4 py-2 mb-4"
        value={pwForm.newPassword}
        onChange={(e) =>
          setPwForm((p) => ({ ...p, newPassword: e.target.value }))
        }
      />

      <input
        type="password"
        placeholder="Confirm password"
        className="w-full border border-gray-200 rounded-xl px-4 py-2 mb-6"
        value={pwForm.confirmPassword}
        onChange={(e) =>
          setPwForm((p) => ({ ...p, confirmPassword: e.target.value }))
        }
      />

      <button
        onClick={handlePasswordSave}
        className="w-full bg-[#579ec0] hover:bg-[#4b8fb0] text-white py-2 rounded-xl transition"
      >
        Update Password
      </button>

    </div>

  </div>
)}
    </div>
  );
}

export default Profile;