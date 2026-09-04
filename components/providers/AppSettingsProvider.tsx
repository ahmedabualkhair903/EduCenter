
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

const STORAGE_KEY =
  "educenter.settings.v1";

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

/* -------------------------------------------------------------------------- */
/* Helpers                                                                    */
/* -------------------------------------------------------------------------- */

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

    parentPortal: {
      ...base.parentPortal,
      ...(patch.parentPortal ?? {}),
    },
  };
}

function saveSettings(
  settings: AppSettings,
) {
  try {
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(settings),
    );
  } catch {
    // localStorage may be unavailable.
  }
}

/* -------------------------------------------------------------------------- */
/* Provider                                                                   */
/* -------------------------------------------------------------------------- */

export function AppSettingsProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [settings, setSettings] =
    useState<AppSettings>(mockSettings);

  const [hydrated, setHydrated] =
    useState(false);

  /* ------------------------------------------------------------------------ */
  /* Load persisted settings                                                  */
  /* ------------------------------------------------------------------------ */

  useEffect(() => {
    const loadSettings = () => {
      try {
        const stored =
          window.localStorage.getItem(
            STORAGE_KEY,
          );

        if (!stored) {
          setSettings(mockSettings);
          setHydrated(true);
          return;
        }

        const parsed: unknown =
          JSON.parse(stored);

        if (
          parsed &&
          typeof parsed === "object" &&
          !Array.isArray(parsed)
        ) {
          setSettings(
            mergeSettings(
              mockSettings,
              parsed as Partial<AppSettings>,
            ),
          );
        } else {
          setSettings(mockSettings);
        }
      } catch {
        setSettings(mockSettings);
      } finally {
        setHydrated(true);
      }
    };

    const timer = window.setTimeout(
      loadSettings,
      0,
    );

    return () => {
      window.clearTimeout(timer);
    };
  }, []);

  /* ------------------------------------------------------------------------ */
  /* Update settings                                                          */
  /* ------------------------------------------------------------------------ */

  const updateSettings = useCallback(
    (patch: Partial<AppSettings>) => {
      setSettings((current) => {
        const next = mergeSettings(
          current,
          patch,
        );

        if (hydrated) {
          saveSettings(next);
        }

        return next;
      });
    },
    [hydrated],
  );

  /* ------------------------------------------------------------------------ */
  /* Toggle module                                                            */
  /* ------------------------------------------------------------------------ */

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

        if (hydrated) {
          saveSettings(next);
        }

        return next;
      });
    },
    [hydrated],
  );

  /* ------------------------------------------------------------------------ */
  /* Module helper                                                             */
  /* ------------------------------------------------------------------------ */

  const isModuleEnabled = useCallback(
    (module: ModuleKey) =>
      Boolean(settings.modules[module]),
    [settings.modules],
  );

  /* ------------------------------------------------------------------------ */
  /* Context value                                                             */
  /* ------------------------------------------------------------------------ */

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

  /* ------------------------------------------------------------------------ */
  /* Render                                                                    */
  /* ------------------------------------------------------------------------ */

  return (
    <AppSettingsContext.Provider
      value={value}
    >
      {children}
    </AppSettingsContext.Provider>
  );
}

/* -------------------------------------------------------------------------- */
/* Hook                                                                       */
/* -------------------------------------------------------------------------- */

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
