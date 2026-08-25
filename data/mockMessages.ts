import type { WhatsAppMessage } from "@/types";

export const mockMessages: WhatsAppMessage[] = [
  {
    id: "message-001",
    studentId: "student-001",
    guardianPhone: "201000000001",
    type: "reminder",
    status: "sent",
    content:
      "تذكير: موعد حصة الرياضيات اليوم في تمام الساعة 5:00 مساءً.",
    createdAt: "2026-08-20T12:00:00.000Z",
    sentAt: "2026-08-20T12:01:00.000Z",
  },
  {
    id: "message-002",
    studentId: "student-001",
    guardianPhone: "201000000001",
    type: "notification",
    status: "sent",
    content:
      "تم تسجيل حضور الطالب في حصة اليوم بنجاح.",
    createdAt: "2026-08-18T18:15:00.000Z",
    sentAt: "2026-08-18T18:16:00.000Z",
  },
  {
    id: "message-003",
    studentId: "student-001",
    guardianPhone: "201000000001",
    type: "individual",
    status: "sent",
    content:
      "تم تحديث نتيجة اختبار الشهر الأول. يمكنكم مراجعة النتيجة من ملف الطالب.",
    createdAt: "2026-08-10T14:30:00.000Z",
    sentAt: "2026-08-10T14:31:00.000Z",
  },
  {
    id: "message-004",
    studentId: "student-002",
    guardianPhone: "201000000002",
    type: "reminder",
    status: "sent",
    content:
      "تذكير بموعد الاختبار القادم.",
    createdAt: "2026-08-19T11:00:00.000Z",
    sentAt: "2026-08-19T11:01:00.000Z",
  },
  {
    id: "message-005",
    studentId: "student-003",
    guardianPhone: "201000000003",
    type: "individual",
    status: "failed",
    content:
      "تنبيه بخصوص متابعة مستوى الطالب الدراسي.",
    createdAt: "2026-08-17T15:00:00.000Z",
    error:
      "تعذر إرسال الرسالة.",
  },
];