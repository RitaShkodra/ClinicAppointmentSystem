function PatientCard({
  editingPatient,
  form,
  onChange,
  onCancel,
  onSubmit,
}) {
  return (
    <div className="bg-white rounded-xl shadow-sm p-6 mb-6 border border-teal-100 max-w-3xl">
      <div className="mb-4">
        <h2 className="text-xl font-semibold text-gray-800">
          {editingPatient ? "Edit Patient" : "Add New Patient"}
        </h2>
        <div className="w-10 h-1 bg-teal-500 mt-2 rounded"></div>
      </div>

      <form onSubmit={onSubmit} className="grid grid-cols-2 gap-4">
        
        <div className="flex flex-col">
          <label className="text-xs text-gray-500 mb-1">First Name</label>
          <input
            type="text"
            name="firstName"
            value={form.firstName}
            onChange={onChange}
            className="border border-gray-200 rounded-md px-3 py-1.5 text-sm focus:ring-2 focus:ring-teal-400 focus:outline-none transition"
            required
          />
        </div>

        <div className="flex flex-col">
          <label className="text-xs text-gray-500 mb-1">Last Name</label>
          <input
            type="text"
            name="lastName"
            value={form.lastName}
            onChange={onChange}
            className="border border-gray-200 rounded-md px-3 py-1.5 text-sm focus:ring-2 focus:ring-teal-400 focus:outline-none transition"
            required
          />
        </div>

        <div className="flex flex-col">
          <label className="text-xs text-gray-500 mb-1">Phone</label>
          <input
            type="text"
            name="phone"
            value={form.phone}
            onChange={onChange}
            className="border border-gray-200 rounded-md px-3 py-1.5 text-sm focus:ring-2 focus:ring-teal-400 focus:outline-none transition"
            required
          />
        </div>

        <div className="flex flex-col">
          <label className="text-xs text-gray-500 mb-1">Email</label>
          <input
            type="email"
            name="email"
            value={form.email}
            onChange={onChange}
            className="border border-gray-200 rounded-md px-3 py-1.5 text-sm focus:ring-2 focus:ring-teal-400 focus:outline-none transition"
          />
        </div>

        <div className="col-span-2 flex justify-end gap-3 mt-2">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-1.5 text-sm rounded-md bg-gray-100 text-gray-700 hover:bg-gray-200 transition"
          >
            Cancel
          </button>

          <button
            type="submit"
            className="px-4 py-1.5 text-sm rounded-md bg-teal-500 text-white hover:bg-teal-600 transition shadow-sm"
          >
            {editingPatient ? "Update" : "Save"}
          </button>
        </div>

      </form>
    </div>
  );
}

export default PatientCard;
