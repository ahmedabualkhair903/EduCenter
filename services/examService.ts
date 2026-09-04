
import { mockExams, mockGrades } from "@/data";
import type { Exam, Grade } from "@/types";
import { mockRequest, saveToStorage, loadFromStorage } from "./mockService";

const STORAGE_KEY_EXAMS = "exams";
const STORAGE_KEY_GRADES = "grades";

const examsData = loadFromStorage<Exam[]>(STORAGE_KEY_EXAMS, mockExams);
const gradesData = loadFromStorage<Grade[]>(STORAGE_KEY_GRADES, mockGrades);

export const examService = {
  list: async (): Promise<Exam[]> =>
    mockRequest(examsData),

  getById: async (
    id: string,
  ): Promise<Exam | null> => {
    const exam =
      examsData.find(
        (item) => item.id === id,
      ) ?? null;

    return mockRequest(exam);
  },

  create: async (exam: Omit<Exam, "id" | "createdAt">): Promise<Exam> => {
    const now = new Date().toISOString();
    const newExam: Exam = {
      ...exam,
      id: `exam-${Date.now()}`,
      createdAt: now,
    };
    examsData.unshift(newExam);
    saveToStorage(STORAGE_KEY_EXAMS, examsData);
    return mockRequest(newExam);
  },

  update: async (id: string, updates: Partial<Exam>): Promise<Exam | null> => {
    const index = examsData.findIndex((item) => item.id === id);
    if (index === -1) return mockRequest(null);
    
    const updatedExam: Exam = {
      ...examsData[index],
      ...updates,
    };
    examsData[index] = updatedExam;
    saveToStorage(STORAGE_KEY_EXAMS, examsData);
    return mockRequest(updatedExam);
  },

  delete: async (id: string): Promise<boolean> => {
    const index = examsData.findIndex((item) => item.id === id);
    if (index === -1) return mockRequest(false);
    
    examsData.splice(index, 1);
    saveToStorage(STORAGE_KEY_EXAMS, examsData);
    return mockRequest(true);
  },

  grades: async (): Promise<Grade[]> =>
    mockRequest(gradesData),

  gradesByStudent: async (
    studentId: string,
  ): Promise<Grade[]> =>
    mockRequest(
      gradesData.filter(
        (item) => item.studentId === studentId,
      ),
    ),

  gradeByExamAndStudent: async (
    examId: string,
    studentId: string,
  ): Promise<Grade | null> => {
    const grade =
      gradesData.find(
        (item) =>
          item.examId === examId &&
          item.studentId === studentId,
      ) ?? null;

    return mockRequest(grade);
  },

  createGrade: async (grade: Omit<Grade, "id">): Promise<Grade> => {
    const newGrade: Grade = {
      ...grade,
      id: `grade-${Date.now()}`,
    };
    gradesData.push(newGrade);
    saveToStorage(STORAGE_KEY_GRADES, gradesData);
    return mockRequest(newGrade);
  },

  updateGrade: async (id: string, updates: Partial<Grade>): Promise<Grade | null> => {
    const index = gradesData.findIndex((item) => item.id === id);
    if (index === -1) return mockRequest(null);
    
    const updatedGrade: Grade = {
      ...gradesData[index],
      ...updates,
    };
    gradesData[index] = updatedGrade;
    saveToStorage(STORAGE_KEY_GRADES, gradesData);
    return mockRequest(updatedGrade);
  },

  deleteGrade: async (id: string): Promise<boolean> => {
    const index = gradesData.findIndex((item) => item.id === id);
    if (index === -1) return mockRequest(false);
    
    gradesData.splice(index, 1);
    saveToStorage(STORAGE_KEY_GRADES, gradesData);
    return mockRequest(true);
  },
};
