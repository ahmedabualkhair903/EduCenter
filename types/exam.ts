export type Exam = {
  id: string;
  name: string;
  subject: string;
  groupId: string;
  maxScore: number;
  date: string;
  createdAt: string;
};

export type Grade = {
  id: string;
  examId: string;
  studentId: string;
  score: number | null;
  status: "pending" | "approved";
};