
import { mockAttendance, mockSuspicious } from "@/data";

import type {
  AttendanceRecord,
  AttendanceStatus,
  SuspiciousAttendanceCase,
} from "@/types";

import { studentService } from "./studentService";

import {
  loadFromStorage,
  mockRequest,
  saveToStorage,
} from "./mockService";

const STORAGE_KEY_ATTENDANCE =
  "attendance";

const STORAGE_KEY_SUSPICIOUS =
  "suspicious_attendance";

const attendanceData =
  loadFromStorage<AttendanceRecord[]>(
    STORAGE_KEY_ATTENDANCE,
    mockAttendance,
  );

const suspiciousData =
  loadFromStorage<SuspiciousAttendanceCase[]>(
    STORAGE_KEY_SUSPICIOUS,
    mockSuspicious,
  );

export type AttendanceScannerStatus =
  | "success"
  | "already_registered"
  | "invalid"
  | "disabled"
  | "error";

export type AttendanceScannerResult = {
  status: AttendanceScannerStatus;
  record: AttendanceRecord | null;
  studentId: string | null;
  studentName: string | null;
  checkedInAt: string | null;
  message: string;
};

const createScannerResult = (
  status: AttendanceScannerStatus,
  options?: {
    record?: AttendanceRecord | null;
    studentId?: string | null;
    studentName?: string | null;
    checkedInAt?: string | null;
    message?: string;
  },
): AttendanceScannerResult => ({
  status,
  record: options?.record ?? null,
  studentId:
    options?.studentId ?? null,
  studentName:
    options?.studentName ?? null,
  checkedInAt:
    options?.checkedInAt ?? null,
  message:
    options?.message ??
    "حدث خطأ أثناء التسجيل.",
});

const normalizeScannerCode = (
  value: string,
): string => {
  return value
    .replace(/[\r\n\t]/g, "")
    .trim();
};

const isSameDay = (
  firstDate: string,
  secondDate: Date,
): boolean => {
  const first = new Date(firstDate);

  if (Number.isNaN(first.getTime())) {
    return false;
  }

  return (
    first.getFullYear() ===
      secondDate.getFullYear() &&
    first.getMonth() ===
      secondDate.getMonth() &&
    first.getDate() ===
      secondDate.getDate()
  );
};

const findStudentByScannerCode =
  async (code: string) => {
    const students =
      await studentService.list();

    const normalizedCode =
      normalizeScannerCode(code);

    if (!normalizedCode) {
      return null;
    }

    return (
      students.find(
        (student) =>
          student.studentId ===
            normalizedCode ||
          student.id === normalizedCode,
      ) ?? null
    );
  };

const registerStudentAttendance =
  async (
    studentId: string,
  ): Promise<AttendanceScannerResult> => {
    try {
      const students =
        await studentService.list();

      const student =
        students.find(
          (item) =>
            item.id === studentId,
        ) ?? null;

      if (!student) {
        return createScannerResult(
          "invalid",
          {
            studentId,
            message:
              "الكارت غير معروف.",
          },
        );
      }

      if (student.status !== "active") {
        return createScannerResult(
          "disabled",
          {
            studentId:
              student.id,
            studentName:
              student.name,
            message:
              "الطالب غير نشط.",
          },
        );
      }

      const now = new Date();

      const alreadyRegistered =
        attendanceData.find(
          (record) =>
            record.studentId ===
              student.id &&
            (record.status ===
              "present" ||
              record.status === "late") &&
            record.checkedInAt &&
            isSameDay(
              record.checkedInAt,
              now,
            ),
        ) ?? null;

      if (alreadyRegistered) {
        return createScannerResult(
          "already_registered",
          {
            record:
              alreadyRegistered,
            studentId:
              student.id,
            studentName:
              student.name,
            checkedInAt:
              alreadyRegistered.checkedInAt ??
              null,
            message:
              "تم تسجيل حضور الطالب مسبقًا.",
          },
        );
      }

      const record =
        await attendanceService.create({
          studentId: student.id,
          groupId:
            student.groupId ?? "",
          lessonId:
            "scanner",
          student:
            student.name,
          phone:
            student.phone,
          status: "present",
          checkedInAt:
            now.toISOString(),
          deviceId:
            "USB-BARCODE-SCANNER",
          locationStatus:
            "unknown",
        });

      return createScannerResult(
        "success",
        {
          record,
          studentId:
            student.id,
          studentName:
            student.name,
          checkedInAt:
            record.checkedInAt ??
            now.toISOString(),
          message:
            `تم تسجيل حضور ${student.name}.`,
        },
      );
    } catch {
      return createScannerResult(
        "error",
        {
          studentId,
          message:
            "حدث خطأ أثناء التسجيل.",
        },
      );
    }
  };

export const attendanceService = {
  /**
   * Get all attendance records.
   * Ready to be replaced with GET /attendance later.
   */
  list: async (): Promise<
    AttendanceRecord[]
  > =>
    mockRequest(attendanceData),

  /**
   * Get attendance records for one student.
   */
  listByStudent: async (
    studentId: string,
  ): Promise<AttendanceRecord[]> =>
    mockRequest(
      attendanceData.filter(
        (item) =>
          item.studentId === studentId,
      ),
    ),

  /**
   * Get attendance records for one group.
   */
  listByGroup: async (
    groupId: string,
  ): Promise<AttendanceRecord[]> =>
    mockRequest(
      attendanceData.filter(
        (item) =>
          item.groupId === groupId,
      ),
    ),

  /**
   * Get attendance records for one lesson.
   */
  listByLesson: async (
    lessonId: string,
  ): Promise<AttendanceRecord[]> =>
    mockRequest(
      attendanceData.filter(
        (item) =>
          item.lessonId === lessonId,
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
      attendanceData.filter(
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
      attendanceData.find(
        (item) => item.id === id,
      ) ?? null;

    return mockRequest(record);
  },

  /**
   * Create attendance record.
   */
  create: async (
    record: Omit<
      AttendanceRecord,
      "id"
    >,
  ): Promise<AttendanceRecord> => {
    const newRecord: AttendanceRecord = {
      ...record,
      id: `attendance-${Date.now()}`,
    };

    attendanceData.push(newRecord);

    saveToStorage(
      STORAGE_KEY_ATTENDANCE,
      attendanceData,
    );

    return mockRequest(newRecord);
  },

  /**
   * Scan a student card/barcode and register
   * attendance.
   *
   * This method owns the scanner business rules:
   * - invalid code
   * - disabled student
   * - already registered today
   * - successful registration
   * - unexpected error
   *
   * Backend replacement:
   * POST /attendance/scanner/check-in
   */
  scanCheckIn: async (
    code: string,
  ): Promise<AttendanceScannerResult> => {
    try {
      const normalizedCode =
        normalizeScannerCode(code);

      if (!normalizedCode) {
        return createScannerResult(
          "invalid",
          {
            message:
              "الكارت غير معروف.",
          },
        );
      }

      const student =
        await findStudentByScannerCode(
          normalizedCode,
        );

      if (!student) {
        return createScannerResult(
          "invalid",
          {
            message:
              "الكارت غير معروف.",
          },
        );
      }

      return registerStudentAttendance(
        student.id,
      );
    } catch {
      return createScannerResult(
        "error",
        {
          message:
            "حدث خطأ أثناء التسجيل.",
        },
      );
    }
  },

  /**
   * Manual attendance fallback.
   *
   * Uses the same business rules as scanner
   * attendance without duplicating them.
   *
   * Backend replacement:
   * POST /attendance/manual/check-in
   */
  manualCheckIn: async (
    studentId: string,
  ): Promise<AttendanceScannerResult> => {
    const normalizedStudentId =
      studentId.trim();

    try {
      if (!normalizedStudentId) {
        return createScannerResult(
          "invalid",
          {
            message:
              "يرجى اختيار طالب.",
          },
        );
      }

      return registerStudentAttendance(
        normalizedStudentId,
      );
    } catch {
      return createScannerResult(
        "error",
        {
          studentId:
            normalizedStudentId,
          message:
            "حدث خطأ أثناء التسجيل.",
        },
      );
    }
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
    const index =
      attendanceData.findIndex(
        (item) => item.id === id,
      );

    if (index === -1) {
      return mockRequest(null);
    }

    const record =
      attendanceData[index];

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

    attendanceData[index] =
      updated;

    saveToStorage(
      STORAGE_KEY_ATTENDANCE,
      attendanceData,
    );

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
    const index =
      attendanceData.findIndex(
        (item) => item.id === id,
      );

    if (index === -1) {
      return mockRequest(null);
    }

    const record =
      attendanceData[index];

    const updated: AttendanceRecord = {
      ...record,
      checkedOutAt:
        record.checkedOutAt ??
        new Date().toISOString(),
    };

    attendanceData[index] =
      updated;

    saveToStorage(
      STORAGE_KEY_ATTENDANCE,
      attendanceData,
    );

    return mockRequest(updated);
  },

  /**
   * Delete attendance record.
   */
  delete: async (
    id: string,
  ): Promise<boolean> => {
    const index =
      attendanceData.findIndex(
        (item) => item.id === id,
      );

    if (index === -1) {
      return mockRequest(false);
    }

    attendanceData.splice(
      index,
      1,
    );

    saveToStorage(
      STORAGE_KEY_ATTENDANCE,
      attendanceData,
    );

    return mockRequest(true);
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
  > =>
    mockRequest(
      suspiciousData,
    ),

  /**
   * Create suspicious case.
   */
  createSuspicious: async (
    caseData: Omit<
      SuspiciousAttendanceCase,
      "id"
    >,
  ): Promise<SuspiciousAttendanceCase> => {
    const newCase: SuspiciousAttendanceCase =
      {
        ...caseData,
        id: `suspicious-${Date.now()}`,
      };

    suspiciousData.push(newCase);

    saveToStorage(
      STORAGE_KEY_SUSPICIOUS,
      suspiciousData,
    );

    return mockRequest(newCase);
  },

  /**
   * Update suspicious case status.
   */
  updateSuspiciousStatus: async (
    id: string,
    status: SuspiciousAttendanceCase["status"],
  ): Promise<
    SuspiciousAttendanceCase | null
  > => {
    const index =
      suspiciousData.findIndex(
        (item) => item.id === id,
      );

    if (index === -1) {
      return mockRequest(null);
    }

    const updatedCase: SuspiciousAttendanceCase =
      {
        ...suspiciousData[index],
        status,
      };

    suspiciousData[index] =
      updatedCase;

    saveToStorage(
      STORAGE_KEY_SUSPICIOUS,
      suspiciousData,
    );

    return mockRequest(
      updatedCase,
    );
  },

  /**
   * Update the note of a suspicious attendance case.
   * Backend replacement:
   * PATCH /attendance-suspicious/:id
   */
  updateSuspiciousNote: async (
    id: string,
    note: string,
  ): Promise<
    SuspiciousAttendanceCase | null
  > => {
    const index =
      suspiciousData.findIndex(
        (item) => item.id === id,
      );

    if (index === -1) {
      return mockRequest(null);
    }

    const updatedCase: SuspiciousAttendanceCase =
      {
        ...suspiciousData[index],
        note,
      };

    suspiciousData[index] =
      updatedCase;

    saveToStorage(
      STORAGE_KEY_SUSPICIOUS,
      suspiciousData,
    );

    return mockRequest(
      updatedCase,
    );
  },
};
