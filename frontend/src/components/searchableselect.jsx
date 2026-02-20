import { useState, useRef, useEffect } from "react";

function SearchableSelect({
  label,
  options,
  selectedId,
  onSelect,
  placeholder,
  getLabel,
}) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef(null);

  // Sync selectedId with input
  useEffect(() => {
    if (!selectedId) {
      setQuery("");
      return;
    }

    const selectedOption = options.find(
      (opt) => opt.id === selectedId
    );

    if (selectedOption) {
      setQuery(getLabel(selectedOption));
    }
  }, [selectedId, options]);

  const filtered = options.filter((opt) =>
    getLabel(opt).toLowerCase().includes(query.toLowerCase())
  );

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () =>
      document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={wrapperRef}>
      {label && (
        <label className="text-xs text-gray-500 mb-1 block">
          {label}
        </label>
      )}

      <input
        type="text"
        placeholder={placeholder}
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-400"
      />

      {open && (
        <div className="absolute z-50 w-full bg-white border border-gray-200 rounded-lg mt-1 max-h-48 overflow-y-auto shadow-md">
          {filtered.length === 0 && (
            <div className="px-3 py-2 text-sm text-gray-400">
              No results found
            </div>
          )}

          {filtered.map((option) => (
            <div
              key={option.id}
              onClick={() => {
                onSelect(option);
                setQuery(getLabel(option));
                setOpen(false);
              }}
              className="px-3 py-2 hover:bg-teal-50 cursor-pointer text-sm"
            >
              {getLabel(option)}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default SearchableSelect;