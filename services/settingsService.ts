import { mockSettings } from "@/data";
import type { AppSettings } from "@/types";
import { mockRequest } from "./mockService";

let settingsStore: AppSettings = structuredClone(mockSettings);

export const settingsService = {
  get: async (): Promise<AppSettings> => mockRequest(settingsStore),
  update: async (nextSettings: AppSettings): Promise<AppSettings> => {
    settingsStore = structuredClone(nextSettings);
    return mockRequest(settingsStore);
  },
};
