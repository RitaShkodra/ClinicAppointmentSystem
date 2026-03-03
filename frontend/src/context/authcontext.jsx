import { createContext, useState, useEffect } from "react";
import { jwtDecode } from "jwt-decode";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  /* =========================
     Restore session on reload
  ========================== */
  useEffect(() => {
    const token = localStorage.getItem("accessToken");

    if (!token) return;

    try {
      const decoded = jwtDecode(token);

      // check expiration
      if (decoded.exp * 1000 < Date.now()) {
        logout();
        return;
      }

      setUser(decoded);
    } catch (error) {
      logout();
    }
  }, []);

  /* =========================
     LOGIN
  ========================== */
  const login = (data) => {
    const { accessToken } = data;

    localStorage.setItem("accessToken", accessToken);

    const decoded = jwtDecode(accessToken);
    setUser(decoded);
  };

  /* =========================
     LOGOUT
  ========================== */
  const logout = () => {
    setUser(null);
    localStorage.removeItem("accessToken");
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
