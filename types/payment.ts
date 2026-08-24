export type PaymentMethod =
  | "cash"
  | "bank_transfer"
  | "vodafone_cash"
  | "instapay";

export type PaymentStatus =
  | "paid"
  | "partial"
  | "unpaid";

export type Payment = {
  id: string;
  studentId: string;
  amount: number;
  method: PaymentMethod;
  paidAt: string;
  notes?: string;
  createdAt: string;
};

export type StudentFinance = {
  studentId: string;
  totalRequired: number;
  paid: number;
  remaining: number;
  status: PaymentStatus;
};