import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { getMeRequest, loginRequest, registerRequest } from "../api/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem("token"));
  const [user, setUser] = useState(() => {
    const raw = localStorage.getItem("user");
    return raw ? JSON.parse(raw) : null;
  });
  const [bootstrapping, setBootstrapping] = useState(true);

  const persistAuth = (authData) => {
    const { token: nextToken, ...userData } = authData;
    localStorage.setItem("token", nextToken);
    localStorage.setItem("user", JSON.stringify(userData));
    setToken(nextToken);
    setUser(userData);
  };

  const login = async (email, password) => {
    const data = await loginRequest({ email, password });
    persistAuth(data);
    return data;
  };

  const register = async (name, email, password, role) => {
    const data = await registerRequest({ name, email, password, role });
    persistAuth(data);
    return data;
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setToken(null);
    setUser(null);
  };

  useEffect(() => {
    const loadCurrentUser = async () => {
      if (!token || user) {
        setBootstrapping(false);
        return;
      }
      try {
        const me = await getMeRequest();
        localStorage.setItem("user", JSON.stringify(me));
        setUser(me);
      } catch {
        logout();
      } finally {
        setBootstrapping(false);
      }
    };
    loadCurrentUser();
  }, [token]);

  const value = useMemo(
    () => ({
      token,
      user,
      isAuthenticated: Boolean(token),
      bootstrapping,
      login,
      register,
      logout,
    }),
    [token, user, bootstrapping]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used inside AuthProvider");
  return context;
}
