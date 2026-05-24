import React, { createContext, useContext, useState, useEffect } from 'react';

const BrandingContext = createContext(null);

const DEFAULT_BRANDING = {
  name: "MediQueue",
  logoText: "MediQueue",
  logoIcon: "heartbeat",
  primaryColor: "#1FA4A9"
};

export function BrandingProvider({ children }) {
  const [branding, setBrandingState] = useState(() => {
    try {
      const stored = localStorage.getItem('clinic_branding');
      if (stored) {
        const parsed = JSON.parse(stored);
        return { ...DEFAULT_BRANDING, ...parsed };
      }
    } catch (e) {
      console.error("Failed to load branding", e);
    }
    return DEFAULT_BRANDING;
  });

  useEffect(() => {
    // Apply primary color to CSS custom property
    document.documentElement.style.setProperty('--color-primary', branding.primaryColor);
    // Update document title dynamically
    if (branding.name) {
      document.title = `${branding.name} Clinic System`;
    }
  }, [branding]);

  const updateBranding = (newBranding) => {
    const updated = { ...branding, ...newBranding };
    setBrandingState(updated);
    localStorage.setItem('clinic_branding', JSON.stringify(updated));
  };

  const resetBranding = () => {
    setBrandingState(DEFAULT_BRANDING);
    localStorage.removeItem('clinic_branding');
  };

  return (
    <BrandingContext.Provider value={{ branding, updateBranding, resetBranding, defaultBranding: DEFAULT_BRANDING }}>
      {children}
    </BrandingContext.Provider>
  );
}

export function useBranding() {
  const context = useContext(BrandingContext);
  if (!context) {
    return {
      branding: DEFAULT_BRANDING,
      updateBranding: () => {},
      resetBranding: () => {},
      defaultBranding: DEFAULT_BRANDING
    };
  }
  return context;
}
