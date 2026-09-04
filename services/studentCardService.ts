import type { Student, StudentCard } from "@/types";

import { studentService } from "./studentService";

import {
  loadFromStorage,
  mockRequest,
  saveToStorage,
} from "./mockService";

const STORAGE_KEY_STUDENT_CARDS = "studentCards";

const CODE_ALPHABET =
  "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

const unavailableCard = (
  studentId: string,
): StudentCard => ({
  studentId,
  status: "not_issued",
  attendanceCode: null,
  parentQrValue: null,
  issuedAt: null,
  updatedAt: null,
});

const cardsData = loadFromStorage<StudentCard[]>(
  STORAGE_KEY_STUDENT_CARDS,
  [],
);

const nowIso = (): string =>
  new Date().toISOString();

/**
 * The first card of a student always keeps a stable
 * code derived from the student id so it works both
 * with the page attendance drop-downs and with the
 * barcode scanner without any backend call.
 */
const buildInitialCard = (
  student: Student,
): StudentCard => {
  const now = nowIso();

  return {
    studentId: student.id,
    status: "active",
    attendanceCode: `SN:${student.id}`,
    parentQrValue: `/parent-portal/${student.id}`,
    issuedAt: now,
    updatedAt: now,
  };
};

const generateNewCode = (): string => {
  let suffix = "";

  for (let index = 0; index < 8; index += 1) {
    suffix +=
      CODE_ALPHABET[
        Math.floor(
          Math.random() *
            CODE_ALPHABET.length,
        )
      ];
  }

  return `RC-${suffix}`;
};

const isCodeUsed = (
  code: string,
): boolean =>
  cardsData.some(
    (card) =>
      card.attendanceCode === code,
  );

const persistCards = (): void => {
  saveToStorage(
    STORAGE_KEY_STUDENT_CARDS,
    cardsData,
  );
};

/**
 * Student Card Service
 *
 * Cards are issued fully offline: every student gets a
 * stable attendance code, a parent-portal QR value and
 * an issue timestamp that are persisted in localStorage.
 *
 * This keeps the backend-ready contract: when the real
 * backend is connected, these methods can be replaced
 * by API calls without changing the Student Profile UI.
 */
export const studentCardService = {
  /**
   * Get all issued cards.
   */
  list: async (): Promise<StudentCard[]> =>
    mockRequest(cardsData),

  /**
   * Get (and auto-issue when missing) the card of a
   * student. Unknown students return an
   * unavailable (not_issued) card.
   *
   * Backend replacement:
   * GET /students/:id/card
   */
  getStudentCard: async (
    studentId: string,
  ): Promise<StudentCard> => {
    const student =
      await studentService.getById(studentId);

    if (!student) {
      return mockRequest(
        unavailableCard(studentId),
      );
    }

    const existing = cardsData.find(
      (card) =>
        card.studentId ===
        student.id,
    );

    let card: StudentCard;

    if (existing) {
      card = existing;
    } else {
      card = buildInitialCard(student);
      cardsData.push(card);
      persistCards();
    }

    return mockRequest(card);
  },

  /**
   * Regenerate the attendance code of a student card.
   * The new code is persisted so the scanner keeps
   * working with the regenerated code.
   *
   * Backend replacement:
   * POST /students/:id/card/regenerate-code
   */
  regenerateStudentCardCode: async (
    studentId: string,
  ): Promise<StudentCard> => {
    const student =
      await studentService.getById(studentId);

    if (!student) {
      return mockRequest(
        unavailableCard(studentId),
      );
    }

    let attendanceCode =
      generateNewCode();

    while (isCodeUsed(attendanceCode)) {
      attendanceCode =
        generateNewCode();
    }

    const now = nowIso();
    const existingIndex =
      cardsData.findIndex(
        (card) =>
          card.studentId ===
          student.id,
      );

    const card: StudentCard = {
      studentId: student.id,
      status: "active",
      attendanceCode,
      parentQrValue: `/parent-portal/${student.id}`,
      issuedAt:
        existingIndex === -1
          ? now
          : (cardsData[existingIndex]
              .issuedAt ?? now),
      updatedAt: now,
    };

    if (existingIndex === -1) {
      cardsData.push(card);
    } else {
      cardsData[existingIndex] = card;
    }

    persistCards();

    return mockRequest(card);
  },
};