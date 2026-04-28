import React, { createContext, useContext, useEffect, useMemo, useState } from "react";

const AuthCtx = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const raw = localStorage.getItem("demo_user");
    if (raw) setUser(JSON.parse(raw));
  }, []);

  const value = useMemo(() => {
    return {
      user,
      login: (payload) => {
        setUser(payload);
        localStorage.setItem("demo_user", JSON.stringify(payload));
      },
      logout: () => {
        setUser(null);
        localStorage.removeItem("demo_user");
      },
    };
  }, [user]);

  return <AuthCtx.Provider value={value}>{children}</AuthCtx.Provider>;
}

export function useAuth() {
  return useContext(AuthCtx);
}
