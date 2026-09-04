export type LessonStatus =
  | "upcoming"
  | "ongoing"
  | "completed"
  | "cancelled";

export type Lesson = {
  id: string;
  subject: string;
  teacher: string;
  group: string;
  date: string;
  time: string;
  duration: number;
  room: string;
  students: number;
  status: LessonStatus;
  notes: string;
  createdAt: string;
  updatedAt: string;
};
