"use client";

import {
  useMemo,
  useState,
} from "react";

import {
  FiArrowRight,
  FiCalendar,
  FiCheckCircle,
  FiClock,
  FiEdit2,
  FiMessageCircle,
  FiPhone,
  FiUser,
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

type StudentProfileProps = {
  student: Student;
  payments: Payment[];
  grades: Grade[];
  attendance: AttendanceRecord[];
  messages: WhatsAppMessage[];
  activities: StudentActivity[];
  exams: {
    id: string;
    name: string;
    subject: string;
    maxScore: number;
    date: string;
  }[];
  onEdit: (student: Student) => void;
};

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

const attendanceLabels: Record<
  AttendanceRecord["status"],
  string
> = {
  present: "حاضر",
  absent: "غائب",
  late: "متأخر",
  excused: "بعذر",
  unrecorded: "غير مسجل",
};

const paymentMethodLabels: Record<
  Payment["method"],
  string
> = {
  cash: "نقدي",
  bank_transfer: "تحويل بنكي",
  vodafone_cash: "فودافون كاش",
  instapay: "إنستاباي",
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

const messageTypeLabels: Record<
  WhatsAppMessage["type"],
  string
> = {
  individual: "فردية",
  group: "مجموعة",
  notification: "إشعار",
  reminder: "تذكير",
};

const activityTypeIcons: Record<
  StudentActivity["type"],
  React.ReactNode
> = {
  created: <FiUser size={15} />,
  updated: <FiEdit2 size={15} />,
  payment: <FiCheckCircle size={15} />,
  attendance: <FiClock size={15} />,
  grade: <FiCalendar size={15} />,
  message: <FiMessageCircle size={15} />,
  group: <FiUser size={15} />,

  student_created: <FiUser size={15} />,
  student_updated: <FiEdit2 size={15} />,
  payment_recorded: <FiCheckCircle size={15} />,
  attendance_recorded: <FiClock size={15} />,
  grade_updated: <FiCalendar size={15} />,
  message_sent: <FiMessageCircle size={15} />,
};

const tabs = [
  {
    id: "overview",
    label: "نظرة عامة",
  },
  {
    id: "finance",
    label: "الرسوم والمدفوعات",
  },
  {
    id: "grades",
    label: "الدرجات",
  },
  {
    id: "attendance",
    label: "الحضور والغياب",
  },
  {
    id: "messages",
    label: "WhatsApp",
  },
  {
    id: "activity",
    label: "سجل النشاط",
  },
] as const;

type TabId = (typeof tabs)[number]["id"];

export default function StudentProfile({
  student,
  payments,
  grades,
  attendance,
  messages,
  activities,
  exams,
  onEdit,
}: StudentProfileProps) {
  const [activeTab, setActiveTab] =
    useState<TabId>("overview");

  const initials = student.name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((word) => word.charAt(0))
    .join("");

  const groupName = student.groupId
    ? groupNames[student.groupId] ??
      "غير محددة"
    : "غير محددة";

  const statusLabel =
    statusLabels[student.status];

  const attendanceStats = useMemo(() => {
    const present = attendance.filter(
      (item) => item.status === "present",
    ).length;

    const absent = attendance.filter(
      (item) => item.status === "absent",
    ).length;

    const late = attendance.filter(
      (item) => item.status === "late",
    ).length;

    const excused = attendance.filter(
      (item) => item.status === "excused",
    ).length;

    const recorded = attendance.filter(
      (item) =>
        item.status !== "unrecorded",
    ).length;

    const percentage =
      recorded > 0
        ? Math.round(
            (present / recorded) * 100,
          )
        : 0;

    return {
      present,
      absent,
      late,
      excused,
      recorded,
      percentage,
    };
  }, [attendance]);

  const gradesWithExams = useMemo(
    () =>
      grades.map((grade) => ({
        ...grade,
        exam: exams.find(
          (exam) =>
            exam.id === grade.examId,
        ),
      })),
    [grades, exams],
  );

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

  const paymentPercentage =
    student.financial.totalRequired > 0
      ? Math.min(
          100,
          Math.round(
            (student.financial.paid /
              student.financial
                .totalRequired) *
              100,
          ),
        )
      : 100;

  return (
    <main
      dir="rtl"
      className="min-h-screen bg-slate-50"
    >
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="mb-5 flex items-center gap-2 text-xs text-slate-400">
          <a
            href="/students"
            className="transition hover:text-teal-600"
          >
            الطلاب
          </a>

          <span>/</span>

          <span className="text-slate-600">
            ملف الطالب
          </span>
        </div>

        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="p-5 sm:p-6">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex min-w-0 items-center gap-4">
                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-teal-50 text-lg font-bold text-teal-700">
                  {initials || (
                    <FiUser size={24} />
                  )}
                </div>

                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h1 className="text-xl font-bold text-slate-900 sm:text-2xl">
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
                      {statusLabel}
                    </span>
                  </div>

                  <p className="mt-1 text-xs text-slate-400">
                    رقم الطالب:{" "}
                    {student.studentId}
                  </p>

                  <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-slate-500">
                    <span>
                      المرحلة:{" "}
                      <strong className="text-slate-700">
                        {student.grade}
                      </strong>
                    </span>

                    <span>
                      المجموعة:{" "}
                      <strong className="text-slate-700">
                        {groupName}
                      </strong>
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() =>
                    window.history.back()
                  }
                  className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
                >
                  <FiArrowRight size={16} />
                  العودة للطلاب
                </button>

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
                  WhatsApp
                </button>

                <button
                  type="button"
                  onClick={() =>
                    onEdit(student)
                  }
                  className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-teal-600 px-4 text-sm font-semibold text-white transition hover:bg-teal-700 active:scale-[0.98]"
                >
                  <FiEdit2 size={15} />
                  تعديل البيانات
                </button>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto border-t border-slate-100">
            <div className="flex min-w-max px-3 sm:px-5">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() =>
                    setActiveTab(tab.id)
                  }
                  className={`relative px-4 py-4 text-xs font-semibold transition ${
                    activeTab === tab.id
                      ? "text-teal-700"
                      : "text-slate-400 hover:text-slate-700"
                  }`}
                >
                  {tab.label}

                  {activeTab ===
                    tab.id && (
                    <span className="absolute inset-x-3 bottom-0 h-0.5 rounded-full bg-teal-600" />
                  )}
                </button>
              ))}
            </div>
          </div>
        </section>

        {activeTab === "overview" && (
          <OverviewSection
            student={student}
            groupName={groupName}
            attendanceStats={
              attendanceStats
            }
            paymentPercentage={
              paymentPercentage
            }
          />
        )}

        {activeTab === "finance" && (
          <FinanceSection
            student={student}
            payments={payments}
          />
        )}

        {activeTab === "grades" && (
          <GradesSection
            grades={gradesWithExams}
          />
        )}

        {activeTab === "attendance" && (
          <AttendanceSection
            attendance={attendance}
            stats={attendanceStats}
          />
        )}

        {activeTab === "messages" && (
          <MessagesSection
            messages={messages}
          />
        )}

        {activeTab === "activity" && (
          <ActivitySection
            activities={activities}
          />
        )}
      </div>
    </main>
  );
}

function OverviewSection({
  student,
  groupName,
  attendanceStats,
  paymentPercentage,
}: {
  student: Student;
  groupName: string;
  attendanceStats: {
    present: number;
    absent: number;
    late: number;
    excused: number;
    recorded: number;
    percentage: number;
  };
  paymentPercentage: number;
}) {
  return (
    <div className="mt-5 space-y-5">
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="نسبة الحضور"
          value={`${attendanceStats.percentage}%`}
          description={`${attendanceStats.present} حضور`}
          className="text-emerald-600"
        />

        <StatCard
          label="الغياب"
          value={attendanceStats.absent}
          description="حالات غياب مسجلة"
          className="text-amber-600"
        />

        <StatCard
          label="المدفوع"
          value={`${student.financial.paid.toLocaleString(
            "ar-EG",
          )} ج.م`}
          description={`${paymentPercentage}% من المطلوب`}
          className="text-teal-600"
        />

        <StatCard
          label="المتبقي"
          value={`${student.financial.remaining.toLocaleString(
            "ar-EG",
          )} ج.م`}
          description="المستحق الحالي"
          className={
            student.financial
              .remaining > 0
              ? "text-amber-600"
              : "text-emerald-600"
          }
        />
      </section>

      <section className="grid gap-5 lg:grid-cols-2">
        <Panel
          title="البيانات الأساسية"
          description="المعلومات الشخصية وبيانات التواصل"
        >
          <div className="grid gap-3 sm:grid-cols-2">
            <Detail
              label="اسم الطالب"
              value={student.name}
            />

            <Detail
              label="رقم الطالب"
              value={student.studentId}
              direction="ltr"
            />

            <Detail
              label="المرحلة"
              value={student.grade}
            />

            <Detail
              label="المجموعة"
              value={groupName}
            />

            <Detail
              label="هاتف الطالب"
              value={
                student.phone ||
                "غير مسجل"
              }
              direction="ltr"
            />

            <Detail
              label="اسم ولي الأمر"
              value={student.guardianName}
            />

            <Detail
              label="هاتف ولي الأمر"
              value={
                student.guardianPhone ||
                "غير مسجل"
              }
              direction="ltr"
            />

            <Detail
              label="العنوان"
              value={
                student.address ||
                "غير مسجل"
              }
            />
          </div>
        </Panel>

        <Panel
          title="الملخص المالي"
          description="الحالة الحالية للرسوم والمدفوعات"
        >
          <div className="grid gap-3 sm:grid-cols-3">
            <MiniFinance
              label="المطلوب"
              value={
                student.financial
                  .totalRequired
              }
            />

            <MiniFinance
              label="المدفوع"
              value={
                student.financial.paid
              }
              positive
            />

            <MiniFinance
              label="المتبقي"
              value={
                student.financial.remaining
              }
              warning={
                student.financial
                  .remaining > 0
              }
            />
          </div>

          <div className="mt-5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400">
                نسبة السداد
              </span>

              <span className="font-semibold text-slate-700">
                {paymentPercentage}%
              </span>
            </div>

            <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full rounded-full bg-teal-500 transition-all"
                style={{
                  width: `${paymentPercentage}%`,
                }}
              />
            </div>
          </div>
        </Panel>
      </section>

      {student.notes && (
        <Panel
          title="الملاحظات"
          description="ملاحظات إضافية عن الطالب"
        >
          <p className="whitespace-pre-wrap text-sm leading-7 text-slate-600">
            {student.notes}
          </p>
        </Panel>
      )}

      {student.customFields.length >
        0 && (
        <Panel
          title="البيانات الإضافية"
          description="الحقول المخصصة المسجلة للطالب"
        >
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {student.customFields.map(
              (field) => (
                <Detail
                  key={field.fieldId}
                  label={field.fieldId}
                  value={
                    field.value ===
                    null
                      ? "غير مسجل"
                      : String(
                          field.value,
                        )
                  }
                />
              ),
            )}
          </div>
        </Panel>
      )}
    </div>
  );
}

function FinanceSection({
  student,
  payments,
}: {
  student: Student;
  payments: Payment[];
}) {
  return (
    <div className="mt-5 space-y-5">
      <section className="grid gap-4 sm:grid-cols-3">
        <StatCard
          label="إجمالي المطلوب"
          value={`${student.financial.totalRequired.toLocaleString(
            "ar-EG",
          )} ج.م`}
        />

        <StatCard
          label="إجمالي المدفوع"
          value={`${student.financial.paid.toLocaleString(
            "ar-EG",
          )} ج.م`}
          className="text-emerald-600"
        />

        <StatCard
          label="المتبقي"
          value={`${student.financial.remaining.toLocaleString(
            "ar-EG",
          )} ج.م`}
          className={
            student.financial
              .remaining > 0
              ? "text-amber-600"
              : "text-emerald-600"
          }
        />
      </section>

      <Panel
        title="سجل المدفوعات"
        description="جميع الدفعات المسجلة للطالب"
      >
        {payments.length === 0 ? (
          <EmptyState text="لا توجد دفعات مسجلة حتى الآن." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[650px] text-right">
              <thead>
                <tr className="border-b border-slate-100">
                  <TableHead>
                    التاريخ
                  </TableHead>
                  <TableHead>
                    المبلغ
                  </TableHead>
                  <TableHead>
                    طريقة الدفع
                  </TableHead>
                  <TableHead>
                    ملاحظات
                  </TableHead>
                </tr>
              </thead>

              <tbody>
                {payments.map(
                  (payment) => (
                    <tr
                      key={payment.id}
                      className="border-b border-slate-50 last:border-0"
                    >
                      <TableCell>
                        {formatDate(
                          payment.paidAt,
                        )}
                      </TableCell>

                      <TableCell>
                        <span className="font-semibold text-emerald-600">
                          {payment.amount.toLocaleString(
                            "ar-EG",
                          )}{" "}
                          ج.م
                        </span>
                      </TableCell>

                      <TableCell>
                        {
                          paymentMethodLabels[
                            payment.method
                          ]
                        }
                      </TableCell>

                      <TableCell>
                        {payment.notes ||
                          "—"}
                      </TableCell>
                    </tr>
                  ),
                )}
              </tbody>
            </table>
          </div>
        )}
      </Panel>
    </div>
  );
}

function GradesSection({
  grades,
}: {
  grades: Array<
    Grade & {
      exam?: {
        id: string;
        name: string;
        subject: string;
        maxScore: number;
        date: string;
      };
    }
  >;
}) {
  const approvedGrades =
    grades.filter(
      (grade) =>
        grade.score !== null &&
        grade.exam,
    );

  const average =
    approvedGrades.length > 0
      ? Math.round(
          approvedGrades.reduce(
            (total, grade) =>
              total +
              ((grade.score ?? 0) /
                (grade.exam
                  ?.maxScore || 1)) *
                100,
            0,
          ) /
            approvedGrades.length,
        )
      : 0;

  return (
    <div className="mt-5 space-y-5">
      <section className="grid gap-4 sm:grid-cols-3">
        <StatCard
          label="الاختبارات"
          value={grades.length}
          description="اختبارات مسجلة"
        />

        <StatCard
          label="متوسط الأداء"
          value={`${average}%`}
          description="للاختبارات التي لها نتيجة"
          className="text-teal-600"
        />

        <StatCard
          label="نتائج معتمدة"
          value={
            grades.filter(
              (grade) =>
                grade.status ===
                "approved",
            ).length
          }
          description="نتائج تم اعتمادها"
          className="text-emerald-600"
        />
      </section>

      <Panel
        title="الدرجات والاختبارات"
        description="نتائج الطالب في الاختبارات المسجلة"
      >
        {grades.length === 0 ? (
          <EmptyState text="لا توجد نتائج اختبارات مسجلة." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[700px] text-right">
              <thead>
                <tr className="border-b border-slate-100">
                  <TableHead>
                    الاختبار
                  </TableHead>
                  <TableHead>
                    المادة
                  </TableHead>
                  <TableHead>
                    التاريخ
                  </TableHead>
                  <TableHead>
                    الدرجة
                  </TableHead>
                  <TableHead>
                    الحالة
                  </TableHead>
                </tr>
              </thead>

              <tbody>
                {grades.map(
                  (grade) => {
                    const percentage =
                      grade.exam &&
                      grade.score !==
                        null
                        ? Math.round(
                            (grade.score /
                              grade.exam
                                .maxScore) *
                              100,
                          )
                        : null;

                    return (
                      <tr
                        key={
                          grade.id
                        }
                        className="border-b border-slate-50 last:border-0"
                      >
                        <TableCell>
                          {grade.exam
                            ?.name ||
                            "اختبار غير معروف"}
                        </TableCell>

                        <TableCell>
                          {grade.exam
                            ?.subject ||
                            "—"}
                        </TableCell>

                        <TableCell>
                          {grade.exam
                            ? formatDate(
                                grade
                                  .exam
                                  .date,
                              )
                            : "—"}
                        </TableCell>

                        <TableCell>
                          {grade.score ===
                          null ? (
                            <span className="text-slate-400">
                              لم ترصد
                            </span>
                          ) : (
                            <span className="font-semibold text-slate-700">
                              {
                                grade.score
                              }{" "}
                              /{" "}
                              {
                                grade.exam
                                  ?.maxScore
                              }{" "}
                              <span className="text-xs text-slate-400">
                                ({percentage}%)
                              </span>
                            </span>
                          )}
                        </TableCell>

                        <TableCell>
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
                              ? "معتمدة"
                              : "معلقة"}
                          </span>
                        </TableCell>
                      </tr>
                    );
                  },
                )}
              </tbody>
            </table>
          </div>
        )}
      </Panel>
    </div>
  );
}

function AttendanceSection({
  attendance,
  stats,
}: {
  attendance: AttendanceRecord[];
  stats: {
    present: number;
    absent: number;
    late: number;
    excused: number;
    recorded: number;
    percentage: number;
  };
}) {
  return (
    <div className="mt-5 space-y-5">
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <StatCard
          label="الحضور"
          value={stats.present}
          className="text-emerald-600"
        />

        <StatCard
          label="الغياب"
          value={stats.absent}
          className="text-amber-600"
        />

        <StatCard
          label="التأخير"
          value={stats.late}
        />

        <StatCard
          label="بعذر"
          value={stats.excused}
        />

        <StatCard
          label="نسبة الحضور"
          value={`${stats.percentage}%`}
          className="text-teal-600"
        />
      </section>

      <Panel
        title="سجل الحضور والغياب"
        description="تفاصيل حضور الطالب في الحصص"
      >
        {attendance.length === 0 ? (
          <EmptyState text="لا توجد سجلات حضور حتى الآن." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[750px] text-right">
              <thead>
                <tr className="border-b border-slate-100">
                  <TableHead>
                    الحصة
                  </TableHead>
                  <TableHead>
                    الحالة
                  </TableHead>
                  <TableHead>
                    الدخول
                  </TableHead>
                  <TableHead>
                    الخروج
                  </TableHead>
                  <TableHead>
                    الموقع
                  </TableHead>
                </tr>
              </thead>

              <tbody>
                {attendance.map(
                  (record) => (
                    <tr
                      key={record.id}
                      className="border-b border-slate-50 last:border-0"
                    >
                      <TableCell>
                        {record.lessonId}
                      </TableCell>

                      <TableCell>
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold ${attendanceStatusClass(
                            record.status,
                          )}`}
                        >
                          {record.status ===
                          "present" ? (
                            <FiCheckCircle
                              size={12}
                            />
                          ) : record.status ===
                            "absent" ? (
                            <FiXCircle
                              size={12}
                            />
                          ) : (
                            <FiClock
                              size={12}
                            />
                          )}

                          {
                            attendanceLabels[
                              record.status
                            ]
                          }
                        </span>
                      </TableCell>

                      <TableCell>
                        {record.checkedInAt
                          ? formatDateTime(
                              record.checkedInAt,
                            )
                          : "—"}
                      </TableCell>

                      <TableCell>
                        {record.checkedOutAt
                          ? formatDateTime(
                              record.checkedOutAt,
                            )
                          : "—"}
                      </TableCell>

                      <TableCell>
                        {record.locationStatus ===
                        "allowed"
                          ? "داخل النطاق"
                          : record.locationStatus ===
                            "outside"
                          ? "خارج النطاق"
                          : "غير معروف"}
                      </TableCell>
                    </tr>
                  ),
                )}
              </tbody>
            </table>
          </div>
        )}
      </Panel>
    </div>
  );
}

function MessagesSection({
  messages,
}: {
  messages: WhatsAppMessage[];
}) {
  return (
    <div className="mt-5">
      <Panel
        title="رسائل WhatsApp"
        description="سجل الرسائل المرسلة والمجدولة لولي الأمر"
      >
        {messages.length === 0 ? (
          <EmptyState text="لا توجد رسائل مسجلة." />
        ) : (
          <div className="space-y-3">
            {messages.map(
              (message) => (
                <div
                  key={message.id}
                  className="rounded-xl border border-slate-200 bg-slate-50/60 p-4"
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="rounded-md bg-white px-2 py-1 text-[10px] font-semibold text-slate-500">
                          {
                            messageTypeLabels[
                              message.type
                            ]
                          }
                        </span>

                        <span
                          className={`rounded-full px-2 py-1 text-[10px] font-semibold ${
                            message.status ===
                            "sent"
                              ? "bg-emerald-50 text-emerald-700"
                              : message.status ===
                                  "failed"
                                ? "bg-red-50 text-red-600"
                                : "bg-amber-50 text-amber-700"
                          }`}
                        >
                          {
                            messageStatusLabels[
                              message.status
                            ]
                          }
                        </span>
                      </div>

                      <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-slate-600">
                        {message.content ||
                          "لا يوجد محتوى للرسالة."}
                      </p>
                    </div>

                    <div className="shrink-0 text-xs text-slate-400 sm:text-left">
                      {formatDateTime(
                        message.sentAt ||
                          message.createdAt,
                      )}
                    </div>
                  </div>

                  {message.error && (
                    <div className="mt-3 rounded-lg border border-red-100 bg-red-50 px-3 py-2 text-xs text-red-600">
                      {message.error}
                    </div>
                  )}
                </div>
              ),
            )}
          </div>
        )}
      </Panel>
    </div>
  );
}

function ActivitySection({
  activities,
}: {
  activities: StudentActivity[];
}) {
  return (
    <div className="mt-5">
      <Panel
        title="سجل النشاط والتعديلات"
        description="تسلسل زمني لأهم العمليات التي تمت على ملف الطالب"
      >
        {activities.length === 0 ? (
          <EmptyState text="لا يوجد نشاط مسجل لهذا الطالب." />
        ) : (
          <div className="relative space-y-4">
            {activities.map(
              (activity, index) => (
                <div
                  key={activity.id}
                  className="relative flex gap-3"
                >
                  {index <
                    activities.length -
                      1 && (
                    <span className="absolute right-[15px] top-9 h-[calc(100%+16px)] w-px bg-slate-200" />
                  )}

                  <div className="relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-teal-50 text-teal-600">
                    {
                      activityTypeIcons[
                        activity.type
                      ]
                    }
                  </div>

                  <div className="min-w-0 flex-1 rounded-xl border border-slate-100 bg-slate-50/60 p-3">
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
                      <p className="mt-1 text-xs leading-5 text-slate-400">
                        {
                          activity.description
                        }
                      </p>
                    )}
                  </div>
                </div>
              ),
            )}
          </div>
        )}
      </Panel>
    </div>
  );
}

function Panel({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-100 px-5 py-4 sm:px-6">
        <h2 className="text-sm font-bold text-slate-800">
          {title}
        </h2>

        <p className="mt-1 text-xs text-slate-400">
          {description}
        </p>
      </div>

      <div className="p-5 sm:p-6">
        {children}
      </div>
    </section>
  );
}

function StatCard({
  label,
  value,
  description,
  className = "text-slate-900",
}: {
  label: string;
  value: number | string;
  description?: string;
  className?: string;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <p className="text-xs text-slate-400">
        {label}
      </p>

      <p
        className={`mt-2 text-xl font-bold ${className}`}
      >
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

function Detail({
  label,
  value,
  direction = "rtl",
}: {
  label: string;
  value: string;
  direction?: "rtl" | "ltr";
}) {
  return (
    <div className="rounded-xl border border-slate-100 bg-slate-50/60 p-3">
      <p className="text-[11px] text-slate-400">
        {label}
      </p>

      <p
        dir={direction}
        className="mt-1 text-sm font-semibold text-slate-700"
      >
        {value}
      </p>
    </div>
  );
}

function MiniFinance({
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
    <div className="rounded-xl border border-slate-100 bg-slate-50/60 p-3">
      <p className="text-[11px] text-slate-400">
        {label}
      </p>

      <p
        className={`mt-1 text-base font-bold ${
          warning
            ? "text-amber-600"
            : positive
              ? "text-emerald-600"
              : "text-slate-700"
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

function TableHead({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <th className="px-4 py-3 text-xs font-semibold text-slate-400">
      {children}
    </th>
  );
}

function TableCell({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <td className="px-4 py-3 text-xs text-slate-600">
      {children}
    </td>
  );
}

function EmptyState({
  text,
}: {
  text: string;
}) {
  return (
    <div className="flex min-h-32 items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50/50 px-4 text-center text-sm text-slate-400">
      {text}
    </div>
  );
}

function attendanceStatusClass(
  status: AttendanceRecord["status"],
) {
  switch (status) {
    case "present":
      return "bg-emerald-50 text-emerald-700";

    case "absent":
      return "bg-red-50 text-red-600";

    case "late":
      return "bg-amber-50 text-amber-700";

    case "excused":
      return "bg-blue-50 text-blue-700";

    default:
      return "bg-slate-100 text-slate-500";
  }
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat(
    "ar-EG",
    {
      year: "numeric",
      month: "short",
      day: "numeric",
    },
  ).format(new Date(value));
}

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat(
    "ar-EG",
    {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    },
  ).format(new Date(value));
}