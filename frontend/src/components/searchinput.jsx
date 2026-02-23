function SearchInput({ value, onChange, placeholder }) {
  return (
    <input
      type="text"
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className="w-80 bg-white px-4 py-2 rounded-xl text-sm border border-gray-200 outline-none transition focus:ring-4 focus:ring-[#b0d2db]/40 focus:border-[#b0d2db] shadow-sm"
    />
  );
}

export default SearchInput;