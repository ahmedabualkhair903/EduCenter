
import { mockMessages } from "@/data";
import type { WhatsAppMessage } from "@/types";
import {
  mockRequest,
  saveToStorage,
  loadFromStorage,
} from "./mockService";

const STORAGE_KEY_MESSAGES = "messages";

const messagesData = loadFromStorage<WhatsAppMessage[]>(
  STORAGE_KEY_MESSAGES,
  mockMessages,
);

export const messageService = {
  list: async (): Promise<WhatsAppMessage[]> =>
    mockRequest(messagesData),

  listByStudent: async (
    studentId: string,
  ): Promise<WhatsAppMessage[]> =>
    mockRequest(
      messagesData.filter(
        (item) => item.studentId === studentId,
      ),
    ),

  getById: async (
    id: string,
  ): Promise<WhatsAppMessage | null> => {
    const message =
      messagesData.find(
        (item) => item.id === id,
      ) ?? null;

    return mockRequest(message);
  },

  create: async (
    message: Omit<
      WhatsAppMessage,
      "id" | "createdAt"
    >,
  ): Promise<WhatsAppMessage> => {
    const now = new Date().toISOString();

    const newMessage: WhatsAppMessage = {
      ...message,
      id: `message-${Date.now()}`,
      createdAt: now,
    };

    messagesData.unshift(newMessage);

    saveToStorage(
      STORAGE_KEY_MESSAGES,
      messagesData,
    );

    return mockRequest(newMessage);
  },

  update: async (
    id: string,
    updates: Partial<WhatsAppMessage>,
  ): Promise<WhatsAppMessage | null> => {
    const index = messagesData.findIndex(
      (item) => item.id === id,
    );

    if (index === -1) {
      return mockRequest(null);
    }

    const updatedMessage: WhatsAppMessage = {
      ...messagesData[index],
      ...updates,
    };

    messagesData[index] = updatedMessage;

    saveToStorage(
      STORAGE_KEY_MESSAGES,
      messagesData,
    );

    return mockRequest(updatedMessage);
  },

  delete: async (
    id: string,
  ): Promise<boolean> => {
    const index = messagesData.findIndex(
      (item) => item.id === id,
    );

    if (index === -1) {
      return mockRequest(false);
    }

    messagesData.splice(index, 1);

    saveToStorage(
      STORAGE_KEY_MESSAGES,
      messagesData,
    );

    return mockRequest(true);
  },
};
