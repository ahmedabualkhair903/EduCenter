import type { StudentActivity } from "@/types";

export const mockActivities: StudentActivity[] = [
  {
    id: "activity-001",
    studentId: "student-001",
    type: "student_created",
    title: "تم إنشاء ملف الطالب",
    description:
      "تم إنشاء ملف الطالب وإضافة بياناته الأساسية.",
    createdAt: "2026-07-15T09:00:00.000Z",
  },
  {
    id: "activity-002",
    studentId: "student-001",
    type: "student_updated",
    title: "تم تعديل بيانات الطالب",
    description:
      "تم تحديث بيانات التواصل وبيانات ولي الأمر.",
    createdAt: "2026-08-05T10:30:00.000Z",
  },
  {
    id: "activity-003",
    studentId: "student-001",
    type: "payment_recorded",
    title: "تم تسجيل دفعة مالية",
    description:
      "تم تسجيل دفعة مالية جديدة على حساب الطالب.",
    createdAt: "2026-08-08T12:15:00.000Z",
  },
  {
    id: "activity-004",
    studentId: "student-001",
    type: "attendance_recorded",
    title: "تم تسجيل الحضور",
    description:
      "تم تسجيل حضور الطالب في إحدى الحصص.",
    createdAt: "2026-08-20T18:05:00.000Z",
  },
  {
    id: "activity-005",
    studentId: "student-001",
    type: "grade_updated",
    title: "تم تحديث نتيجة اختبار",
    description:
      "تم اعتماد نتيجة اختبار الشهر الأول.",
    createdAt: "2026-08-10T13:00:00.000Z",
  },
  {
    id: "activity-006",
    studentId: "student-001",
    type: "message_sent",
    title: "تم إرسال رسالة WhatsApp",
    description:
      "تم إرسال رسالة إلى ولي الأمر.",
    createdAt: "2026-08-20T12:01:00.000Z",
  },
  {
    id: "activity-007",
    studentId: "student-002",
    type: "student_created",
    title: "تم إنشاء ملف الطالب",
    description:
      "تم إنشاء ملف الطالب.",
    createdAt: "2026-07-20T09:00:00.000Z",
  },
  {
    id: "activity-008",
    studentId: "student-003",
    type: "student_updated",
    title: "تم تعديل بيانات الطالب",
    description:
      "تم تحديث بيانات الطالب.",
    createdAt: "2026-08-12T11:00:00.000Z",
  },
];