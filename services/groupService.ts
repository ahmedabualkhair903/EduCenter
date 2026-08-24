import { mockGroups } from "@/data";
import type { Group } from "@/types";
import { mockRequest } from "./mockService";

export const groupService = {
  list: async (): Promise<Group[]> => mockRequest(mockGroups),
  getById: async (id: string): Promise<Group | null> => mockRequest(mockGroups.find((item) => item.id === id) ?? null),
};
