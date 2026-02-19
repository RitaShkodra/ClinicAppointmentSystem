function ActionButtons({ onEdit, onDelete, showDelete }) {
  return (
    <div className="flex gap-2">
      <button
        onClick={onEdit}
        className="px-3 py-1 text-xs bg-teal-100 text-teal-700 rounded-md hover:bg-teal-200 transition"
      >
        Edit
      </button>

      {showDelete && (
        <button
          onClick={onDelete}
          className="px-3 py-1 text-xs bg-red-100 text-red-600 rounded-md hover:bg-red-200 transition"
        >
          Delete
        </button>
      )}
    </div>
  );
}

export default ActionButtons;
