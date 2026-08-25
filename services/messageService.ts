import { mockMessages } from "@/data";
import type { WhatsAppMessage } from "@/types";
import { mockRequest } from "./mockService";

export const messageService = {
  list: async (): Promise<WhatsAppMessage[]> =>
    mockRequest(mockMessages),

  listByStudent: async (
    studentId: string,
  ): Promise<WhatsAppMessage[]> =>
    mockRequest(
      mockMessages.filter(
        (item) => item.studentId === studentId,
      ),
    ),

  getById: async (
    id: string,
  ): Promise<WhatsAppMessage | null> => {
    const message =
      mockMessages.find(
        (item) => item.id === id,
      ) ?? null;

    return mockRequest(message);
  },
};