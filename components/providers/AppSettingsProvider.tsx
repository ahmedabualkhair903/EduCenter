"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import { mockSettings } from "@/data";
import type {
  AppSettings,
  ModuleKey,
} from "@/types";

const STORAGE_KEY = "educenter.settings.v1";

type AppSettingsContextValue = {
  settings: AppSettings;

  isModuleEnabled: (
    module: ModuleKey,
  ) => boolean;

  updateSettings: (
    patch: Partial<AppSettings>,
  ) => void;

  setModuleEnabled: (
    module: ModuleKey,
    enabled: boolean,
  ) => void;
};

const AppSettingsContext =
  createContext<AppSettingsContextValue | null>(
    null,
  );

function mergeSettings(
  base: AppSettings,
  patch: Partial<AppSettings>,
): AppSettings {
  return {
    ...base,
    ...patch,

    modules: {
      ...base.modules,
      ...(patch.modules ?? {}),
    },

    center: {
      ...base.center,
      ...(patch.center ?? {}),
    },

    attendance: {
      ...base.attendance,
      ...(patch.attendance ?? {}),
    },

    notifications: {
      ...base.notifications,
      ...(patch.notifications ?? {}),
    },
  };
}

export function AppSettingsProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [settings, setSettings] =
    useState<AppSettings>(mockSettings);

  const [hydrated, setHydrated] =
    useState(false);

  useEffect(() => {
    try {
      const stored =
        window.localStorage.getItem(
          STORAGE_KEY,
        );

      if (stored) {
        const parsed =
          JSON.parse(stored) as Partial<AppSettings>;

        setSettings(
          mergeSettings(
            mockSettings,
            parsed,
          ),
        );
      }
    } catch {
      setSettings(mockSettings);
    } finally {
      setHydrated(true);
    }
  }, []);

  const persist = useCallback(
    (next: AppSettings) => {
      setSettings(next);

      if (!hydrated) {
        return;
      }

      try {
        window.localStorage.setItem(
          STORAGE_KEY,
          JSON.stringify(next),
        );
      } catch {
        // Keep the UI usable if localStorage is unavailable.
      }
    },
    [hydrated],
  );

  const updateSettings = useCallback(
    (patch: Partial<AppSettings>) => {
      setSettings((current) => {
        const next = mergeSettings(
          current,
          patch,
        );

        try {
          window.localStorage.setItem(
            STORAGE_KEY,
            JSON.stringify(next),
          );
        } catch {
          // Keep the UI usable if localStorage is unavailable.
        }

        return next;
      });
    },
    [],
  );

  const setModuleEnabled = useCallback(
    (
      module: ModuleKey,
      enabled: boolean,
    ) => {
      setSettings((current) => {
        const next: AppSettings = {
          ...current,

          modules: {
            ...current.modules,
            [module]: enabled,
          },
        };

        try {
          window.localStorage.setItem(
            STORAGE_KEY,
            JSON.stringify(next),
          );
        } catch {
          // Keep the UI usable if localStorage is unavailable.
        }

        return next;
      });
    },
    [],
  );

  const isModuleEnabled = useCallback(
    (module: ModuleKey) =>
      Boolean(settings.modules[module]),
    [settings.modules],
  );

  const value =
    useMemo<AppSettingsContextValue>(
      () => ({
        settings,
        isModuleEnabled,
        updateSettings,
        setModuleEnabled,
      }),
      [
        settings,
        isModuleEnabled,
        updateSettings,
        setModuleEnabled,
      ],
    );

  return (
    <AppSettingsContext.Provider
      value={value}
    >
      {children}
    </AppSettingsContext.Provider>
  );
}

export function useAppSettings() {
  const context =
    useContext(AppSettingsContext);

  if (!context) {
    throw new Error(
      "useAppSettings must be used inside AppSettingsProvider",
    );
  }

  return context;
}