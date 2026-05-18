import { createContext, useContext, useEffect, useMemo, useState } from "react";
import * as publicApi from "../api/publicApi";
import { adminFontSizes, mergeAdminSettings } from "../config/adminSettings";

const AdminSettingsContext = createContext(null);

export function AdminSettingsProvider({ children }) {
  const [settings, setSettings] = useState(() => mergeAdminSettings());
  const [loading, setLoading] = useState(true);

  const applySettings = (nextSettings) => {
    const merged = mergeAdminSettings(nextSettings);
    setSettings(merged);
    return merged;
  };

  useEffect(() => {
    let alive = true;

    publicApi.getSettings()
      .then((data) => {
        if (alive) applySettings(data);
      })
      .catch((error) => {
        console.error("Failed to load admin settings:", error);
      })
      .finally(() => {
        if (alive) setLoading(false);
      });

    return () => {
      alive = false;
    };
  }, []);

  useEffect(() => {
    document.documentElement.style.setProperty("--color-primary", settings.theme.accentColor);
    document.documentElement.style.setProperty("--admin-accent", settings.theme.accentColor);
    document.documentElement.style.setProperty("--admin-sidebar", settings.theme.sidebarColor);
    document.documentElement.style.setProperty("--admin-font-size", adminFontSizes[settings.theme.fontSize]);
  }, [settings.theme.accentColor, settings.theme.fontSize, settings.theme.sidebarColor]);

  const value = useMemo(() => ({
    settings,
    loading,
    setSettings: applySettings,
  }), [loading, settings]);

  return (
    <AdminSettingsContext.Provider value={value}>
      {children}
    </AdminSettingsContext.Provider>
  );
}

export function useAdminSettings() {
  const context = useContext(AdminSettingsContext);

  if (!context) {
    return {
      settings: mergeAdminSettings(),
      loading: false,
      setSettings: () => {},
    };
  }

  return context;
}
