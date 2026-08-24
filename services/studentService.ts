import { mockRequest } from "./mockService";

import {
  mockStudentCustomFields,
  mockStudents,
} from "@/data";

import type {
  Student,
  StudentCustomFieldDefinition,
} from "@/types";

export const studentService = {
  list: async (): Promise<Student[]> => {
    return mockRequest(mockStudents);
  },

  getById: async (
    id: string,
  ): Promise<Student | null> => {
    const student =
      mockStudents.find(
        (item) => item.id === id,
      ) ?? null;

    return mockRequest(student);
  },

  customFields:
    async (): Promise<
      StudentCustomFieldDefinition[]
    > => {
      return mockRequest(
        mockStudentCustomFields,
      );
    },
};