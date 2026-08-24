import type { ModuleKey } from "@/types/settings";

export type ModuleDefinition = {
  key: ModuleKey;
  label: string;
  description: string;
  navHref?: string;
};

export const MODULE_DEFINITIONS: ModuleDefinition[] = [
  {
    key: "students",
    label: "الطلاب",
    description: "إدارة بيانات الطلاب",
    navHref: "/students",
  },
  {
    key: "groups",
    label: "المجموعات",
    description: "إدارة مجموعات الطلاب",
    navHref: "/groups",
  },
  {
    key: "lessons",
    label: "الحصص",
    description: "إدارة الحصص والجلسات",
    navHref: "/lessons",
  },
  {
    key: "payments",
    label: "المدفوعات",
    description: "إدارة المصروفات والمدفوعات",
    navHref: "/payments",
  },
  {
    key: "exams",
    label: "الامتحانات والدرجات",
    description: "إدارة الامتحانات والنتائج",
    navHref: "/exams",
  },
  {
    key: "excel",
    label: "Excel",
    description: "استيراد وتصدير البيانات",
    navHref: "/excel",
  },
  {
    key: "attendance",
    label: "الحضور والغياب",
    description: "إدارة حضور الطلاب",
    navHref: "/attendance",
  },
  {
    key: "checkOut",
    label: "الحضور والانصراف",
    description: "تسجيل دخول وانصراف الطلاب",
    navHref: "/check-out",
  },
  {
    key: "whatsapp",
    label: "WhatsApp",
    description: "رسائل أولياء الأمور",
    navHref: "/messages",
  },
  {
    key: "reports",
    label: "التقارير",
    description: "تقارير المركز",
    navHref: "/reports",
  },
];

export const DEFAULT_MODULES: Record<
  ModuleKey,
  boolean
> = {
  students: true,
  groups: true,
  lessons: true,
  payments: true,
  exams: true,
  excel: true,
  attendance: true,

  checkOut: false,

  location: false,
  attendancePassword: false,

  whatsapp: true,

  resultMessages: true,
  attendanceMessages: true,
  checkOutMessages: false,
  absenceMessages: true,

  reports: false,
};