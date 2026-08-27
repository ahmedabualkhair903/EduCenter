import type { WhatsAppMessage } from "@/types";

const messageStatusLabels: Record<
  WhatsAppMessage["status"],
  string
> = {
  draft: "مسودة",
  scheduled: "مجدولة",
  pending: "قيد الانتظار",
  sent: "تم الإرسال",
  failed: "فشل الإرسال",
};

const messageTypeLabels: Record<
  WhatsAppMessage["type"],
  string
> = {
  individual: "فردية",
  group: "مجموعة",
  notification: "إشعار",
  reminder: "تذكير",
  attendance: "الحضور",
  checkOut: "الانصراف",
  examResult: "نتيجة اختبار",
  absence: "غياب",
};