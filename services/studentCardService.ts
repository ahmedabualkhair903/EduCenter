
import type { StudentCard } from "@/types/studentCard";

import { mockRequest } from "./mockService";

const unavailableCard: StudentCard = {
  studentId: "",
  status: "not_issued",
  attendanceCode: null,
  parentQrValue: null,
  issuedAt: null,
  updatedAt: null,
};

/**
 * Student Card Service
 *
 * This service intentionally does not generate attendance/security
 * tokens on the frontend.
 *
 * The current implementation provides the backend-ready contract
 * while the application is still operating in Offline/Mock mode.
 *
 * When the backend is connected, these methods can be replaced by
 * API calls without changing the Student Profile UI.
 */
export const studentCardService = {
  getStudentCard: async (
    studentId: string,
  ): Promise<StudentCard> => {
    return mockRequest({
      ...unavailableCard,
      studentId,
    });
  },

  regenerateStudentCardCode: async (
    studentId: string,
  ): Promise<StudentCard> => {
    void studentId;

    throw new Error(
      "إعادة توليد كود الحضور تحتاج إلى خدمة Backend متصلة.",
    );
  },
};
