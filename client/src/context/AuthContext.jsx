import { createContext, useContext, useState } from "react";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("jb_user"));
    } catch {
      return null;
    }
  });

  const [token, setToken] = useState(() => localStorage.getItem("jb_token") || null);

  /** Call after a successful login or signup response */
  function login(userData, jwt) {
    setUser(userData);
    setToken(jwt);
    localStorage.setItem("jb_user", JSON.stringify(userData));
    localStorage.setItem("jb_token", jwt);
  }

  /** Clear session */
  function logout() {
    setUser(null);
    setToken(null);
    localStorage.removeItem("jb_user");
    localStorage.removeItem("jb_token");
  }

  return (
    <AuthContext.Provider value={{ user, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

/** Hook — use anywhere inside the app */
export function useAuth() {
  return useContext(AuthContext);
}
