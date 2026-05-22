export const DEFAULT_ADMIN_SETTINGS = {
  branding: {
    clinicName: "SHQMS",
    tagline: "Admin Portal",
    logoPath: "",
  },
  features: {
    menuItems: {
      doctors: true,
      schedules: true,
      services: true,
      staff: true,
      patients: true,
      calendar: true,
      notifications: true,
      reports: true,
    },
    dashboardWidgets: {
      totalPatients: true,
      totalDoctors: true,
      totalStaff: true,
      appointmentsToday: true,
      pendingVerifications: true,
      activeAppointments: true,
      recentPatients: true,
      quickActions: true,
      recentAppointments: true,
    },
    patientMenuItems: {
      dashboard: true,
      bookAppointment: true,
      calendar: true,
      profile: true,
    },
    doctorMenuItems: {
      dashboard: true,
      schedule: true,
      dayOff: true,
      appointments: true,
      queue: true,
      attendance: true,
      calendar: true,
      notifications: true,
      profile: true,
    },
    guestMenuItems: {
      doctors: true,
      services: true,
      queue: true,
      announcements: true,
    },
  },
  theme: {
    accentColor: "#1FA4A9",
    sidebarColor: "#0f172a",
    fontSize: "comfortable",
  },
  homepage: {
    hero: {
      subtitle: "Smart Healthcare Availability and Queue Management System",
      quote: "\"Skip the Wait, Get the Care.\"",
      ctaLabel: "Book Appointment",
    },
    schedule: {
      title: "Today's Schedule",
      loadingText: "Fetching hours...",
      closedTodayText: "Closed Today",
      closedNowText: "Closed Now",
      openText: "Now Open",
      openShortenedText: "Open (Shortened)",
      clinicClosedText: "CLINIC CLOSED",
      specialScheduleLabel: "Special Schedule",
    },
    emergency: {
      title: "Emergency?",
      message: "Call national emergency services immediately:",
      hotline: "911",
      caption: "National Emergency Hotline",
    },
    contact: {
      description: "Smart Healthcare Availability and Queue Management System. Streamlining patient care with modern technology.",
      locationTitle: "Location",
      address: "Regalado Road, Quezon City",
      sectionTitle: "Contact Information",
      emailLabel: "Email Address",
      email: "smarthealthcare@gmail.com",
      customerServiceLabel: "Customer Service",
      customerServicePhone: "+639999046290",
      managerLabel: "General Manager",
      managerPhone: "+639511246060",
    },
    social: {
      sectionTitle: "Connect With Us",
      facebookLabel: "Smart Healthcare Availability and Queue Management",
      facebookUrl: "https://imgs.search.brave.com/K6P0AEBGlnzkaHI_RgWnVhabSmflD3sRLiCAIeTPrtQ/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9pbWFn/ZXMubWVtZS1hcnNl/bmFsLmNvbS8zOTMz/MjY5MjdmNzU3ZTA3/ZDc4NjkzNmFkNWQx/ZjM1ZS5qcGc",
      instagramLabel: "@smart_healthcaresys",
      instagramUrl: "https://imgs.search.brave.com/K6P0AEBGlnzkaHI_RgWnVhabSmflD3sRLiCAIeTPrtQ/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9pbWFn/ZXMubWVtZS1hcnNl/bmFsLmNvbS8zOTMz/MjY5MjdmNzU3ZTA3/ZDc4NjkzNmFkNWQx/ZjM1ZS5qcGc",
    },
    footer: {
      copyright: "Copyright 2026 SHQMS. All Rights Reserved.",
      privacyLabel: "Privacy Policy",
      privacyUrl: "#",
      termsLabel: "Terms of Service",
      termsUrl: "#",
    },
  },
};

const isPlainObject = (value) =>
  Boolean(value) && typeof value === "object" && !Array.isArray(value);

export function mergeAdminSettings(settings = {}) {
  const merge = (defaults, source) =>
    Object.entries(defaults).reduce((acc, [key, defaultValue]) => {
      const sourceValue = source?.[key];
      acc[key] = isPlainObject(defaultValue)
        ? merge(defaultValue, isPlainObject(sourceValue) ? sourceValue : {})
        : sourceValue ?? defaultValue;
      return acc;
    }, {});

  return merge(DEFAULT_ADMIN_SETTINGS, settings);
}

export function resolveLogoUrl(logoPath) {
  if (!logoPath) return "";
  if (/^https?:\/\//i.test(logoPath)) return logoPath;

  const baseUrl = import.meta.env.VITE_BACKEND_URL || "";
  return `${baseUrl}/storage/${logoPath}`;
}

export const adminFontSizes = {
  compact: "14px",
  comfortable: "16px",
  large: "18px",
};
