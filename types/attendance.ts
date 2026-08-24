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

export type AttendanceRecord = {
  id: string;

  studentId: string;
  groupId: string;
  lessonId: string;

  status: AttendanceStatus;

  checkedInAt?: string;
  checkedOutAt?: string;

  locationStatus?: AttendanceLocationStatus;

  deviceId?: string;
};

export type SuspiciousAttendanceCase = {
  id: string;

  attendanceIds: string[];
  studentIds: string[];

  reason: string;

  deviceId?: string;

  detectedAt: string;

  status:
    | "pending"
    | "approved"
    | "rejected";

  note?: string;
};