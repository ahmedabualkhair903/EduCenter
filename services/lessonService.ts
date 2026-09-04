
import { mockLessons } from "@/data";
import type { Lesson } from "@/types";
import { mockRequest, saveToStorage, loadFromStorage } from "./mockService";

const STORAGE_KEY = "lessons";

const lessonsData = loadFromStorage<Lesson[]>(STORAGE_KEY, mockLessons);

export const lessonService = {
  list: async (): Promise<Lesson[]> => mockRequest(lessonsData),

  getById: async (id: string): Promise<Lesson | null> =>
    mockRequest(lessonsData.find((item) => item.id === id) ?? null),

  create: async (
    lesson: Omit<Lesson, "id" | "createdAt" | "updatedAt">,
  ): Promise<Lesson> => {
    const now = new Date().toISOString();
    const newLesson: Lesson = {
      ...lesson,
      id: `lesson-${Date.now()}`,
      createdAt: now,
      updatedAt: now,
    };
    lessonsData.unshift(newLesson);
    saveToStorage(STORAGE_KEY, lessonsData);
    return mockRequest(newLesson);
  },

  update: async (
    id: string,
    updates: Partial<Omit<Lesson, "id" | "createdAt">>,
  ): Promise<Lesson | null> => {
    const index = lessonsData.findIndex((item) => item.id === id);
    if (index === -1) return mockRequest(null);

    const updatedLesson: Lesson = {
      ...lessonsData[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    lessonsData[index] = updatedLesson;
    saveToStorage(STORAGE_KEY, lessonsData);
    return mockRequest(updatedLesson);
  },

  delete: async (id: string): Promise<boolean> => {
    const index = lessonsData.findIndex((item) => item.id === id);
    if (index === -1) return mockRequest(false);

    lessonsData.splice(index, 1);
    saveToStorage(STORAGE_KEY, lessonsData);
    return mockRequest(true);
  },
};
