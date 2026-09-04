
import { mockCheckOutRecords } from "@/data";
import type { CheckOutRecord } from "@/types";
import { mockRequest, saveToStorage, loadFromStorage } from "./mockService";

const STORAGE_KEY = "checkOuts";

const checkOutData = loadFromStorage<CheckOutRecord[]>(
  STORAGE_KEY,
  mockCheckOutRecords,
);

export const checkOutService = {
  list: async (): Promise<CheckOutRecord[]> => mockRequest(checkOutData),

  getById: async (id: string): Promise<CheckOutRecord | null> =>
    mockRequest(checkOutData.find((item) => item.id === id) ?? null),

  listByStudent: async (studentId: string): Promise<CheckOutRecord[]> =>
    mockRequest(checkOutData.filter((item) => item.studentId === studentId)),

  listByGroup: async (groupId: string): Promise<CheckOutRecord[]> =>
    mockRequest(checkOutData.filter((item) => item.groupId === groupId)),

  create: async (
    record: Omit<CheckOutRecord, "id" | "createdAt" | "updatedAt">,
  ): Promise<CheckOutRecord> => {
    const now = new Date().toISOString();
    const newRecord: CheckOutRecord = {
      ...record,
      id: `checkout-${Date.now()}`,
      createdAt: now,
      updatedAt: now,
    };
    checkOutData.unshift(newRecord);
    saveToStorage(STORAGE_KEY, checkOutData);
    return mockRequest(newRecord);
  },

  update: async (
    id: string,
    updates: Partial<Omit<CheckOutRecord, "id" | "createdAt">>,
  ): Promise<CheckOutRecord | null> => {
    const index = checkOutData.findIndex((item) => item.id === id);
    if (index === -1) return mockRequest(null);

    const updatedRecord: CheckOutRecord = {
      ...checkOutData[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    checkOutData[index] = updatedRecord;
    saveToStorage(STORAGE_KEY, checkOutData);
    return mockRequest(updatedRecord);
  },

  delete: async (id: string): Promise<boolean> => {
    const index = checkOutData.findIndex((item) => item.id === id);
    if (index === -1) return mockRequest(false);

    checkOutData.splice(index, 1);
    saveToStorage(STORAGE_KEY, checkOutData);
    return mockRequest(true);
  },
};
