
export type ModuleKey =
  | "students"
  | "groups"
  | "lessons"
  | "payments"
  | "exams"
  | "excel"
  | "attendance"
  | "checkOut"
  | "location"
  | "attendancePassword"
  | "whatsapp"
  | "resultMessages"
  | "attendanceMessages"
  | "checkOutMessages"
  | "absenceMessages"
  | "reports";

export type ParentPortalSyncMode =
  | "manual"
  | "auto";

export type ParentPortalSyncStatus =
  | "idle"
  | "syncing"
  | "success"
  | "error";

export type ParentPortalSettings = {
  enabled: boolean;
  syncMode: ParentPortalSyncMode;
  lastSync: string | null;
  syncStatus: ParentPortalSyncStatus;
  pendingSync: number;
};

export type CenterSettings = {
  centerName: string;
  logoUrl?: string;
  phone?: string;
  secondaryPhone?: string;
  address?: string;
  academicYear?: string;
};

export type AttendanceSettings = {
  enabled: boolean;
  checkOutEnabled: boolean;
  locationEnabled: boolean;
  passwordEnabled: boolean;
  allowedRadiusMeters: number;
};

export type NotificationSettings = {
  whatsappEnabled: boolean;
  resultMessagesEnabled: boolean;
  attendanceMessagesEnabled: boolean;
  checkOutMessagesEnabled: boolean;
  absenceMessagesEnabled: boolean;
};

export type AppSettings = {
  modules: Record<ModuleKey, boolean>;
  center: CenterSettings;
  attendance: AttendanceSettings;
  notifications: NotificationSettings;
  paymentsEnabled: boolean;
  reportsEnabled: boolean;
  parentPortal: ParentPortalSettings;
};
