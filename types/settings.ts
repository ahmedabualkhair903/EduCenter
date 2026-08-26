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

export type ModuleSettings = Record<ModuleKey, boolean>;

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
  modules: ModuleSettings;
  center: CenterSettings;
  attendance: AttendanceSettings;
  notifications: NotificationSettings;
  paymentsEnabled: boolean;
  reportsEnabled: boolean;
};