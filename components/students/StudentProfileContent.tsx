"use client";

import { useState } from "react";

import {
  FiArrowRight,
  FiCalendar,
  FiCheckCircle,
  FiClock,
  FiEdit2,
  FiFileText,
  FiMessageCircle,
  FiPhone,
  FiUser,
  FiUsers,
  FiXCircle,
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
  | "finance"
  | "grades"
  | "attendance"
  | "messages"
  | "activity";

const groupNames: Record<string, string> = {
  "group-001": "مجموعة أ",
  "group-002": "مجموعة ب",
  "group-003": "مجموعة ج",
};

const statusLabels: Record<
  Student["status"],
  string
> = {
  active: "نشط",
  inactive: "غير نشط",
  suspended: "متوقف",
};

const paymentMethodLabels: Record<
  Payment["method"],
  string
> = {
  cash: "نقدي",
  bank_transfer: "تحويل بنكي",
  vodafone_cash: "فودافون كاش",
  instapay: "InstaPay",
};

const attendanceLabels: Record<
  AttendanceRecord["status"],
  string
> = {
  present: "حاضر",
  absent: "غائب",
  late: "متأخر",
  excused: "غياب بعذر",
  unrecorded: "غير مسجل",
};

const messageStatusLabels: Record<
  WhatsAppMessage["status"],
  string
> = {
  draft: "مسودة",
  scheduled: "مجدولة",
  sent: "تم الإرسال",
  failed: "فشل الإرسال",
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

  const groupName = student.groupId
    ? groupNames[student.groupId] ??
      "غير محددة"
    : "غير محددة";

  const initials = student.name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((word) =>
      word.charAt(0),
    )
    .join("");

  const presentCount = attendance.filter(
    (item) =>
      item.status === "present",
  ).length;

  const absentCount = attendance.filter(
    (item) =>
      item.status === "absent",
  ).length;

  const lateCount = attendance.filter(
    (item) =>
      item.status === "late",
  ).length;

  const attendanceRecorded =
    attendance.filter(
      (item) =>
        item.status !== "unrecorded",
    ).length;

  const attendanceRate =
    attendanceRecorded > 0
      ? Math.round(
          (presentCount /
            attendanceRecorded) *
            100,
        )
      : 0;

  const approvedGrades = grades.filter(
    (grade) =>
      grade.status === "approved" &&
      grade.score !== null,
  );

  const averageGrade =
    approvedGrades.length > 0
      ? Math.round(
          approvedGrades.reduce(
            (total, grade) =>
              total +
              (grade.score ?? 0),
            0,
          ) /
            approvedGrades.length,
        )
      : null;

  const handleWhatsApp = () => {
    const phone =
      student.guardianPhone.replace(
        /\D/g,
        "",
      );

    if (!phone) {
      return;
    }

    window.open(
      `https://wa.me/${phone}`,
      "_blank",
      "noopener,noreferrer",
    );
  };

  return (
    <main
      dir="rtl"
      className="min-h-screen bg-slate-50"
    >
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="mb-5 flex items-center gap-2 text-xs text-slate-400">
          <span>الرئيسية</span>
          <span>/</span>
          <span>الطلاب</span>
          <span>/</span>
          <span className="font-medium text-teal-600">
            ملف الطالب
          </span>
        </div>

        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 p-5 sm:p-6">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex min-w-0 items-center gap-4">
                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-teal-50 text-lg font-bold text-teal-700">
                  {initials || (
                    <FiUser size={24} />
                  )}
                </div>

                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h1 className="text-xl font-bold text-slate-900">
                      {student.name}
                    </h1>

                    <span
                      className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                        student.status ===
                        "active"
                          ? "bg-emerald-50 text-emerald-700"
                          : student.status ===
                            "suspended"
                          ? "bg-amber-50 text-amber-700"
                          : "bg-slate-100 text-slate-600"
                      }`}
                    >
                      {
                        statusLabels[
                          student.status
                        ]
                      }
                    </span>
                  </div>

                  <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-400">
                    <span>
                      رقم الطالب:{" "}
                      <strong className="font-semibold text-slate-600">
                        {student.studentId}
                      </strong>
                    </span>

                    <span>
                      المجموعة:{" "}
                      <strong className="font-semibold text-slate-600">
                        {groupName}
                      </strong>
                    </span>

                    <span>
                      المرحلة:{" "}
                      <strong className="font-semibold text-slate-600">
                        {student.grade}
                      </strong>
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={handleWhatsApp}
                  disabled={
                    !student.guardianPhone
                  }
                  className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 text-sm font-medium text-slate-600 transition hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <FiMessageCircle
                    size={16}
                  />
                  واتساب
                </button>

                <button
                  type="button"
                  onClick={onEdit}
                  className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-teal-600 px-4 text-sm font-semibold text-white transition hover:bg-teal-700 active:scale-[0.98]"
                >
                  <FiEdit2 size={15} />
                  تعديل البيانات
                </button>
              </div>
            </div>
          </div>

          <nav className="overflow-x-auto border-b border-slate-100">
            <div className="flex min-w-max px-3 sm:px-5">
              <TabButton
                active={
                  activeTab ===
                  "overview"
                }
                onClick={() =>
                  setActiveTab(
                    "overview",
                  )
                }
              >
                <FiUser size={15} />
                البيانات الأساسية
              </TabButton>

              <TabButton
                active={
                  activeTab ===
                  "finance"
                }
                onClick={() =>
                  setActiveTab(
                    "finance",
                  )
                }
              >
                <FiFileText size={15} />
                المصروفات والمدفوعات
              </TabButton>

              <TabButton
                active={
                  activeTab === "grades"
                }
                onClick={() =>
                  setActiveTab(
                    "grades",
                  )
                }
              >
                <FiCheckCircle
                  size={15}
                />
                الدرجات
              </TabButton>

              <TabButton
                active={
                  activeTab ===
                  "attendance"
                }
                onClick={() =>
                  setActiveTab(
                    "attendance",
                  )
                }
              >
                <FiCalendar size={15} />
                الحضور والغياب
              </TabButton>

              <TabButton
                active={
                  activeTab ===
                  "messages"
                }
                onClick={() =>
                  setActiveTab(
                    "messages",
                  )
                }
              >
                <FiMessageCircle
                  size={15}
                />
                رسائل واتساب
              </TabButton>

              <TabButton
                active={
                  activeTab ===
                  "activity"
                }
                onClick={() =>
                  setActiveTab(
                    "activity",
                  )
                }
              >
                <FiClock size={15} />
                سجل النشاط
              </TabButton>
            </div>
          </nav>

          <div className="p-5 sm:p-6">
            {activeTab ===
              "overview" && (
              <OverviewTab
                student={student}
                groupName={groupName}
                attendanceRate={
                  attendanceRate
                }
                presentCount={
                  presentCount
                }
                absentCount={
                  absentCount
                }
                averageGrade={
                  averageGrade
                }
              />
            )}

            {activeTab ===
              "finance" && (
              <FinanceTab
                student={student}
                payments={payments}
              />
            )}

            {activeTab ===
              "grades" && (
              <GradesTab
                grades={grades}
                exams={exams}
              />
            )}

            {activeTab ===
              "attendance" && (
              <AttendanceTab
                attendance={
                  attendance
                }
                presentCount={
                  presentCount
                }
                absentCount={
                  absentCount
                }
                lateCount={lateCount}
                attendanceRate={
                  attendanceRate
                }
              />
            )}

            {activeTab ===
              "messages" && (
              <MessagesTab
                messages={messages}
              />
            )}

            {activeTab ===
              "activity" && (
              <ActivityTab
                activities={
                  activities
                }
              />
            )}
          </div>
        </section>
      </div>
    </main>
  );
}

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`relative flex h-12 shrink-0 items-center gap-2 px-4 text-xs font-semibold transition ${
        active
          ? "text-teal-700"
          : "text-slate-400 hover:text-slate-700"
      }`}
    >
      {children}

      {active && (
        <span className="absolute inset-x-3 bottom-0 h-0.5 rounded-full bg-teal-600" />
      )}
    </button>
  );
}

function OverviewTab({
  student,
  groupName,
  attendanceRate,
  presentCount,
  absentCount,
  averageGrade,
}: {
  student: Student;
  groupName: string;
  attendanceRate: number;
  presentCount: number;
  absentCount: number;
  averageGrade: number | null;
}) {
  return (
    <div className="space-y-6">
      <SectionHeading
        title="البيانات الأساسية"
        description="المعلومات الشخصية والدراسية وبيانات التواصل."
      />

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <InfoCard
          icon={<FiUser size={16} />}
          label="اسم الطالب"
          value={student.name}
        />

        <InfoCard
          icon={<FiFileText size={16} />}
          label="رقم الطالب"
          value={student.studentId}
          direction="ltr"
        />

        <InfoCard
          icon={<FiUsers size={16} />}
          label="المجموعة"
          value={groupName}
        />

        <InfoCard
          icon={<FiCalendar size={16} />}
          label="المرحلة الدراسية"
          value={student.grade}
        />

        <InfoCard
          icon={<FiPhone size={16} />}
          label="هاتف الطالب"
          value={
            student.phone ||
            "غير مسجل"
          }
          direction="ltr"
        />

        <InfoCard
          icon={<FiUser size={16} />}
          label="ولي الأمر"
          value={student.guardianName}
        />

        <InfoCard
          icon={<FiPhone size={16} />}
          label="هاتف ولي الأمر"
          value={
            student.guardianPhone ||
            "غير مسجل"
          }
          direction="ltr"
        />

        <InfoCard
          icon={<FiUser size={16} />}
          label="العنوان"
          value={
            student.address ||
            "غير مسجل"
          }
        />

        <InfoCard
          icon={<FiCalendar size={16} />}
          label="تاريخ التسجيل"
          value={formatDate(
            student.createdAt,
          )}
        />
      </div>

      <div>
        <SectionHeading
          title="ملخص سريع"
          description="نظرة مختصرة على الحالة الدراسية للطالب."
        />

        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            label="نسبة الحضور"
            value={`${attendanceRate}%`}
            description={`${presentCount} حضور`}
          />

          <StatCard
            label="أيام الغياب"
            value={absentCount}
            description="غياب مسجل"
          />

          <StatCard
            label="متوسط الدرجات"
            value={
              averageGrade === null
                ? "—"
                : `${averageGrade}%`
            }
            description="الاختبارات المعتمدة"
          />

          <StatCard
            label="المتبقي"
            value={`${student.financial.remaining.toLocaleString(
              "ar-EG",
            )} ج.م`}
            description="مستحقات حالية"
          />
        </div>
      </div>

      <div>
        <SectionHeading
          title="الملاحظات"
          description="ملاحظات إضافية مسجلة على ملف الطالب."
        />

        <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-4">
          {student.notes ? (
            <p className="whitespace-pre-wrap text-sm leading-7 text-slate-600">
              {student.notes}
            </p>
          ) : (
            <p className="text-sm text-slate-400">
              لا توجد ملاحظات مسجلة.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

function FinanceTab({
  student,
  payments,
}: {
  student: Student;
  payments: Payment[];
}) {
  return (
    <div className="space-y-6">
      <SectionHeading
        title="المصروفات والمدفوعات"
        description="ملخص الحالة المالية وسجل المدفوعات الخاصة بالطالب."
      />

      <div className="grid gap-3 sm:grid-cols-3">
        <FinanceCard
          label="إجمالي المطلوب"
          value={
            student.financial
              .totalRequired
          }
        />

        <FinanceCard
          label="إجمالي المدفوع"
          value={
            student.financial.paid
          }
          positive
        />

        <FinanceCard
          label="المتبقي"
          value={
            student.financial
              .remaining
          }
          warning={
            student.financial
              .remaining > 0
          }
        />
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200">
        <div className="border-b border-slate-100 bg-slate-50/70 px-4 py-3">
          <h3 className="text-xs font-bold text-slate-700">
            سجل المدفوعات
          </h3>
        </div>

        {payments.length === 0 ? (
          <EmptyState text="لا توجد مدفوعات مسجلة لهذا الطالب." />
        ) : (
          <div className="divide-y divide-slate-100">
            {payments.map(
              (payment) => (
                <div
                  key={payment.id}
                  className="flex flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <p className="text-sm font-semibold text-slate-700">
                      {payment.amount.toLocaleString(
                        "ar-EG",
                      )}{" "}
                      ج.م
                    </p>

                    <p className="mt-1 text-xs text-slate-400">
                      {
                        paymentMethodLabels[
                          payment.method
                        ]
                      }
                      {" · "}
                      {formatDate(
                        payment.paidAt,
                      )}
                    </p>
                  </div>

                  {payment.notes && (
                    <p className="text-xs text-slate-400">
                      {payment.notes}
                    </p>
                  )}
                </div>
              ),
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function GradesTab({
  grades,
  exams,
}: {
  grades: Grade[];
  exams: ExamInfo[];
}) {
  return (
    <div className="space-y-6">
      <SectionHeading
        title="الدرجات والاختبارات"
        description="نتائج الاختبارات المسجلة للطالب."
      />

      <div className="overflow-hidden rounded-xl border border-slate-200">
        {grades.length === 0 ? (
          <EmptyState text="لا توجد درجات مسجلة لهذا الطالب." />
        ) : (
          <div className="divide-y divide-slate-100">
            {grades.map((grade) => {
              const exam = exams.find(
                (item) =>
                  item.id ===
                  grade.examId,
              );

              const percentage =
                exam &&
                grade.score !== null
                  ? Math.round(
                      (grade.score /
                        exam.maxScore) *
                        100,
                    )
                  : null;

              return (
                <div
                  key={grade.id}
                  className="flex flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <p className="text-sm font-semibold text-slate-700">
                      {exam?.name ??
                        "اختبار غير معروف"}
                    </p>

                    <p className="mt-1 text-xs text-slate-400">
                      {exam?.subject ??
                        "—"}
                      {exam
                        ? ` · ${formatDate(
                            exam.date,
                          )}`
                        : ""}
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-sm font-bold text-slate-700">
                      {grade.score ===
                      null
                        ? "لم تُرصد"
                        : `${grade.score} / ${
                            exam?.maxScore ??
                            "—"
                          }`}
                    </span>

                    {percentage !==
                      null && (
                      <span className="rounded-full bg-teal-50 px-2.5 py-1 text-[11px] font-semibold text-teal-700">
                        {percentage}%
                      </span>
                    )}

                    <span
                      className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                        grade.status ===
                        "approved"
                          ? "bg-emerald-50 text-emerald-700"
                          : "bg-amber-50 text-amber-700"
                      }`}
                    >
                      {grade.status ===
                      "approved"
                        ? "معتمد"
                        : "قيد المراجعة"}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

function AttendanceTab({
  attendance,
  presentCount,
  absentCount,
  lateCount,
  attendanceRate,
}: {
  attendance: AttendanceRecord[];
  presentCount: number;
  absentCount: number;
  lateCount: number;
  attendanceRate: number;
}) {
  return (
    <div className="space-y-6">
      <SectionHeading
        title="الحضور والغياب"
        description="سجل حضور الطالب ومواعيد الدخول والخروج."
      />

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="نسبة الحضور"
          value={`${attendanceRate}%`}
        />

        <StatCard
          label="حاضر"
          value={presentCount}
        />

        <StatCard
          label="غائب"
          value={absentCount}
        />

        <StatCard
          label="متأخر"
          value={lateCount}
        />
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200">
        {attendance.length === 0 ? (
          <EmptyState text="لا توجد سجلات حضور لهذا الطالب." />
        ) : (
          <div className="divide-y divide-slate-100">
            {attendance.map(
              (record) => (
                <div
                  key={record.id}
                  className="flex flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`flex h-9 w-9 items-center justify-center rounded-lg ${
                        record.status ===
                        "present"
                          ? "bg-emerald-50 text-emerald-600"
                          : record.status ===
                            "absent"
                          ? "bg-red-50 text-red-600"
                          : record.status ===
                            "late"
                          ? "bg-amber-50 text-amber-600"
                          : "bg-slate-100 text-slate-500"
                      }`}
                    >
                      {record.status ===
                      "absent" ? (
                        <FiXCircle
                          size={16}
                        />
                      ) : (
                        <FiCheckCircle
                          size={16}
                        />
                      )}
                    </div>

                    <div>
                      <p className="text-sm font-semibold text-slate-700">
                        {
                          attendanceLabels[
                            record.status
                          ]
                        }
                      </p>

                      <p className="mt-1 text-xs text-slate-400">
                        المجموعة:{" "}
                        {groupNames[
                          record.groupId
                        ] ??
                          record.groupId}
                      </p>
                    </div>
                  </div>

                  <div className="text-xs text-slate-400 sm:text-right">
                    {record.checkedInAt && (
                      <p>
                        دخول:{" "}
                        <span className="font-medium text-slate-600">
                          {formatDateTime(
                            record.checkedInAt,
                          )}
                        </span>
                      </p>
                    )}

                    {record.checkedOutAt && (
                      <p className="mt-1">
                        خروج:{" "}
                        <span className="font-medium text-slate-600">
                          {formatDateTime(
                            record.checkedOutAt,
                          )}
                        </span>
                      </p>
                    )}
                  </div>
                </div>
              ),
            )}
          </div>
        )}
      </div>
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
        description="سجل الرسائل المرتبطة بولي أمر الطالب."
      />

      <div className="overflow-hidden rounded-xl border border-slate-200">
        {messages.length === 0 ? (
          <EmptyState text="لا توجد رسائل واتساب مسجلة لهذا الطالب." />
        ) : (
          <div className="divide-y divide-slate-100">
            {messages.map(
              (message) => (
                <div
                  key={message.id}
                  className="px-4 py-4"
                >
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <p className="text-sm font-semibold text-slate-700">
                        {message.content ||
                          "رسالة بدون محتوى"}
                      </p>

                      <p
                        dir="ltr"
                        className="mt-1 text-right text-xs text-slate-400"
                      >
                        {
                          message.guardianPhone
                        }
                      </p>
                    </div>

                    <span
                      className={`w-fit rounded-full px-2.5 py-1 text-[11px] font-semibold ${
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

                  <p className="mt-3 text-[11px] text-slate-400">
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
              ),
            )}
          </div>
        )}
      </div>
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
        <EmptyState text="لا يوجد نشاط مسجل لهذا الطالب." />
      ) : (
        <div className="relative space-y-3">
          {activities.map(
            (activity) => (
              <div
                key={activity.id}
                className="flex gap-3 rounded-xl border border-slate-200 bg-white p-4"
              >
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-teal-50 text-teal-600">
                  <FiClock
                    size={16}
                  />
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
                      {
                        activity.description
                      }
                    </p>
                  )}

                  {activity.createdBy && (
                    <p className="mt-2 text-[11px] text-slate-400">
                      بواسطة:{" "}
                      <span className="font-medium text-slate-600">
                        {
                          activity.createdBy
                        }
                      </span>
                    </p>
                  )}
                </div>
              </div>
            ),
          )}
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
  label,
  value,
  description,
}: {
  label: string;
  value: number | string;
  description?: string;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <p className="text-xs text-slate-400">
        {label}
      </p>

      <p className="mt-2 text-xl font-bold text-slate-800">
        {typeof value ===
        "number"
          ? value.toLocaleString(
              "ar-EG",
            )
          : value}
      </p>

      {description && (
        <p className="mt-1 text-[11px] text-slate-400">
          {description}
        </p>
      )}
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
        {value.toLocaleString(
          "ar-EG",
        )}{" "}
        ج.م
      </p>
    </div>
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

function formatDate(
  value: string,
) {
  const date = new Date(value);

  if (
    Number.isNaN(
      date.getTime(),
    )
  ) {
    return value;
  }

  return date.toLocaleDateString(
    "ar-EG",
    {
      year: "numeric",
      month: "short",
      day: "numeric",
    },
  );
}

function formatDateTime(
  value: string,
) {
  const date = new Date(value);

  if (
    Number.isNaN(
      date.getTime(),
    )
  ) {
    return value;
  }

  return date.toLocaleString(
    "ar-EG",
    {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    },
  );
}