import { createContext, useContext, useState, useCallback, useEffect } from "react";

const API = "/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  // No token stored in state/localStorage — auth is driven by HttpOnly cookies.
  // We keep a lightweight `user` object in state (just email) to drive UI.
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);  // true while we check session on mount
  const [error, setError] = useState(null);

  /** Check session on mount — only if we have reason to believe a session exists. */
  useEffect(() => {
    // sessionStorage flag is set on login and cleared on logout.
    // Avoids a noisy-but-expected 401 in the console on fresh page loads.
    if (!sessionStorage.getItem("hasSession")) {
      setLoading(false);
      return;
    }
    fetch(`${API}/auth/me`, { credentials: "include" })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.email) {
          setUser({ email: data.email, is_admin: data.is_admin });
        } else {
          // Cookie expired or invalid — clear the flag
          sessionStorage.removeItem("hasSession");
        }
      })
      .catch(() => sessionStorage.removeItem("hasSession"))
      .finally(() => setLoading(false));
  }, []);

  /** Login: exchange email+password for cookies (server sets HttpOnly cookies). */
  const login = async (email, password) => {
    setLoading(true);
    setError(null);
    try {
      const form = new URLSearchParams({ username: email, password });
      const res = await fetch(`${API}/token`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: form,
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.detail || "Login failed");
      }
      sessionStorage.setItem("hasSession", "1");
      setUser({ email });
      return await res.json();
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = useCallback(async () => {
    sessionStorage.removeItem("hasSession");
    try {
      await fetch(`${API}/auth/logout`, { method: "POST", credentials: "include" });
    } catch (_) {
      // best-effort
    }
    setUser(null);
  }, []);

  /**
   * Authenticated fetch wrapper — cookies are sent automatically via
   * `credentials: "include"`. No Authorization header needed.
   *
   * Usage:  const res = await authFetch("/sources/")
   */
  const authFetch = useCallback(
    async (path, options = {}) => {
      const headers = {
        "Content-Type": "application/json",
        "X-Requested-With": "XMLHttpRequest",
        ...(options.headers || {}),
      };
      const res = await fetch(`${API}${path}`, {
        ...options,
        credentials: "include",
        headers,
      });
      if (res.status === 401) {
        sessionStorage.removeItem("hasSession");
        setUser(null);
        throw new Error("Session expired — please log in again");
      }
      return res;
    },
    []
  );

  return (
    <AuthContext.Provider value={{ user, login, logout, authFetch, loading, error }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}
