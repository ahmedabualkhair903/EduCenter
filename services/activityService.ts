
import { mockActivities } from "@/data";
import type { StudentActivity } from "@/types";
import { mockRequest, saveToStorage, loadFromStorage } from "./mockService";

const STORAGE_KEY_ACTIVITIES = "activities";

const activitiesData = loadFromStorage<StudentActivity[]>(STORAGE_KEY_ACTIVITIES, mockActivities);

export const activityService = {
  list: async (): Promise<StudentActivity[]> =>
    mockRequest(activitiesData),

  listByStudent: async (
    studentId: string,
  ): Promise<StudentActivity[]> =>
    mockRequest(
      activitiesData
        .filter(
          (item) => item.studentId === studentId,
        )
        .sort(
          (a, b) =>
            new Date(b.createdAt).getTime() -
            new Date(a.createdAt).getTime(),
        ),
    ),

  getById: async (
    id: string,
  ): Promise<StudentActivity | null> => {
    const activity =
      activitiesData.find(
        (item) => item.id === id,
      ) ?? null;

    return mockRequest(activity);
  },

  create: async (activity: Omit<StudentActivity, "id">): Promise<StudentActivity> => {
    const newActivity: StudentActivity = {
      ...activity,
      id: `activity-${Date.now()}`,
    };
    activitiesData.unshift(newActivity);
    saveToStorage(STORAGE_KEY_ACTIVITIES, activitiesData);
    return mockRequest(newActivity);
  },
};
