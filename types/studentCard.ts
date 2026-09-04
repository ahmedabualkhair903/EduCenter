
export type StudentCardStatus =
  | "active"
  | "inactive"
  | "not_issued";

export type StudentCard = {
  studentId: string;
  status: StudentCardStatus;
  attendanceCode: string | null;
  parentQrValue: string | null;
  issuedAt: string | null;
  updatedAt: string | null;
};

