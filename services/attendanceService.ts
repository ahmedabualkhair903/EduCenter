import { mockAttendance } from "@/data";
import type { AttendanceRecord } from "@/types";
import { mockRequest } from "./mockService";

export const attendanceService = {
  list: async (): Promise<AttendanceRecord[]> =>
    mockRequest(mockAttendance),

  listByStudent: async (
    studentId: string,
  ): Promise<AttendanceRecord[]> =>
    mockRequest(
      mockAttendance.filter(
        (item) => item.studentId === studentId,
      ),
    ),

  getById: async (
    id: string,
  ): Promise<AttendanceRecord | null> => {
    const record =
      mockAttendance.find(
        (item) => item.id === id,
      ) ?? null;

    return mockRequest(record);
  },
};