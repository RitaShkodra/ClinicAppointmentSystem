function Card({ children }) {
  return (
    <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
      {children}
    </div>
  );
}

export default Card;
