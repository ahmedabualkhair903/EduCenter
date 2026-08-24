export type GroupStatus = "active" | "inactive";

export type GroupSchedule = {
  day: string;
  startTime: string;
  endTime?: string;
};

export type Group = {
  id: string;
  name: string;
  subject: string;
  grade: string;
  teacher: string;
  room?: string;
  maxStudents: number;
  schedule: GroupSchedule[];
  status: GroupStatus;
  createdAt: string;
  updatedAt: string;
};
