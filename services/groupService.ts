
import { mockGroups } from "@/data";
import type { Group } from "@/types";
import { mockRequest, saveToStorage, loadFromStorage } from "./mockService";

const STORAGE_KEY_GROUPS = "groups";

const groupsData = loadFromStorage<Group[]>(STORAGE_KEY_GROUPS, mockGroups);

export const groupService = {
  list: async (): Promise<Group[]> => mockRequest(groupsData),
  getById: async (id: string): Promise<Group | null> => mockRequest(groupsData.find((item) => item.id === id) ?? null),
  create: async (group: Omit<Group, "id" | "createdAt" | "updatedAt">): Promise<Group> => {
    const now = new Date().toISOString();
    const newGroup: Group = {
      ...group,
      id: `group-${Date.now()}`,
      createdAt: now,
      updatedAt: now,
    };
    groupsData.unshift(newGroup);
    saveToStorage(STORAGE_KEY_GROUPS, groupsData);
    return mockRequest(newGroup);
  },
  update: async (id: string, updates: Partial<Group>): Promise<Group | null> => {
    const index = groupsData.findIndex((item) => item.id === id);
    if (index === -1) return mockRequest(null);
    
    const updatedGroup: Group = {
      ...groupsData[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    groupsData[index] = updatedGroup;
    saveToStorage(STORAGE_KEY_GROUPS, groupsData);
    return mockRequest(updatedGroup);
  },
  delete: async (id: string): Promise<boolean> => {
    const index = groupsData.findIndex((item) => item.id === id);
    if (index === -1) return mockRequest(false);
    
    groupsData.splice(index, 1);
    saveToStorage(STORAGE_KEY_GROUPS, groupsData);
    return mockRequest(true);
  },
};
