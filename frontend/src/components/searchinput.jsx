function SearchInput({ value, onChange, placeholder }) {
  return (
    <input
      type="text"
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className="w-72 bg-gray-50 px-4 py-2 rounded-lg text-sm focus:ring-2 focus:ring-teal-400 outline-none transition"
    />
  );
}

export default SearchInput;
