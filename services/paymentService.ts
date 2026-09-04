
import { mockPayments } from "@/data";
import type { Payment } from "@/types";
import {
  mockRequest,
  saveToStorage,
  loadFromStorage,
} from "./mockService";

const STORAGE_KEY_PAYMENTS = "payments";

const paymentsData = loadFromStorage<Payment[]>(
  STORAGE_KEY_PAYMENTS,
  mockPayments,
);

export const paymentService = {
  list: async (): Promise<Payment[]> =>
    mockRequest(paymentsData),

  listByStudent: async (
    studentId: string,
  ): Promise<Payment[]> =>
    mockRequest(
      paymentsData.filter(
        (item) => item.studentId === studentId,
      ),
    ),

  create: async (
    payment: Omit<Payment, "id" | "createdAt">,
  ): Promise<Payment> => {
    const now = new Date().toISOString();

    const newPayment: Payment = {
      ...payment,
      id: `payment-${Date.now()}`,
      createdAt: now,
    };

    paymentsData.unshift(newPayment);

    saveToStorage(
      STORAGE_KEY_PAYMENTS,
      paymentsData,
    );

    return mockRequest(newPayment);
  },

  update: async (
    id: string,
    updates: Partial<Payment>,
  ): Promise<Payment | null> => {
    const index = paymentsData.findIndex(
      (item) => item.id === id,
    );

    if (index === -1) {
      return mockRequest(null);
    }

    const updatedPayment: Payment = {
      ...paymentsData[index],
      ...updates,
    };

    paymentsData[index] = updatedPayment;

    saveToStorage(
      STORAGE_KEY_PAYMENTS,
      paymentsData,
    );

    return mockRequest(updatedPayment);
  },

  delete: async (
    id: string,
  ): Promise<boolean> => {
    const index = paymentsData.findIndex(
      (item) => item.id === id,
    );

    if (index === -1) {
      return mockRequest(false);
    }

    paymentsData.splice(index, 1);

    saveToStorage(
      STORAGE_KEY_PAYMENTS,
      paymentsData,
    );

    return mockRequest(true);
  },
};
