import { mockAttendance } from "@/data";
import type {
  AttendanceRecord,
  AttendanceStatus,
  SuspiciousAttendanceCase,
} from "@/types";
import { mockRequest } from "./mockService";

export const attendanceService = {
  /**
   * Get all attendance records.
   * Ready to be replaced with GET /attendance later.
   */
  list: async (): Promise<AttendanceRecord[]> =>
    mockRequest(mockAttendance),

  /**
   * Get attendance records for one student.
   */
  listByStudent: async (
    studentId: string,
  ): Promise<AttendanceRecord[]> =>
    mockRequest(
      mockAttendance.filter(
        (item) => item.studentId === studentId,
      ),
    ),

  /**
   * Get attendance records for one group.
   */
  listByGroup: async (
    groupId: string,
  ): Promise<AttendanceRecord[]> =>
    mockRequest(
      mockAttendance.filter(
        (item) => item.groupId === groupId,
      ),
    ),

  /**
   * Get attendance records for one lesson.
   */
  listByLesson: async (
    lessonId: string,
  ): Promise<AttendanceRecord[]> =>
    mockRequest(
      mockAttendance.filter(
        (item) => item.lessonId === lessonId,
      ),
    ),

  /**
   * Get attendance records for one group + lesson.
   */
  listBySession: async (
    groupId: string,
    lessonId: string,
  ): Promise<AttendanceRecord[]> =>
    mockRequest(
      mockAttendance.filter(
        (item) =>
          item.groupId === groupId &&
          item.lessonId === lessonId,
      ),
    ),

  /**
   * Get one attendance record.
   */
  getById: async (
    id: string,
  ): Promise<AttendanceRecord | null> => {
    const record =
      mockAttendance.find(
        (item) => item.id === id,
      ) ?? null;

    return mockRequest(record);
  },

  /**
   * Update attendance status.
   * Backend replacement:
   * PATCH /attendance/:id
   */
  updateStatus: async (
    id: string,
    status: AttendanceStatus,
  ): Promise<AttendanceRecord | null> => {
    const record =
      mockAttendance.find(
        (item) => item.id === id,
      ) ?? null;

    if (!record) {
      return mockRequest(null);
    }

    const updated: AttendanceRecord = {
      ...record,
      status,
      checkedInAt:
        status === "present" ||
        status === "late"
          ? record.checkedInAt ??
            new Date().toISOString()
          : record.checkedInAt,
    };

    return mockRequest(updated);
  },

  /**
   * Check a student out.
   * Backend replacement:
   * POST /attendance/:id/check-out
   */
  checkOut: async (
    id: string,
  ): Promise<AttendanceRecord | null> => {
    const record =
      mockAttendance.find(
        (item) => item.id === id,
      ) ?? null;

    if (!record) {
      return mockRequest(null);
    }

    const updated: AttendanceRecord = {
      ...record,
      checkedOutAt:
        record.checkedOutAt ??
        new Date().toISOString(),
    };

    return mockRequest(updated);
  },

  /**
   * Suspicious attendance cases.
   *
   * Kept as a service method so the page does not
   * depend directly on the future backend structure.
   *
   * This is intentionally empty for now because
   * suspicious cases are detected by the backend later.
   */
  listSuspicious: async (): Promise<
    SuspiciousAttendanceCase[]
  > => mockRequest([]),
};