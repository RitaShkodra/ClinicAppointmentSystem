function PageHeader({ title, buttonText, onButtonClick }) {
  return (
    <div className="flex justify-between items-center mb-8">
      <div>
        <h1 className="text-3xl font-semibold text-gray-800">
          {title}
        </h1>
        <div className="w-14 h-1 bg-teal-500 mt-2 rounded"></div>
      </div>

      {buttonText && (
        <button
          onClick={onButtonClick}
          className="bg-teal-500 text-white px-5 py-2 rounded-lg hover:bg-teal-600 transition shadow-sm"
        >
          {buttonText}
        </button>
      )}
    </div>
  );
}

export default PageHeader;
