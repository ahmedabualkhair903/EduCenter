import type { SuspiciousAttendanceCase } from "@/types";

export const mockSuspicious: SuspiciousAttendanceCase[] = [
  {
    id: "suspicious-1",
    attendanceIds: [
      "attendance-1",
      "attendance-2",
    ],
    studentIds: [
      "student-1",
      "student-2",
    ],
    studentNames: [
      "محمد أحمد علي",
      "أحمد محمد حسن",
    ],
    deviceId: "DEVICE-204",
    reason:
      "تم تسجيل أكثر من طالب من نفس الجهاز خلال فترة قصيرة.",
    detectedAt:
      "2026-08-26T16:03:00",
    status: "pending",
  },
];