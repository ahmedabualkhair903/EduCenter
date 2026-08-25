import { mockActivities } from "@/data";
import type { StudentActivity } from "@/types";
import { mockRequest } from "./mockService";

export const activityService = {
  list: async (): Promise<StudentActivity[]> =>
    mockRequest(mockActivities),

  listByStudent: async (
    studentId: string,
  ): Promise<StudentActivity[]> =>
    mockRequest(
      mockActivities
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
      mockActivities.find(
        (item) => item.id === id,
      ) ?? null;

    return mockRequest(activity);
  },
};