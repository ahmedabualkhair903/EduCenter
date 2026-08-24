"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import { mockSettings } from "@/data";
import type { AppSettings, ModuleKey } from "@/types";

const STORAGE_KEY = "educenter.settings.v1";

type AppSettingsContextValue = {
  settings: AppSettings;
  isModuleEnabled: (module: ModuleKey) => boolean;
  updateSettings: (patch: Partial<AppSettings>) => void;
  setModuleEnabled: (
    module: ModuleKey,
    enabled: boolean,
  ) => void;
};

const AppSettingsContext =
  createContext<AppSettingsContextValue>({
    settings: mockSettings,

    isModuleEnabled: () => true,

    updateSettings: () => undefined,

    setModuleEnabled: () => undefined,
  });

export function AppSettingsProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [settings, setSettings] =
    useState<AppSettings>(mockSettings);

  useEffect(() => {
    try {
      const stored =
        window.localStorage.getItem(STORAGE_KEY);

      if (!stored) {
        return;
      }

      const parsed = JSON.parse(stored) as AppSettings;

      setSettings({
        ...mockSettings,
        ...parsed,

        modules: {
          ...mockSettings.modules,
          ...(parsed.modules ?? {}),
        },

        center: {
          ...mockSettings.center,
          ...(parsed.center ?? {}),
        },

        attendance: {
          ...mockSettings.attendance,
          ...(parsed.attendance ?? {}),
        },

        notifications: {
          ...mockSettings.notifications,
          ...(parsed.notifications ?? {}),
        },
      });
    } catch {
      setSettings(mockSettings);
    }
  }, []);

  const persist = (next: AppSettings) => {
    setSettings(next);

    try {
      window.localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(next),
      );
    } catch {
      // Keep the UI usable if localStorage is unavailable.
    }
  };

  const value = useMemo<AppSettingsContextValue>(
    () => ({
      settings,

      isModuleEnabled: (module: ModuleKey) =>
        Boolean(settings.modules[module]),

      updateSettings: (
        patch: Partial<AppSettings>,
      ) => {
        persist({
          ...settings,
          ...patch,
        });
      },

      setModuleEnabled: (
        module: ModuleKey,
        enabled: boolean,
      ) => {
        persist({
          ...settings,

          modules: {
            ...settings.modules,
            [module]: enabled,
          },
        });
      },
    }),
    [settings],
  );

  return (
    <AppSettingsContext.Provider value={value}>
      {children}
    </AppSettingsContext.Provider>
  );
}

export function useAppSettings() {
  return useContext(AppSettingsContext);
}