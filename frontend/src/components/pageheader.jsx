function PageHeader({ title, buttonText, onButtonClick }) {
  const ACCENT = "#579ec0";
  const ACCENT_DARK = "#4b8fb0"; // slightly darker hover

  return (
    <div className="flex justify-between items-center mb-8">
      <div>
        <h1 className="text-3xl font-semibold text-gray-800">
          {title}
        </h1>

        <div
          className="w-10 h-1 mt-2 rounded"
          style={{ backgroundColor: ACCENT }}
        />
      </div>

      {buttonText && (
        <button
          onClick={onButtonClick}
          className="text-white px-5 py-2 rounded-lg transition shadow-sm"
          style={{ backgroundColor: ACCENT }}
          onMouseEnter={(e) =>
            (e.currentTarget.style.backgroundColor = ACCENT_DARK)
          }
          onMouseLeave={(e) =>
            (e.currentTarget.style.backgroundColor = ACCENT)
          }
        >
          {buttonText}
        </button>
      )}
    </div>
  );
}

export default PageHeader;