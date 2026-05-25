import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import * as authApi from "../api/authApi";

const AuthCtx = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem("token");
      if (token) {
        try {
          const data = await authApi.getCurrentUser();
          // Extract role from abilities if not directly on user
          let role = 'patient';
          if (data.abilities?.includes('admin')) role = 'admin';
          else if (data.abilities?.includes('doctor')) role = 'doctor';
          else if (data.abilities?.includes('staff')) role = 'staff';

          setUser({ ...data.user, role, db_role: data.user.role });
        } catch (error) {
          console.error("Auth init error:", error);
          localStorage.removeItem("token");
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const value = useMemo(() => {
    return {
      user,
      loading,
      login: async (credentials) => {
        const data = await authApi.login(credentials);
        localStorage.setItem("token", data.token);
        setUser({ ...data.user, role: data.role, db_role: data.user.role });
        return data;
      },
      register: async (patientData) => {
        const data = await authApi.registerPatient(patientData);
        localStorage.setItem("token", data.token);
        setUser({ ...data.user, role: data.role, db_role: data.user.role });
        return data;
      },
      fetchUser: async () => {
        try {
          const data = await authApi.getCurrentUser();
          let role = 'patient';
          if (data.abilities?.includes('admin')) role = 'admin';
          else if (data.abilities?.includes('doctor')) role = 'doctor';
          else if (data.abilities?.includes('staff')) role = 'staff';
          setUser({ ...data.user, role, db_role: data.user.role });
        } catch (error) {
          console.error("fetchUser error:", error);
        }
      },
      logout: async () => {
        try {
          await authApi.logout();
        } catch (error) {
          console.error("Logout error:", error);
        } finally {
          setUser(null);
          localStorage.removeItem("token");
          sessionStorage.clear();
        }
      },
    };
  }, [user, loading]);

  if (loading) {
    return <div className="h-screen flex items-center justify-center text-primary font-medium">Loading Application...</div>;
  }

  return <AuthCtx.Provider value={value}>{children}</AuthCtx.Provider>;
}

export function useAuth() {
  return useContext(AuthCtx);
}
