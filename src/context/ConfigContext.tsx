"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";

export type EventMode = "christmas" | "newyear";

interface LocationConfig {
  venueName: string;
  lat: string;
  lng: string;
  date: string; // ISO Date String
}

interface RsvpMessages {
  confirmed: { title: string; message: string };
  maybe: { title: string; message: string };
  declined: { title: string; message: string };
}

interface AppConfig {
  mode: EventMode;
  adminPassword: string;
  christmas: LocationConfig;
  newyear: LocationConfig;
  playlistUrl: string;
  rules: string;
  rsvpMessages: RsvpMessages;
}

interface ConfigContextType {
  config: AppConfig;
  updateConfig: (newConfig: Partial<AppConfig>) => void;
  updateLocation: (mode: EventMode, location: Partial<LocationConfig>) => void;
  isAdminLoggedIn: boolean;
  loginAdmin: (password: string) => boolean;
  logoutAdmin: () => void;
}

// Helper to get next specific date
const getNextDate = (month: number, day: number, hour: number = 0) => {
  const now = new Date();
  let year = now.getFullYear();
  const date = new Date(year, month, day, hour);
  if (date.getTime() < now.getTime()) {
    date.setFullYear(year + 1);
  }
  return date.toISOString().slice(0, 16); // Format for datetime-local input
};

const DEFAULT_CONFIG: AppConfig = {
  mode: "newyear",
  adminPassword: "1234",
  christmas: {
    venueName: "Cabana de la Munte",
    lat: "45.4214",
    lng: "25.5229",
    date: getNextDate(11, 25, 14), // Dec 25th, 14:00
  },
  newyear: {
    venueName: "Casa Petrecerii (București)",
    lat: "44.4268",
    lng: "26.1025",
    date: getNextDate(0, 1, 0), // Jan 1st, 00:00 (Next Year)
  },
  playlistUrl: "https://open.spotify.com/playlist/37i9dQZF1DX0XUsuxWHRQd",
  rules: "1. Fără încălțăminte de stradă în casă.\n2. Fiecare aduce băutura preferată.\n3. Distracție maximă obligatorie!",
  rsvpMessages: {
    confirmed: { title: "Yey!", message: "Te așteptăm cu drag!" },
    maybe: { title: "OK!", message: "Sperăm să poți veni!" },
    declined: { title: "Păcat!", message: "Ne va fi dor de tine..." },
  },
};

const ConfigContext = createContext<ConfigContextType | undefined>(undefined);

export function ConfigProvider({ children }: { children: ReactNode }) {
  const [config, setConfig] = useState<AppConfig>(DEFAULT_CONFIG);
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    const savedConfig = localStorage.getItem("revelion_config_v4"); // Version bump for new fields
    const savedAuth = sessionStorage.getItem("revelion_admin_auth");

    if (savedConfig) {
      const parsed = JSON.parse(savedConfig);
      // Ensure nested objects have all fields (merging with default)
      setConfig({
        ...DEFAULT_CONFIG,
        ...parsed,
        christmas: { ...DEFAULT_CONFIG.christmas, ...parsed.christmas },
        newyear: { ...DEFAULT_CONFIG.newyear, ...parsed.newyear }
      });
    }
    if (savedAuth === "true") {
      setIsAdminLoggedIn(true);
    }
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (isMounted) {
      localStorage.setItem("revelion_config_v4", JSON.stringify(config));
    }
  }, [config, isMounted]);

  const updateConfig = (newConfig: Partial<AppConfig>) => {
    setConfig((prev) => ({ ...prev, ...newConfig }));
  };

  const updateLocation = (mode: EventMode, location: Partial<LocationConfig>) => {
    setConfig((prev) => ({
      ...prev,
      [mode]: { ...prev[mode], ...location },
    }));
  };

  const loginAdmin = (password: string) => {
    if (password === config.adminPassword) {
      setIsAdminLoggedIn(true);
      sessionStorage.setItem("revelion_admin_auth", "true");
      return true;
    }
    return false;
  };

  const logoutAdmin = () => {
    setIsAdminLoggedIn(false);
    sessionStorage.removeItem("revelion_admin_auth");
  };

  return (
    <ConfigContext.Provider value={{ config, updateConfig, updateLocation, isAdminLoggedIn, loginAdmin, logoutAdmin }}>
      {children}
    </ConfigContext.Provider>
  );
}

export function useConfig() {
  const context = useContext(ConfigContext);
  if (context === undefined) {
    throw new Error("useConfig must be used within a ConfigProvider");
  }
  return context;
}