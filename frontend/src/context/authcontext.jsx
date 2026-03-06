import { createContext, useState, useEffect, useCallback } from "react";
import { jwtDecode } from "jwt-decode";
import axios from "axios";

const API_BASE = "http://localhost:5000/api";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  const clearTokens = useCallback(() => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    setUser(null);
  }, []);

  /* =========================
     Restore session on reload (try refresh if access token expired)
  ========================== */
  useEffect(() => {
    const accessToken = localStorage.getItem("accessToken");
    const refreshToken = localStorage.getItem("refreshToken");

    if (!accessToken) {
      if (refreshToken) localStorage.removeItem("refreshToken");
      return;
    }

    const tryRestore = async () => {
      try {
        const decoded = jwtDecode(accessToken);
        if (decoded.exp * 1000 > Date.now()) {
          setUser(decoded);
          return;
        }
        if (!refreshToken) {
          clearTokens();
          return;
        }
        const res = await axios.post(`${API_BASE}/auth/refresh`, { refreshToken });
        const { accessToken: newAccess, refreshToken: newRefresh } = res.data;
        localStorage.setItem("accessToken", newAccess);
        if (newRefresh) localStorage.setItem("refreshToken", newRefresh);
        setUser(jwtDecode(newAccess));
      } catch {
        clearTokens();
      }
    };

    tryRestore();
  }, [clearTokens]);

  /* =========================
     LOGIN – store both tokens
  ========================== */
  const login = (data) => {
    const { accessToken, refreshToken } = data;
    localStorage.setItem("accessToken", accessToken);
    if (refreshToken) localStorage.setItem("refreshToken", refreshToken);
    const decoded = jwtDecode(accessToken);
    setUser(decoded);
  };

  /* =========================
     LOGOUT – clear tokens and optionally invalidate refresh on server
  ========================== */
  const logout = () => {
    const refreshToken = localStorage.getItem("refreshToken");
    clearTokens();
    if (refreshToken) {
      axios.post(`${API_BASE}/auth/logout`, { refreshToken }).catch(() => {});
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
