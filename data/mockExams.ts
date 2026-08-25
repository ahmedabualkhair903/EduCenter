import type { Exam, Grade } from "@/types";

export const mockExams: Exam[] = [
  {
    id: "exam-001",
    name: "اختبار الشهر الأول",
    subject: "الرياضيات",
    groupId: "group-001",
    maxScore: 100,
    date: "2026-08-05T10:00:00.000Z",
    createdAt: "2026-07-28T09:00:00.000Z",
  },
  {
    id: "exam-002",
    name: "اختبار الشهر الأول",
    subject: "اللغة الإنجليزية",
    groupId: "group-001",
    maxScore: 100,
    date: "2026-08-08T10:00:00.000Z",
    createdAt: "2026-08-01T09:00:00.000Z",
  },
  {
    id: "exam-003",
    name: "اختبار الوحدة الثانية",
    subject: "العلوم",
    groupId: "group-002",
    maxScore: 50,
    date: "2026-08-10T11:00:00.000Z",
    createdAt: "2026-08-03T09:00:00.000Z",
  },
  {
    id: "exam-004",
    name: "اختبار منتصف الشهر",
    subject: "اللغة العربية",
    groupId: "group-003",
    maxScore: 100,
    date: "2026-08-15T10:00:00.000Z",
    createdAt: "2026-08-07T09:00:00.000Z",
  },
];

export const mockGrades: Grade[] = [
  {
    id: "grade-001",
    examId: "exam-001",
    studentId: "student-001",
    score: 92,
    status: "approved",
  },
  {
    id: "grade-002",
    examId: "exam-002",
    studentId: "student-001",
    score: 88,
    status: "approved",
  },
  {
    id: "grade-003",
    examId: "exam-003",
    studentId: "student-002",
    score: 43,
    status: "approved",
  },
  {
    id: "grade-004",
    examId: "exam-004",
    studentId: "student-003",
    score: 76,
    status: "pending",
  },
];