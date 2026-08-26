export type StudentActivityType =
  | "created"
  | "updated"
  | "payment"
  | "attendance"
  | "grade"
  | "message"
  | "group"
  | "student_created"
  | "student_updated"
  | "payment_recorded"
  | "attendance_recorded"
  | "grade_updated"
  | "message_sent";

export type StudentActivity = {
  id: string;
  studentId: string;
  type: StudentActivityType;
  title: string;
  description?: string;
  createdAt: string;
  createdBy?: string;
};