import React, { createContext, useContext, useMemo, useState } from "react";

const AuthCtx = createContext(null);


function loadUser() {
  try {
    const raw = localStorage.getItem("clinic_user");
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(loadUser); 

  const value = useMemo(() => {
    return {
      user,
      login: (payload) => {
        setUser(payload);
        localStorage.setItem("clinic_user", JSON.stringify(payload));
      },
      logout: () => {
        setUser(null);
        localStorage.removeItem("clinic_user");
      },
    };
  }, [user]);

  return <AuthCtx.Provider value={value}>{children}</AuthCtx.Provider>;
}

export function useAuth() {
  return useContext(AuthCtx);
}