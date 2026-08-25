import { mockExams, mockGrades } from "@/data";
import type { Exam, Grade } from "@/types";
import { mockRequest } from "./mockService";

export const examService = {
  list: async (): Promise<Exam[]> =>
    mockRequest(mockExams),

  getById: async (
    id: string,
  ): Promise<Exam | null> => {
    const exam =
      mockExams.find(
        (item) => item.id === id,
      ) ?? null;

    return mockRequest(exam);
  },

  grades: async (): Promise<Grade[]> =>
    mockRequest(mockGrades),

  gradesByStudent: async (
    studentId: string,
  ): Promise<Grade[]> =>
    mockRequest(
      mockGrades.filter(
        (item) => item.studentId === studentId,
      ),
    ),

  gradeByExamAndStudent: async (
    examId: string,
    studentId: string,
  ): Promise<Grade | null> => {
    const grade =
      mockGrades.find(
        (item) =>
          item.examId === examId &&
          item.studentId === studentId,
      ) ?? null;

    return mockRequest(grade);
  },
};