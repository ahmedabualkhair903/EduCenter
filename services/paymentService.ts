import { mockPayments } from "@/data";
import type { Payment } from "@/types";
import { mockRequest } from "./mockService";

export const paymentService = {
  list: async (): Promise<Payment[]> => mockRequest(mockPayments),
  listByStudent: async (studentId: string): Promise<Payment[]> => mockRequest(mockPayments.filter((item) => item.studentId === studentId)),
};
