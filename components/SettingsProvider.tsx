"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import {
  DEFAULT_SETTINGS,
  SETTINGS_KEY,
  applySettings,
  readSettings,
  writeSettings,
  type Settings,
} from "@/lib/settings";

type SettingsContextValue = {
  settings: Settings;
  update: (change: Partial<Settings>) => void;
};

const SettingsContext = createContext<SettingsContextValue>({
  settings: DEFAULT_SETTINGS,
  update: () => {},
});

/**
 * Holds the global settings. The text size and contrast are already applied
 * before the first paint (see EARLY_SETTINGS_SCRIPT), so this only has to keep
 * the buttons in the settings window in sync and save changes.
 */
export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  // Always the latest settings, so two quick changes never overwrite each other.
  const latest = useRef<Settings>(DEFAULT_SETTINGS);

  useEffect(() => {
    const saved = readSettings();
    latest.current = saved;
    setSettings(saved);
    applySettings(saved);

    // Another open tab changed the settings: follow it.
    const onStorage = (event: StorageEvent) => {
      if (event.key !== SETTINGS_KEY) return;
      const next = readSettings();
      latest.current = next;
      setSettings(next);
      applySettings(next);
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const update = useCallback((change: Partial<Settings>) => {
    const next = { ...latest.current, ...change };
    latest.current = next;
    writeSettings(next);
    applySettings(next);
    setSettings(next);
  }, []);

  const value = useMemo(() => ({ settings, update }), [settings, update]);

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}

export function useSettings(): SettingsContextValue {
  return useContext(SettingsContext);
}
