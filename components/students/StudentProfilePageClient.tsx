
"use client";

import { useMemo, useState } from "react";

import {
  FiArrowRight,
  FiCalendar,
  FiCheckCircle,
  FiClock,
  FiEdit2,
  FiMessageCircle,
  FiPhone,
  FiUser,
} from "react-icons/fi";

import type {
  AttendanceRecord,
  Grade,
  Payment,
  Student,
  StudentActivity,
  WhatsAppMessage,
} from "@/types";

type ExamInfo = {
  id: string;
  name: string;
  subject: string;
  maxScore: number;
  date: string;
};

type Props = {
  student: Student;
  payments: Payment[];
  grades: Grade[];
  attendance: AttendanceRecord[];
  messages: WhatsAppMessage[];
  activities: StudentActivity[];
  exams: ExamInfo[];
  onEdit: () => void;
};

type Tab =
  | "overview"
  | "payments"
  | "grades"
  | "attendance"
  | "messages"
  | "activity";

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

const messageTypeLabels: Record<string, string> = {
  individual: "فردية",
  group: "مجموعة",
  notification: "إشعار",
  reminder: "تذكير",
  attendance: "الحضور",
  checkOut: "الانصراف",
  examResult: "نتيجة اختبار",
  absence: "غياب",
};

const attendanceLabels: Record<string, string> = {
  present: "حاضر",
  absent: "غائب",
  late: "متأخر",
  excused: "بعذر",
};

const studentStatusLabels: Record<
  Student["status"],
  string
> = {
  active: "نشط",
  inactive: "غير نشط",
  suspended: "متوقف",
};

export default function StudentProfileContent({
  student,
  payments,
  grades,
  attendance,
  messages,
  activities,
  exams,
  onEdit,
}: Props) {
  const [activeTab, setActiveTab] =
    useState<Tab>("overview");

  const totalPaid = useMemo(
    () =>
      payments.reduce(
        (sum, payment) =>
          sum + Number(payment.amount || 0),
        0,
      ),
    [payments],
  );

  const attendanceStats = useMemo(() => {
    const total = attendance.length;

    const present = attendance.filter(
      (record) => record.status === "present",
    ).length;

    const late = attendance.filter(
      (record) => record.status === "late",
    ).length;

    const absent = attendance.filter(
      (record) => record.status === "absent",
    ).length;

    const excused = attendance.filter(
      (record) => record.status === "excused",
    ).length;

    const rate =
      total > 0
        ? Math.round(
            ((present + late) / total) * 100,
          )
        : 0;

    return {
      total,
      present,
      late,
      absent,
      excused,
      rate,
    };
  }, [attendance]);

  const getExam = (examId: string) =>
    exams.find((exam) => exam.id === examId);

  const renderTabContent = () => {
    switch (activeTab) {
      case "payments":
        return (
          <PaymentsTab
            payments={payments}
            totalPaid={totalPaid}
          />
        );

      case "grades":
        return (
          <GradesTab
            grades={grades}
            exams={exams}
            getExam={getExam}
          />
        );

      case "attendance":
        return (
          <AttendanceTab
            attendance={attendance}
            stats={attendanceStats}
          />
        );

      case "messages":
        return (
          <MessagesTab
            messages={messages}
          />
        );

      case "activity":
        return (
          <ActivityTab
            activities={activities}
          />
        );

      case "overview":
      default:
        return (
          <OverviewTab
            student={student}
            payments={payments}
            grades={grades}
            attendance={attendance}
            messages={messages}
            activities={activities}
            exams={exams}
            totalPaid={totalPaid}
            attendanceRate={
              attendanceStats.rate
            }
            onEdit={onEdit}
          />
        );
    }
  };

  return (
    <div
      dir="rtl"
      className="min-h-screen bg-slate-50"
    >
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="mb-6 flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() =>
                window.history.back()
              }
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-200 text-slate-500 transition hover:bg-slate-50 hover:text-slate-900"
              aria-label="رجوع"
            >
              <FiArrowRight size={18} />
            </button>

            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-slate-900 text-xl font-bold text-white">
              {student.name?.charAt(0) || "ط"}
            </div>

            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl font-bold text-slate-900">
                  {student.name}
                </h1>

                <span
                  className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                    student.status === "active"
                      ? "bg-emerald-50 text-emerald-700"
                      : student.status === "suspended"
                      ? "bg-amber-50 text-amber-700"
                      : "bg-slate-100 text-slate-600"
                  }`}
                >
                  {studentStatusLabels[
                    student.status
                  ]}
                </span>
              </div>

              <div className="mt-1 flex flex-wrap items-center gap-3 text-sm text-slate-500">
                <span>
                  رقم الطالب: {student.studentId}
                </span>

                {student.phone && (
                  <span className="flex items-center gap-1">
                    <FiPhone size={14} />
                    {student.phone}
                  </span>
                )}
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={onEdit}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800"
          >
            <FiEdit2 size={16} />
            تعديل بيانات الطالب
          </button>
        </div>

        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            icon={<FiUser size={18} />}
            label="حالة الطالب"
            value={
              studentStatusLabels[
                student.status
              ]
            }
          />

          <StatCard
            icon={<FiCheckCircle size={18} />}
            label="نسبة الحضور"
            value={`${attendanceStats.rate}%`}
          />

          <StatCard
            icon={<FiCalendar size={18} />}
            label="الاختبارات"
            value={exams.length}
          />

          <StatCard
            icon={<FiMessageCircle size={18} />}
            label="الرسائل"
            value={messages.length}
          />
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[250px_minmax(0,1fr)]">
          <aside className="h-fit rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
            <TabButton
              label="نظرة عامة"
              active={activeTab === "overview"}
              onClick={() =>
                setActiveTab("overview")
              }
            />

            <TabButton
              label="المدفوعات والمصروفات"
              active={activeTab === "payments"}
              onClick={() =>
                setActiveTab("payments")
              }
            />

            <TabButton
              label="الدرجات والاختبارات"
              active={activeTab === "grades"}
              onClick={() =>
                setActiveTab("grades")
              }
            />

            <TabButton
              label="الحضور والغياب"
              active={activeTab === "attendance"}
              onClick={() =>
                setActiveTab("attendance")
              }
            />

            <TabButton
              label="رسائل واتساب"
              active={activeTab === "messages"}
              onClick={() =>
                setActiveTab("messages")
              }
            />

            <TabButton
              label="سجل النشاط"
              active={activeTab === "activity"}
              onClick={() =>
                setActiveTab("activity")
              }
            />
          </aside>

          <main>{renderTabContent()}</main>
        </div>
      </div>
    </div>
  );
}

function OverviewTab({
  student,
  payments,
  grades,
  attendance,
  messages,
  activities,
  exams,
  totalPaid,
  attendanceRate,
  onEdit,
}: {
  student: Student;
  payments: Payment[];
  grades: Grade[];
  attendance: AttendanceRecord[];
  messages: WhatsAppMessage[];
  activities: StudentActivity[];
  exams: ExamInfo[];
  totalPaid: number;
  attendanceRate: number;
  onEdit: () => void;
}) {
  return (
    <div className="space-y-6">
      <SectionHeading
        title="البيانات الأساسية"
        description="بيانات الطالب ومعلومات التواصل الأساسية."
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <InfoCard
          icon={<FiUser size={15} />}
          label="اسم الطالب"
          value={student.name}
        />

        <InfoCard
          icon={<FiPhone size={15} />}
          label="رقم الهاتف"
          value={student.phone || "غير متوفر"}
          direction="ltr"
        />

        <InfoCard
          icon={<FiUser size={15} />}
          label="اسم ولي الأمر"
          value={
            student.guardianName ||
            "غير متوفر"
          }
        />

        <InfoCard
          icon={<FiPhone size={15} />}
          label="هاتف ولي الأمر"
          value={
            student.guardianPhone ||
            "غير متوفر"
          }
          direction="ltr"
        />

        <InfoCard
          label="رقم الطالب"
          value={student.studentId}
          direction="ltr"
        />

        <InfoCard
          label="الصف الدراسي"
          value={String(
            student.grade || "غير محدد",
          )}
        />

        <InfoCard
          label="المجموعة"
          value={
            student.groupId || "غير محددة"
          }
        />

        <InfoCard
          label="العنوان"
          value={
            student.address || "غير متوفر"
          }
        />
      </div>

      {student.notes && (
        <section className="rounded-2xl border border-slate-200 bg-white p-5">
          <SectionHeading
            title="ملاحظات"
            description="ملاحظات إضافية خاصة بالطالب."
          />

          <p className="whitespace-pre-wrap text-sm leading-7 text-slate-600">
            {student.notes}
          </p>
        </section>
      )}

      <section className="rounded-2xl border border-slate-200 bg-white p-5">
        <SectionHeading
          title="ملخص سريع"
          description="نظرة مختصرة على أهم بيانات الطالب."
        />

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <FinanceCard
            label="إجمالي المدفوع"
            value={totalPaid}
            positive
          />

          <FinanceCard
            label="عدد الدرجات"
            value={grades.length}
          />

          <FinanceCard
            label="سجلات الحضور"
            value={attendance.length}
          />

          <FinanceCard
            label="الرسائل"
            value={messages.length}
          />
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5">
        <SectionHeading
          title="الاختبارات"
          description="الاختبارات المرتبطة بالطالب."
        />

        {exams.length === 0 ? (
          <EmptyState text="لا توجد اختبارات مسجلة." />
        ) : (
          <div className="space-y-2">
            {exams.slice(0, 5).map((exam) => (
              <div
                key={exam.id}
                className="flex items-center justify-between rounded-xl border border-slate-100 p-3"
              >
                <div>
                  <p className="font-medium text-slate-800">
                    {exam.name}
                  </p>

                  <p className="mt-1 text-xs text-slate-400">
                    {exam.subject}
                  </p>
                </div>

                <span className="text-xs text-slate-400">
                  {formatDate(exam.date)}
                </span>
              </div>
            ))}
          </div>
        )}
      </section>

      {activities.length > 0 && (
        <section className="rounded-2xl border border-slate-200 bg-white p-5">
          <SectionHeading
            title="آخر الأنشطة"
            description="آخر العمليات المسجلة على ملف الطالب."
          />

          <div className="space-y-3">
            {activities
              .slice(0, 5)
              .map((activity) => (
                <div
                  key={activity.id}
                  className="flex gap-3 rounded-xl border border-slate-100 p-3"
                >
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
                    <FiClock size={15} />
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-slate-700">
                      {activity.title}
                    </p>

                    {activity.description && (
                      <p className="mt-1 text-xs leading-6 text-slate-400">
                        {activity.description}
                      </p>
                    )}

                    <p className="mt-1 text-[11px] text-slate-400">
                      {formatDateTime(
                        activity.createdAt,
                      )}
                    </p>
                  </div>
                </div>
              ))}
          </div>
        </section>
      )}

      <button
        type="button"
        onClick={onEdit}
        className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
      >
        <FiEdit2 size={16} />
        تعديل بيانات الطالب
      </button>
    </div>
  );
}

function PaymentsTab({
  payments,
  totalPaid,
}: {
  payments: Payment[];
  totalPaid: number;
}) {
  return (
    <div className="space-y-6">
      <SectionHeading
        title="المدفوعات والمصروفات"
        description="سجل المدفوعات الخاصة بالطالب."
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <FinanceCard
          label="إجمالي المدفوع"
          value={totalPaid}
          positive
        />

        <FinanceCard
          label="عدد عمليات الدفع"
          value={payments.length}
        />
      </div>

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
        {payments.length === 0 ? (
          <EmptyState text="لا توجد مدفوعات مسجلة لهذا الطالب." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[600px] text-right text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-xs text-slate-500">
                  <th className="px-4 py-3">
                    التاريخ
                  </th>
                  <th className="px-4 py-3">
                    المبلغ
                  </th>
                  <th className="px-4 py-3">
                    طريقة الدفع
                  </th>
                  <th className="px-4 py-3">
                    الحالة
                  </th>
                </tr>
              </thead>

              <tbody>
                {payments.map((payment) => (
                  <tr
                    key={payment.id}
                    className="border-b border-slate-100 last:border-0"
                  >
                    <td className="px-4 py-3 text-slate-600">
                      {formatDate(
                        payment.paidAt,
                      )}
                    </td>

                    <td className="px-4 py-3 font-semibold text-slate-800">
                      {Number(
                        payment.amount || 0,
                      ).toLocaleString("ar-EG")}{" "}
                      ج.م
                    </td>

                    <td className="px-4 py-3 text-slate-600">
                      {payment.method}
                    </td>

                    <td className="px-4 py-3">
                      <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700">
                        مكتمل
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}

function GradesTab({
  grades,
  exams,
  getExam,
}: {
  grades: Grade[];
  exams: ExamInfo[];
  getExam: (
    examId: string,
  ) => ExamInfo | undefined;
}) {
  return (
    <div className="space-y-6">
      <SectionHeading
        title="الدرجات والاختبارات"
        description="نتائج الاختبارات المسجلة للطالب."
      />

      {grades.length === 0 ? (
        <section className="rounded-2xl border border-slate-200 bg-white">
          <EmptyState text="لا توجد درجات مسجلة لهذا الطالب." />
        </section>
      ) : (
        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[600px] text-right text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-xs text-slate-500">
                  <th className="px-4 py-3">
                    الاختبار
                  </th>
                  <th className="px-4 py-3">
                    المادة
                  </th>
                  <th className="px-4 py-3">
                    الدرجة
                  </th>
                  <th className="px-4 py-3">
                    الحالة
                  </th>
                </tr>
              </thead>

              <tbody>
                {grades.map((grade) => {
                  const exam = getExam(
                    grade.examId,
                  );

                  return (
                    <tr
                      key={grade.id}
                      className="border-b border-slate-100 last:border-0"
                    >
                      <td className="px-4 py-3 font-medium text-slate-700">
                        {exam?.name ||
                          "اختبار غير معروف"}
                      </td>

                      <td className="px-4 py-3 text-slate-500">
                        {exam?.subject ||
                          "غير محدد"}
                      </td>

                      <td className="px-4 py-3 font-semibold text-slate-800">
                        {grade.score ?? "لم ترصد"}

                        {exam &&
                          ` / ${exam.maxScore}`}
                      </td>

                      <td className="px-4 py-3">
                        {grade.status ===
                        "approved" ? (
                          <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700">
                            معتمدة
                          </span>
                        ) : (
                          <span className="rounded-full bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-700">
                            قيد المراجعة
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {exams.length === 0 && (
        <p className="text-xs text-slate-400">
          لا توجد اختبارات متاحة حاليًا.
        </p>
      )}
    </div>
  );
}

function AttendanceTab({
  attendance,
  stats,
}: {
  attendance: AttendanceRecord[];
  stats: {
    total: number;
    present: number;
    late: number;
    absent: number;
    excused: number;
    rate: number;
  };
}) {
  return (
    <div className="space-y-6">
      <SectionHeading
        title="الحضور والغياب"
        description="سجل حضور الطالب وانصرافه."
      />

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
        <MiniStat
          label="الإجمالي"
          value={stats.total}
        />

        <MiniStat
          label="حضور"
          value={stats.present}
        />

        <MiniStat
          label="متأخر"
          value={stats.late}
        />

        <MiniStat
          label="غياب"
          value={stats.absent}
        />

        <MiniStat
          label="بعذر"
          value={stats.excused}
        />
      </div>

      <section className="rounded-2xl border border-slate-200 bg-white p-5">
        <div className="mb-5 flex items-center justify-between">
          <div>
            <p className="text-sm font-bold text-slate-800">
              نسبة الحضور
            </p>

            <p className="mt-1 text-xs text-slate-400">
              الحضور والمتأخر ضمن إجمالي السجلات
            </p>
          </div>

          <span className="text-xl font-bold text-slate-800">
            {stats.rate}%
          </span>
        </div>

        <div className="h-2 overflow-hidden rounded-full bg-slate-100">
          <div
            className="h-full rounded-full bg-emerald-500"
            style={{
              width: `${stats.rate}%`,
            }}
          />
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white">
        {attendance.length === 0 ? (
          <EmptyState text="لا توجد سجلات حضور لهذا الطالب." />
        ) : (
          <div className="divide-y divide-slate-100">
            {attendance.map((record) => (
              <div
                key={record.id}
                className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`h-2 w-2 rounded-full ${
                        record.status ===
                        "present"
                          ? "bg-emerald-500"
                          : record.status ===
                            "late"
                          ? "bg-amber-500"
                          : record.status ===
                            "excused"
                          ? "bg-blue-500"
                          : "bg-red-500"
                      }`}
                    />

                    <p className="font-medium text-slate-800">
                      {attendanceLabels[
                        record.status
                      ] || "غير محدد"}
                    </p>
                  </div>

                  <p className="mt-1 text-xs text-slate-400">
                    المجموعة:{" "}
                    {record.groupId}
                  </p>
                </div>

                <div className="text-xs text-slate-400">
                  {record.checkedInAt && (
                    <p>
                      دخول:{" "}
                      {formatDateTime(
                        record.checkedInAt,
                      )}
                    </p>
                  )}

                  {record.checkedOutAt && (
                    <p className="mt-1">
                      خروج:{" "}
                      {formatDateTime(
                        record.checkedOutAt,
                      )}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function MessagesTab({
  messages,
}: {
  messages: WhatsAppMessage[];
}) {
  return (
    <div className="space-y-6">
      <SectionHeading
        title="رسائل واتساب"
        description="الرسائل المرتبطة بالطالب."
      />

      <section className="rounded-2xl border border-slate-200 bg-white">
        {messages.length === 0 ? (
          <EmptyState text="لا توجد رسائل لهذا الطالب." />
        ) : (
          <div className="divide-y divide-slate-100">
            {messages.map((message) => (
              <div
                key={message.id}
                className="p-4"
              >
                <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-medium text-slate-600">
                        {messageTypeLabels[
                          message.type
                        ] || "رسالة"}
                      </span>

                      <span
                        className={`rounded-full px-2.5 py-1 text-[11px] font-medium ${
                          message.status ===
                          "sent"
                            ? "bg-emerald-50 text-emerald-700"
                            : message.status ===
                              "failed"
                            ? "bg-red-50 text-red-700"
                            : "bg-slate-100 text-slate-600"
                        }`}
                      >
                        {
                          messageStatusLabels[
                            message.status
                          ]
                        }
                      </span>
                    </div>

                    <p className="mt-3 text-sm font-medium leading-6 text-slate-700">
                      {message.content ||
                        "رسالة بدون محتوى"}
                    </p>

                    <p className="mt-2 text-[11px] text-slate-400">
                      {message.sentAt
                        ? `تم الإرسال ${formatDateTime(
                            message.sentAt,
                          )}`
                        : `تم الإنشاء ${formatDateTime(
                            message.createdAt,
                          )}`}
                    </p>

                    {message.error && (
                      <p className="mt-2 rounded-lg bg-red-50 p-2 text-xs text-red-600">
                        {message.error}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function ActivityTab({
  activities,
}: {
  activities: StudentActivity[];
}) {
  return (
    <div className="space-y-6">
      <SectionHeading
        title="سجل النشاط والتعديلات"
        description="تاريخ التغييرات والعمليات التي تمت على ملف الطالب."
      />

      {activities.length === 0 ? (
        <section className="rounded-2xl border border-slate-200 bg-white">
          <EmptyState text="لا يوجد نشاط مسجل لهذا الطالب." />
        </section>
      ) : (
        <div className="space-y-3">
          {activities.map((activity) => (
            <div
              key={activity.id}
              className="flex gap-3 rounded-xl border border-slate-200 bg-white p-4"
            >
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-teal-50 text-teal-600">
                <FiClock size={16} />
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-sm font-semibold text-slate-700">
                    {activity.title}
                  </p>

                  <span className="text-[11px] text-slate-400">
                    {formatDateTime(
                      activity.createdAt,
                    )}
                  </span>
                </div>

                {activity.description && (
                  <p className="mt-1 text-xs leading-6 text-slate-400">
                    {activity.description}
                  </p>
                )}

                {activity.createdBy && (
                  <p className="mt-2 text-[11px] text-slate-400">
                    بواسطة:{" "}
                    <span className="font-medium text-slate-600">
                      {activity.createdBy}
                    </span>
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function SectionHeading({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div>
      <h2 className="text-base font-bold text-slate-800">
        {title}
      </h2>

      <p className="mt-1 text-xs text-slate-400">
        {description}
      </p>
    </div>
  );
}

function InfoCard({
  icon,
  label,
  value,
  direction = "rtl",
}: {
  icon?: React.ReactNode;
  label: string;
  value: string;
  direction?: "rtl" | "ltr";
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4">
      <div className="flex items-center gap-2 text-slate-400">
        {icon}

        <span className="text-[11px] font-medium">
          {label}
        </span>
      </div>

      <p
        dir={direction}
        className="mt-2 text-sm font-semibold text-slate-700"
      >
        {value}
      </p>
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
}: {
  icon?: React.ReactNode;
  label: string;
  value: number | string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
        {icon}
      </div>

      <p className="text-xs text-slate-400">
        {label}
      </p>

      <p className="mt-2 text-xl font-bold text-slate-800">
        {typeof value === "number"
          ? value.toLocaleString("ar-EG")
          : value}
      </p>
    </div>
  );
}

function FinanceCard({
  label,
  value,
  positive = false,
  warning = false,
}: {
  label: string;
  value: number;
  positive?: boolean;
  warning?: boolean;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <p className="text-xs text-slate-400">
        {label}
      </p>

      <p
        className={`mt-2 text-lg font-bold ${
          warning
            ? "text-amber-600"
            : positive
            ? "text-emerald-600"
            : "text-slate-800"
        }`}
      >
        {value.toLocaleString("ar-EG")} ج.م
      </p>
    </div>
  );
}

function MiniStat({
  label,
  value,
}: {
  label: string;
  value: number | string;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <p className="text-xs text-slate-400">
        {label}
      </p>

      <p className="mt-1 text-lg font-bold text-slate-800">
        {typeof value === "number"
          ? value.toLocaleString("ar-EG")
          : value}
      </p>
    </div>
  );
}

function TabButton({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`mb-1 w-full rounded-xl px-4 py-3 text-right text-sm font-medium transition ${
        active
          ? "bg-slate-900 text-white"
          : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
      }`}
    >
      {label}
    </button>
  );
}

function EmptyState({
  text,
}: {
  text: string;
}) {
  return (
    <div className="flex min-h-40 items-center justify-center px-5 text-center">
      <p className="text-sm text-slate-400">
        {text}
      </p>
    </div>
  );
}

function formatDate(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString("ar-EG", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function formatDateTime(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleString("ar-EG", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}
