import type {
  Student,
  StudentCustomFieldDefinition,
} from "@/types";

export const mockStudentCustomFields: StudentCustomFieldDefinition[] = [
  {
    id: "school",
    label: "المدرسة",
    type: "text",
    active: true,
    order: 1,
  },
  {
    id: "seatNumber",
    label: "رقم الجلوس",
    type: "text",
    active: true,
    order: 2,
  },
];

export const mockStudents: Student[] = [
  {
    id: "student-001",
    studentId: "ST-1001",
    name: "أحمد محمد",
    phone: "01012345678",
    guardianName: "محمد أحمد",
    guardianPhone: "01011112222",
    grade: "ثالثة ثانوي",
    groupId: "group-001",
    address: "طنطا",
    notes: "متابعة مستوى الرياضيات",
    status: "active",

    customFields: [
      {
        fieldId: "school",
        value: "مدرسة طنطا الثانوية",
      },
      {
        fieldId: "seatNumber",
        value: "1024",
      },
    ],

    financial: {
      totalRequired: 3000,
      paid: 2500,
      remaining: 500,
    },

    createdAt: "2026-08-01T09:00:00.000Z",
    updatedAt: "2026-08-20T12:00:00.000Z",
  },

  {
    id: "student-002",
    studentId: "ST-1002",
    name: "سارة محمود",
    phone: "01123456789",
    guardianName: "محمود حسن",
    guardianPhone: "01111112222",
    grade: "ثانية ثانوي",
    groupId: "group-002",
    status: "active",

    customFields: [],

    financial: {
      totalRequired: 2500,
      paid: 2000,
      remaining: 500,
    },

    createdAt: "2026-08-02T09:00:00.000Z",
    updatedAt: "2026-08-20T12:00:00.000Z",
  },

  {
    id: "student-003",
    studentId: "ST-1003",
    name: "يوسف أحمد",
    phone: "01234567890",
    guardianName: "أحمد يوسف",
    guardianPhone: "01222223333",
    grade: "ثالثة ثانوي",
    groupId: "group-001",
    status: "active",

    customFields: [],

    financial: {
      totalRequired: 3000,
      paid: 2000,
      remaining: 1000,
    },

    createdAt: "2026-08-03T09:00:00.000Z",
    updatedAt: "2026-08-20T12:00:00.000Z",
  },

  {
    id: "student-004",
    studentId: "ST-1004",
    name: "ملك إبراهيم",
    phone: "01098765432",
    guardianName: "إبراهيم محمود",
    guardianPhone: "01033334444",
    grade: "أولى ثانوي",
    groupId: "group-003",
    status: "suspended",
    notes: "متوقف مؤقتًا",

    customFields: [],

    financial: {
      totalRequired: 2500,
      paid: 1750,
      remaining: 750,
    },

    createdAt: "2026-08-04T09:00:00.000Z",
    updatedAt: "2026-08-20T12:00:00.000Z",
  },

  {
    id: "student-005",
    studentId: "ST-1005",
    name: "عمر خالد",
    phone: "01198765432",
    guardianName: "خالد محمد",
    guardianPhone: "01144445555",
    grade: "ثانية ثانوي",
    groupId: "group-002",
    status: "active",

    customFields: [],

    financial: {
      totalRequired: 2500,
      paid: 2500,
      remaining: 0,
    },

    createdAt: "2026-08-05T09:00:00.000Z",
    updatedAt: "2026-08-20T12:00:00.000Z",
  },

  {
    id: "student-006",
    studentId: "ST-1006",
    name: "نور أحمد",
    phone: "01298765432",
    guardianName: "أحمد محمود",
    guardianPhone: "01255556666",
    grade: "ثالثة ثانوي",
    groupId: "group-001",
    status: "active",

    customFields: [],

    financial: {
      totalRequired: 3000,
      paid: 2700,
      remaining: 300,
    },

    createdAt: "2026-08-06T09:00:00.000Z",
    updatedAt: "2026-08-20T12:00:00.000Z",
  },
];