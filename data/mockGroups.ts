import type { Group } from "@/types";

export const mockGroups: Group[] = [
  {
    id: "group-001",
    name: "مجموعة أ",
    subject: "الرياضيات",
    grade: "ثالثة ثانوي",
    teacher: "أحمد محمود",
    room: "قاعة 1",
    maxStudents: 30,
    schedule: [
      { day: "الأحد", startTime: "16:00" },
      { day: "الثلاثاء", startTime: "16:00" },
      { day: "الخميس", startTime: "16:00" },
    ],
    status: "active",
    createdAt: "2026-08-01T09:00:00.000Z",
    updatedAt: "2026-08-20T12:00:00.000Z",
  },
  {
    id: "group-002",
    name: "مجموعة ب",
    subject: "اللغة الإنجليزية",
    grade: "ثانية ثانوي",
    teacher: "محمد علي",
    room: "قاعة 2",
    maxStudents: 25,
    schedule: [
      { day: "السبت", startTime: "17:30" },
      { day: "الاثنين", startTime: "17:30" },
      { day: "الأربعاء", startTime: "17:30" },
    ],
    status: "active",
    createdAt: "2026-08-01T09:00:00.000Z",
    updatedAt: "2026-08-20T12:00:00.000Z",
  },
];
