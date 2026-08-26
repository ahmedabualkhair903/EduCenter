export type AttendanceStatus =
  | "present"
  | "absent"
  | "late"
  | "excused"
  | "unrecorded";

export type AttendanceLocationStatus =
  | "allowed"
  | "outside"
  | "unknown";

export type AttendanceSessionStatus =
  | "closed"
  | "open"
  | "loading"
  | "error";

export type SuspiciousStatus =
  | "pending"
  | "approved"
  | "rejected";

export type AttendanceRecord = {
  id: string;
  studentId: string;
  groupId: string;
  lessonId: string;

  student?: string;
  phone?: string;

  status: AttendanceStatus;

  checkedInAt?: string;
  checkedOutAt?: string;

  locationStatus?: AttendanceLocationStatus;
  deviceId?: string;
};

export type AttendanceSession = {
  id: string;
  groupId: string;
  lessonId: string;
  date: string;

  status: "open" | "closed";

  passwordEnabled: boolean;
  password?: string;

  qrCode?: string;

  openedAt?: string;
  closedAt?: string;
};

export type SuspiciousAttendanceCase = {
  id: string;
  attendanceIds: string[];
  studentIds: string[];

  studentNames?: string[];

  reason: string;
  deviceId?: string;
  detectedAt: string;

  status: SuspiciousStatus;

  note?: string;
};