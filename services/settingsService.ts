
import { mockSettings } from "@/data";
import type {
  AppSettings,
  ParentPortalSettings,
} from "@/types";

import { mockRequest } from "./mockService";

let settingsStore: AppSettings =
  structuredClone(mockSettings);

export const settingsService = {
  get: async (): Promise<AppSettings> =>
    mockRequest(settingsStore),

  update: async (
    nextSettings: AppSettings,
  ): Promise<AppSettings> => {
    settingsStore =
      structuredClone(nextSettings);

    return mockRequest(settingsStore);
  },

  syncParentPortal: async (
    currentSettings: AppSettings,
  ): Promise<{
    settings: AppSettings;
    success: boolean;
    message: string;
  }> => {
    const currentParentPortal: ParentPortalSettings =
      currentSettings.parentPortal;

    if (!currentParentPortal.enabled) {
      return mockRequest({
        settings: currentSettings,
        success: false,
        message:
          "بوابة ولي الأمر غير مفعلة.",
      });
    }

    const syncingSettings: AppSettings = {
      ...currentSettings,

      parentPortal: {
        ...currentParentPortal,
        syncStatus: "syncing",
      },
    };

    settingsStore =
      structuredClone(syncingSettings);

    await new Promise<void>((resolve) => {
      setTimeout(resolve, 500);
    });

    const syncedSettings: AppSettings = {
      ...syncingSettings,

      parentPortal: {
        ...syncingSettings.parentPortal,
        syncStatus: "success",
        lastSync:
          new Date().toISOString(),
        pendingSync: 0,
      },
    };

    settingsStore =
      structuredClone(syncedSettings);

    return mockRequest({
      settings: syncedSettings,
      success: true,
      message:
        "تم تحديث بيانات أولياء الأمور بنجاح.",
    });
  },
};
