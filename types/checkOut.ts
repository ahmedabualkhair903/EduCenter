export type CheckOutStatus = "inside" | "checked-out";

export type CheckOutRecord = {
  id: string;
  studentId: string;
  groupId: string;
  lessonId: string;
  student: string;
  phone: string;
  group: string;
  subject: string;
  checkIn: string;
  checkOut: string;
  createdAt: string;
  updatedAt: string;
};
