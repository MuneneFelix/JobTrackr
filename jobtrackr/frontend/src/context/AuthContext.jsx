import { createContext, useContext, useState, useCallback } from "react";

const API = "/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem("token"));
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem("user");
    return saved ? JSON.parse(saved) : null;
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  /** Login: exchange email+password for a token */
  const login = async (email, password) => {
    setLoading(true);
    setError(null);
    try {
      const form = new URLSearchParams({ username: email, password });
      const res = await fetch(`${API}/token`, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: form,
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.detail || "Login failed");
      }
      const data = await res.json();
      localStorage.setItem("token", data.access_token);
      localStorage.setItem("user", JSON.stringify({ email }));
      setToken(data.access_token);
      setUser({ email });
      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setToken(null);
    setUser(null);
  };

  /**
   * Authenticated fetch wrapper — use this instead of raw fetch() throughout
   * the app. Automatically attaches Authorization header.
   *
   * Usage:  const data = await authFetch("/sources/")
   */
  const authFetch = useCallback(
    async (path, options = {}) => {
      const headers = {
        "Content-Type": "application/json",
        ...(options.headers || {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      };
      const res = await fetch(`${API}${path}`, { ...options, headers });
      if (res.status === 401) {
        logout();
        throw new Error("Session expired — please log in again");
      }
      return res;
    },
    [token]
  );

  return (
    <AuthContext.Provider value={{ token, user, login, logout, authFetch, loading, error }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}
