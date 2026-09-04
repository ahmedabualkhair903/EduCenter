
import {
  mockRequest,
  saveToStorage,
  loadFromStorage,
} from "./mockService";

import {
  mockStudentCustomFields,
  mockStudents,
} from "@/data";

import type {
  Student,
  StudentCustomFieldDefinition,
  StudentCustomFieldValue,
} from "@/types";

const STORAGE_KEY_STUDENTS = "students";
const STORAGE_KEY_CUSTOM_FIELDS =
  "custom_fields";

const studentsData = loadFromStorage<Student[]>(
  STORAGE_KEY_STUDENTS,
  mockStudents,
);

const customFieldsData =
  loadFromStorage<StudentCustomFieldDefinition[]>(
    STORAGE_KEY_CUSTOM_FIELDS,
    mockStudentCustomFields,
  );

export type CreateStudentInput = Student;

export type UpdateStudentInput =
  Partial<Omit<Student, "id" | "createdAt">>;

export const studentService = {
  list: async (): Promise<Student[]> => {
    return mockRequest(
      studentsData.map((student) => ({
        ...student,
        customFields: [
          ...(student.customFields ?? []),
        ],
      })),
    );
  },

  getById: async (
    id: string,
  ): Promise<Student | null> => {
    const student =
      studentsData.find(
        (item) => item.id === id,
      ) ?? null;

    if (!student) {
      return mockRequest(null);
    }

    return mockRequest({
      ...student,
      customFields: [
        ...(student.customFields ?? []),
      ],
    });
  },

  create: async (
    student: CreateStudentInput,
  ): Promise<Student> => {
    const normalizedStudentId =
      student.studentId.trim();

    const existingStudent =
      studentsData.find(
        (item) =>
          item.studentId
            .trim()
            .toLowerCase() ===
          normalizedStudentId.toLowerCase(),
      );

    if (existingStudent) {
      throw new Error(
        "رقم الطالب مستخدم بالفعل",
      );
    }

    const now =
      new Date().toISOString();

    const createdStudent: Student = {
      ...student,
      studentId: normalizedStudentId,
      customFields: [
        ...(student.customFields ?? []),
      ],
      createdAt:
        student.createdAt || now,
      updatedAt:
        student.updatedAt || now,
    };

    studentsData.unshift(
      createdStudent,
    );

    saveToStorage(
      STORAGE_KEY_STUDENTS,
      studentsData,
    );

    return mockRequest(
      createdStudent,
    );
  },

  update: async (
    id: string,
    updates: UpdateStudentInput,
  ): Promise<Student | null> => {
    const index =
      studentsData.findIndex(
        (item) => item.id === id,
      );

    if (index === -1) {
      return mockRequest(null);
    }

    const currentStudent =
      studentsData[index];

    const normalizedStudentId =
      updates.studentId?.trim();

    if (normalizedStudentId) {
      const duplicateStudent =
        studentsData.find(
          (item) =>
            item.id !== id &&
            item.studentId
              .trim()
              .toLowerCase() ===
            normalizedStudentId.toLowerCase(),
        );

      if (duplicateStudent) {
        throw new Error(
          "رقم الطالب مستخدم بالفعل",
        );
      }
    }

    const updatedCustomFields: StudentCustomFieldValue[] =
      updates.customFields ??
      currentStudent.customFields ??
      [];

    const updatedStudent: Student = {
      ...currentStudent,
      ...updates,
      ...(normalizedStudentId
        ? {
            studentId:
              normalizedStudentId,
          }
        : {}),
      customFields: [
        ...updatedCustomFields,
      ],
      updatedAt:
        new Date().toISOString(),
    };

    studentsData[index] =
      updatedStudent;

    saveToStorage(
      STORAGE_KEY_STUDENTS,
      studentsData,
    );

    return mockRequest(
      updatedStudent,
    );
  },

  delete: async (
    id: string,
  ): Promise<boolean> => {
    const index =
      studentsData.findIndex(
        (item) => item.id === id,
      );

    if (index === -1) {
      return mockRequest(false);
    }

    studentsData.splice(index, 1);

    saveToStorage(
      STORAGE_KEY_STUDENTS,
      studentsData,
    );

    return mockRequest(true);
  },

  customFields:
    async (): Promise<
      StudentCustomFieldDefinition[]
    > => {
      return mockRequest(
        [...customFieldsData]
          .filter(
            (field) => field.active,
          )
          .sort(
            (a, b) =>
              a.order - b.order,
          ),
      );
    },

  createCustomField: async (
    definition: StudentCustomFieldDefinition,
  ): Promise<StudentCustomFieldDefinition> => {
    const normalizedId =
      definition.id.trim();

    const normalizedLabel =
      definition.label.trim();

    if (!normalizedId) {
      throw new Error(
        "معرف الحقل مطلوب",
      );
    }

    if (!normalizedLabel) {
      throw new Error(
        "اسم الحقل مطلوب",
      );
    }

    const existingDefinition =
      customFieldsData.find(
        (field) =>
          field.id
            .trim()
            .toLowerCase() ===
          normalizedId.toLowerCase(),
      );

    if (existingDefinition) {
      throw new Error(
        "الحقل موجود بالفعل",
      );
    }

    const createdDefinition: StudentCustomFieldDefinition =
      {
        ...definition,
        id: normalizedId,
        label: normalizedLabel,
        options:
          definition.options?.map(
            (option) =>
              option.trim(),
          ),
      };

    customFieldsData.push(
      createdDefinition,
    );

    saveToStorage(
      STORAGE_KEY_CUSTOM_FIELDS,
      customFieldsData,
    );

    return mockRequest(
      createdDefinition,
    );
  },

  deleteCustomField: async (
    fieldId: string,
  ): Promise<boolean> => {
    const index =
      customFieldsData.findIndex(
        (field) =>
          field.id === fieldId,
      );

    if (index === -1) {
      return mockRequest(false);
    }

    customFieldsData.splice(
      index,
      1,
    );

    saveToStorage(
      STORAGE_KEY_CUSTOM_FIELDS,
      customFieldsData,
    );

    studentsData.forEach(
      (student) => {
        student.customFields = (
          student.customFields ?? []
        ).filter(
          (field) =>
            field.fieldId !==
            fieldId,
        );
      },
    );

    saveToStorage(
      STORAGE_KEY_STUDENTS,
      studentsData,
    );

    return mockRequest(true);
  },
};
