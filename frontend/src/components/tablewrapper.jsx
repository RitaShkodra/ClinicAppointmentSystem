function TableWrapper({ children }) {
  return (
    <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100">
      <table className="w-full text-sm">
        {children}
      </table>
    </div>
  );
}

export default TableWrapper;
