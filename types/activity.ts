export type StudentActivityType =
  | "created"
  | "updated"
  | "payment"
  | "attendance"
  | "grade"
  | "message"
  | "group";

export type StudentActivity = {
  id: string;
  studentId: string;
  type: StudentActivityType;
  title: string;
  description?: string;
  createdAt: string;
  createdBy?: string;
};