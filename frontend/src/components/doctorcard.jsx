function DoctorFormCard({
  editingDoctor,
  form,
  onChange,
  onCancel,
  onSubmit,
}) {
  const ACCENT = "#579ec0";
  const ACCENT_DARK = "#4b8fb0";

  return (
    <div className="bg-white rounded-2xl shadow-sm p-6 mb-6 border border-gray-200 max-w-3xl">
      
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-900">
          {editingDoctor ? "Edit Doctor" : "Add New Doctor"}
        </h2>

        <div
          className="w-10 h-1 mt-2 rounded"
          style={{ backgroundColor: ACCENT }}
        />
      </div>

      <form onSubmit={onSubmit} className="grid grid-cols-2 gap-5">

        {/* First Name */}
        <div className="flex flex-col">
          <label className="text-xs text-gray-500 mb-1">
            First Name
          </label>
          <input
            type="text"
            name="firstName"
            value={form.firstName}
            onChange={onChange}
            className="border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none transition focus:ring-4 focus:ring-[#b0d2db]/40 focus:border-[#b0d2db]"
            required
          />
        </div>

        {/* Last Name */}
        <div className="flex flex-col">
          <label className="text-xs text-gray-500 mb-1">
            Last Name
          </label>
          <input
            type="text"
            name="lastName"
            value={form.lastName}
            onChange={onChange}
            className="border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none transition focus:ring-4 focus:ring-[#b0d2db]/40 focus:border-[#b0d2db]"
            required
          />
        </div>

        {/* Specialization */}
        <div className="flex flex-col">
          <label className="text-xs text-gray-500 mb-1">
            Specialization
          </label>
          <input
            type="text"
            name="specialization"
            value={form.specialization}
            onChange={onChange}
            className="border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none transition focus:ring-4 focus:ring-[#b0d2db]/40 focus:border-[#b0d2db]"
            required
          />
        </div>

        {/* Phone */}
        <div className="flex flex-col">
          <label className="text-xs text-gray-500 mb-1">
            Phone
          </label>
          <input
            type="text"
            name="phone"
            value={form.phone}
            onChange={onChange}
            className="border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none transition focus:ring-4 focus:ring-[#b0d2db]/40 focus:border-[#b0d2db]"
          />
        </div>

        {/* Email */}
        <div className="flex flex-col col-span-2">
          <label className="text-xs text-gray-500 mb-1">
            Email
          </label>
          <input
            type="email"
            name="email"
            value={form.email}
            onChange={onChange}
            className="border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none transition focus:ring-4 focus:ring-[#b0d2db]/40 focus:border-[#b0d2db]"
          />
        </div>

        {/* Buttons */}
        <div className="col-span-2 flex justify-end gap-3 mt-3">

          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-sm rounded-xl bg-gray-100 text-gray-700 hover:bg-gray-200 transition"
          >
            Cancel
          </button>

          <button
            type="submit"
            className="px-4 py-2 text-sm rounded-xl text-white transition shadow-sm"
            style={{ backgroundColor: ACCENT }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.backgroundColor = ACCENT_DARK)
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.backgroundColor = ACCENT)
            }
          >
            {editingDoctor ? "Update" : "Save"}
          </button>

        </div>
      </form>
    </div>
  );
}

export default DoctorFormCard;