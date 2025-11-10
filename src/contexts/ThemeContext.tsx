



import { createContext, useContext, useEffect, useMemo, useState, ReactNode } from "react";
import { Capacitor } from "@capacitor/core";
import { Preferences } from "@capacitor/preferences";

type ThemeMode = "light" | "dark";

interface ThemeContextValue {
  mode: ThemeMode;
  setTheme: (mode: ThemeMode) => Promise<void>;
  toggleTheme: () => Promise<void>;
  isLoaded: boolean;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

const STORAGE_KEY = "theme_mode";

const applyThemeClass = (mode: ThemeMode) => {
  const root = document.documentElement;
  if (mode === "dark") {
    root.classList.add("dark");
  } else {
    root.classList.remove("dark");
  }
};

const readStoredTheme = async (): Promise<ThemeMode> => {
  let stored: string | null = null;
  try {
    stored = localStorage.getItem(STORAGE_KEY);
  } catch {
    // ignore
  }

  if (!stored && Capacitor.isNativePlatform()) {
    try {
      const { value } = await Preferences.get({ key: STORAGE_KEY });
      stored = value;
    } catch {
      stored = null;
    }
  }

  return stored === "dark" ? "dark" : "light";
};

const persistTheme = async (mode: ThemeMode) => {
  try {
    localStorage.setItem(STORAGE_KEY, mode);
  } catch {
    // ignore
  }

  if (Capacitor.isNativePlatform()) {
    try {
      await Preferences.set({ key: STORAGE_KEY, value: mode });
    } catch {
      // ignore preference write failures
    }
  }
};

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const [mode, setMode] = useState<ThemeMode>("light");
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const init = async () => {
      const stored = await readStoredTheme();
      setMode(stored);
      applyThemeClass(stored);
      setLoaded(true);
    };
    init();
  }, []);

  const setTheme = async (next: ThemeMode) => {
    setMode(next);
    applyThemeClass(next);
    await persistTheme(next);
  };

  const toggleTheme = async () => {
    await setTheme(mode === "dark" ? "light" : "dark");
  };

  const value = useMemo(
    () => ({
      mode,
      setTheme,
      toggleTheme,
      isLoaded: loaded,
    }),
    [mode, loaded]
  );

  return <ThemeContext.Provider value={value}>{loaded ? children : null}</ThemeContext.Provider>;
};

export const useThemeMode = () => {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error("useThemeMode must be used within ThemeProvider");
  }
  return ctx;
};

export type { ThemeMode };


