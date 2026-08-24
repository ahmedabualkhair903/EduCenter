import type { AppSettings } from "@/types/settings";

import { DEFAULT_MODULES } from "@/config/modules";

export const mockSettings: AppSettings = {
  modules: {
    ...DEFAULT_MODULES,
  },

  center: {
    centerName: "المركز التعليمي",
    phone: "01000000000",
    address: "طنطا، الغربية",
    academicYear: "2026 / 2027",
  },

  attendance: {
    enabled: true,
    checkOutEnabled: false,
    locationEnabled: false,
    passwordEnabled: false,
    allowedRadiusMeters: 100,
  },

  notifications: {
    whatsappEnabled: true,
    resultMessagesEnabled: true,
    attendanceMessagesEnabled: true,
    checkOutMessagesEnabled: false,
    absenceMessagesEnabled: true,
  },

  paymentsEnabled: true,
  reportsEnabled: false,
};