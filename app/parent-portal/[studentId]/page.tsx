
"use client";

import Link from "next/link";
import {
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  FiAlertCircle,
  FiArrowRight,
  FiBookOpen,
  FiCalendar,
  FiCheckCircle,
  FiClock,
  FiCreditCard,
  FiDollarSign,
  FiHome,
  FiUser,
  FiUsers,
  FiXCircle,
} from "react-icons/fi";

import { attendanceService } from "@/services/attendanceService";
import { examService } from "@/services/examService";
import { groupService } from "@/services/groupService";
import { paymentService } from "@/services/paymentService";
import { studentService } from "@/services/studentService";

import type {
  AttendanceRecord,
  Exam,
  Grade,
  Group,
  Payment,
  Student,
} from "@/types";

type ParentPortalPageProps = {
  params: Promise<{
    studentId: string;
  }>;
};

type ParentTab =
  | "overview"
  | "attendance"
  | "grades"
  | "payments"
  | "schedule";

type LoadingState = {
  student: boolean;
  related: boolean;
};

const formatDate = (
  value?: string | null,
) => {
  if (!value) {
    return "غير متوفر";
  }

  const parsed = new Date(value);

  if (Number.isNaN(parsed.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("ar-EG", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(parsed);
};

const formatShortDate = (
  value?: string | null,
) => {
  if (!value) {
    return "غير متوفر";
  }

  const parsed = new Date(value);

  if (Number.isNaN(parsed.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("ar-EG", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(parsed);
};

const formatTime = (
  value?: string | null,
) => {
  if (!value) {
    return "غير محدد";
  }

  const [hours, minutes] = value
    .split(":")
    .map(Number);

  if (
    !Number.isFinite(hours) ||
    !Number.isFinite(minutes)
  ) {
    return value;
  }

  const date = new Date();

  date.setHours(
    hours,
    minutes,
    0,
    0,
  );

  return new Intl.DateTimeFormat("ar-EG", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(date);
};

const formatCurrency = (
  amount: number,
) => {
  return new Intl.NumberFormat("ar-EG", {
    style: "currency",
    currency: "EGP",
    maximumFractionDigits: 2,
  }).format(amount);
};

const attendanceStatusLabel: Record<
  AttendanceRecord["status"],
  string
> = {
  present: "حاضر",
  absent: "غائب",
  late: "متأخر",
  excused: "بعذر",
  unrecorded: "غير مسجل",
};

const attendanceStatusClass: Record<
  AttendanceRecord["status"],
  string
> = {
  present:
    "bg-emerald-50 text-emerald-700",
  absent:
    "bg-red-50 text-red-700",
  late:
    "bg-amber-50 text-amber-700",
  excused:
    "bg-blue-50 text-blue-700",
  unrecorded:
    "bg-slate-100 text-slate-600",
};

const paymentMethodLabel: Record<
  Payment["method"],
  string
> = {
  cash: "نقدي",
  bank_transfer: "تحويل بنكي",
  vodafone_cash: "فودافون كاش",
  instapay: "إنستاباي",
};

const tabs: Array<{
  id: ParentTab;
  label: string;
  icon: React.ReactNode;
}> = [
  {
    id: "overview",
    label: "الرئيسية",
    icon: <FiHome size={16} />,
  },
  {
    id: "attendance",
    label: "الحضور",
    icon: <FiCheckCircle size={16} />,
  },
  {
    id: "grades",
    label: "الدرجات",
    icon: <FiBookOpen size={16} />,
  },
  {
    id: "payments",
    label: "المصروفات",
    icon: <FiCreditCard size={16} />,
  },
  {
    id: "schedule",
    label: "الجدول",
    icon: <FiCalendar size={16} />,
  },
];

export default function ParentPortalPage({
  params,
}: ParentPortalPageProps) {
  const [studentId, setStudentId] =
    useState<string | null>(null);

  const [student, setStudent] =
    useState<Student | null>(null);

  const [attendance, setAttendance] =
    useState<AttendanceRecord[]>([]);

  const [payments, setPayments] =
    useState<Payment[]>([]);

  const [grades, setGrades] =
    useState<Grade[]>([]);

  const [exams, setExams] =
    useState<Exam[]>([]);

  const [group, setGroup] =
    useState<Group | null>(null);

  const [activeTab, setActiveTab] =
    useState<ParentTab>("overview");

  const [loading, setLoading] =
    useState<LoadingState>({
      student: true,
      related: true,
    });

  const [error, setError] =
    useState("");

  useEffect(() => {
    let mounted = true;

    const loadPortal = async () => {
      try {
        setLoading({
          student: true,
          related: true,
        });

        setError("");

        const resolvedParams =
          await params;

        if (!mounted) {
          return;
        }

        setStudentId(
          resolvedParams.studentId,
        );

        const loadedStudent =
          await studentService.getById(
            resolvedParams.studentId,
          );

        if (!mounted) {
          return;
        }

        if (!loadedStudent) {
          setStudent(null);
          setLoading({
            student: false,
            related: false,
          });
          setError(
            "تعذر العثور على بيانات الطالب.",
          );
          return;
        }

        setStudent(loadedStudent);

        setLoading((current) => ({
          ...current,
          student: false,
        }));

        const [
          loadedAttendance,
          loadedPayments,
          loadedGrades,
          loadedExams,
          loadedGroup,
        ] = await Promise.all([
          attendanceService.listByStudent(
            loadedStudent.id,
          ),
          paymentService.listByStudent(
            loadedStudent.id,
          ),
          examService.gradesByStudent(
            loadedStudent.id,
          ),
          examService.list(),
          loadedStudent.groupId
            ? groupService.getById(
                loadedStudent.groupId,
              )
            : Promise.resolve(null),
        ]);

        if (!mounted) {
          return;
        }

        setAttendance(
          loadedAttendance,
        );

        setPayments(
          loadedPayments,
        );

        setGrades(
          loadedGrades,
        );

        setExams(
          loadedExams,
        );

        setGroup(
          loadedGroup,
        );

        setLoading((current) => ({
          ...current,
          related: false,
        }));
      } catch {
        if (!mounted) {
          return;
        }

        setError(
          "حدث خطأ أثناء تحميل بيانات بوابة ولي الأمر.",
        );

        setLoading({
          student: false,
          related: false,
        });
      }
    };

    void loadPortal();

    return () => {
      mounted = false;
    };
  }, [params]);

  const gradeMap = useMemo(() => {
    return new Map(
      grades.map((grade) => [
        grade.examId,
        grade,
      ]),
    );
  }, [grades]);

  const visibleGrades = useMemo(() => {
    return exams
      .filter((exam) =>
        gradeMap.has(exam.id),
      )
      .map((exam) => ({
        exam,
        grade: gradeMap.get(exam.id)!,
      }))
      .sort((first, second) =>
        second.exam.date.localeCompare(
          first.exam.date,
        ),
      );
  }, [exams, gradeMap]);

  const recentAttendance =
    useMemo(() => {
      return [...attendance].sort((first, second) => {
        const firstDate =
          first.checkedInAt ?? "";

        const secondDate =
          second.checkedInAt ?? "";

        return secondDate.localeCompare(
          firstDate,
        );
      });
    }, [attendance]);

  const totalPaid = useMemo(
    () =>
      payments.reduce(
        (total, payment) =>
          total + payment.amount,
        0,
      ),
    [payments],
  );

  const attendanceSummary =
    useMemo(() => {
      return {
        present: attendance.filter(
          (item) =>
            item.status === "present",
        ).length,

        absent: attendance.filter(
          (item) =>
            item.status === "absent",
        ).length,

        late: attendance.filter(
          (item) =>
            item.status === "late",
        ).length,

        excused: attendance.filter(
          (item) =>
            item.status === "excused",
        ).length,
      };
    }, [attendance]);

  const averageGrade =
    useMemo(() => {
      const completedGrades =
        visibleGrades.filter(
          ({ grade }) =>
            grade.score !== null,
        );

      if (
        completedGrades.length === 0
      ) {
        return null;
      }

      const percentageTotal =
        completedGrades.reduce(
          (total, item) => {
            if (
              item.grade.score ===
              null
            ) {
              return total;
            }

            if (
              item.exam.maxScore <= 0
            ) {
              return total;
            }

            return (
              total +
              (item.grade.score /
                item.exam.maxScore) *
                100
            );
          },
          0,
        );

      return (
        percentageTotal /
        completedGrades.length
      );
    }, [visibleGrades]);

  const openTab = (
    tab: ParentTab,
  ) => {
    setActiveTab(tab);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  if (
    loading.student ||
    (studentId === null &&
      !error)
  ) {
    return (
      <ParentPortalLoading />
    );
  }

  if (error || !student) {
    return (
      <ParentPortalError
        message={
          error ||
          "تعذر تحميل بيانات الطالب."
        }
      />
    );
  }

  return (
    <main
      dir="rtl"
      className="min-h-screen bg-slate-50"
    >
      <div className="mx-auto w-full max-w-2xl px-4 pb-8 pt-4 sm:px-6 sm:pt-6">
        <header className="mb-4 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
          <div className="bg-gradient-to-br from-teal-600 to-teal-700 px-5 pb-6 pt-5 text-white sm:px-6">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-medium text-teal-100">
                  بوابة ولي الأمر
                </p>

                <h1 className="mt-1 text-xl font-bold">
                  أهلاً بك
                </h1>
              </div>

              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white/15">
                <FiUser size={20} />
              </div>
            </div>

            <div className="mt-5">
              <p className="text-xs text-teal-100">
                الطالب
              </p>

              <h2 className="mt-1 text-2xl font-bold tracking-tight">
                {student.name}
              </h2>

              <div className="mt-3 flex flex-wrap gap-2">
                <span className="rounded-full bg-white/15 px-3 py-1.5 text-xs font-medium">
                  {student.grade}
                </span>

                {group && (
                  <span className="rounded-full bg-white/15 px-3 py-1.5 text-xs font-medium">
                    {group.name}
                  </span>
                )}
              </div>
            </div>
          </div>

          <nav
            className="grid grid-cols-5 border-t border-slate-100 bg-white"
            aria-label="أقسام بوابة ولي الأمر"
          >
            {tabs.map((tab) => {
              const active =
                activeTab === tab.id;

              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() =>
                    openTab(tab.id)
                  }
                  className={`flex min-h-16 flex-col items-center justify-center gap-1.5 px-1 text-[10px] font-semibold transition ${
                    active
                      ? "text-teal-700"
                      : "text-slate-400 hover:bg-slate-50 hover:text-slate-600"
                  }`}
                  aria-current={
                    active
                      ? "page"
                      : undefined
                  }
                >
                  <span
                    className={`flex h-8 w-8 items-center justify-center rounded-xl transition ${
                      active
                        ? "bg-teal-50 text-teal-600"
                        : "bg-slate-50"
                    }`}
                  >
                    {tab.icon}
                  </span>

                  <span>
                    {tab.label}
                  </span>
                </button>
              );
            })}
          </nav>
        </header>

        {loading.related ? (
          <ParentPortalContentLoading />
        ) : (
          <>
            {activeTab ===
              "overview" && (
              <OverviewSection
                student={student}
                group={group}
                attendanceSummary={
                  attendanceSummary
                }
                averageGrade={
                  averageGrade
                }
                totalPaid={totalPaid}
                openTab={openTab}
              />
            )}

            {activeTab ===
              "attendance" && (
              <AttendanceSection
                attendance={
                  recentAttendance
                }
              />
            )}

            {activeTab === "grades" && (
              <GradesSection
                grades={visibleGrades}
              />
            )}

            {activeTab ===
              "payments" && (
              <PaymentsSection
                payments={payments}
                student={student}
              />
            )}

            {activeTab ===
              "schedule" && (
              <ScheduleSection
                group={group}
              />
            )}
          </>
        )}

        <footer className="mt-6 px-2 text-center">
          <p className="text-[11px] leading-5 text-slate-400">
            المعلومات المعروضة خاصة بالطالب
            فقط.
          </p>
        </footer>
      </div>
    </main>
  );
}

function OverviewSection({
  student,
  group,
  attendanceSummary,
  averageGrade,
  totalPaid,
  openTab,
}: {
  student: Student;
  group: Group | null;
  attendanceSummary: {
    present: number;
    absent: number;
    late: number;
    excused: number;
  };
  averageGrade: number | null;
  totalPaid: number;
  openTab: (
    tab: ParentTab,
  ) => void;
}) {
  return (
    <div className="space-y-4">
      <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-teal-50 text-teal-600">
            <FiUser size={19} />
          </div>

          <div className="min-w-0">
            <p className="text-xs font-medium text-slate-400">
              بيانات الطالب
            </p>

            <h2 className="mt-1 text-base font-bold text-slate-900">
              {student.name}
            </h2>

            <div className="mt-3 grid grid-cols-2 gap-3">
              <InfoItem
                label="الصف"
                value={student.grade}
              />

              <InfoItem
                label="المجموعة"
                value={
                  group?.name ||
                  "غير محددة"
                }
              />

              <InfoItem
                label="المادة"
                value={
                  group?.subject ||
                  "غير محددة"
                }
              />

              <InfoItem
                label="المدرس"
                value={
                  group?.teacher ||
                  "غير محدد"
                }
              />
            </div>
          </div>
        </div>
      </section>

      <section>
        <div className="mb-3 flex items-center justify-between px-1">
          <div>
            <h2 className="text-sm font-bold text-slate-900">
              ملخص الطالب
            </h2>

            <p className="mt-0.5 text-[11px] text-slate-400">
              نظرة سريعة على أهم البيانات
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <SummaryCard
            icon={
              <FiCheckCircle
                size={18}
              />
            }
            label="أيام الحضور"
            value={
              attendanceSummary.present
            }
            tone="success"
            onClick={() =>
              openTab("attendance")
            }
          />

          <SummaryCard
            icon={
              <FiBookOpen
                size={18}
              />
            }
            label="متوسط الدرجات"
            value={
              averageGrade === null
                ? "—"
                : `${Math.round(
                    averageGrade,
                  )}%`
            }
            tone="info"
            onClick={() =>
              openTab("grades")
            }
          />

          <SummaryCard
            icon={
              <FiDollarSign
                size={18}
              />
            }
            label="إجمالي المدفوع"
            value={formatCurrency(
              totalPaid,
            )}
            tone="warning"
            onClick={() =>
              openTab("payments")
            }
          />

          <SummaryCard
            icon={
              <FiCalendar
                size={18}
              />
            }
            label="الجدول"
            value="عرض الجدول"
            tone="neutral"
            onClick={() =>
              openTab("schedule")
            }
          />
        </div>
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
            <FiCalendar size={18} />
          </div>

          <div>
            <h2 className="text-sm font-bold text-slate-900">
              الجدول الدراسي
            </h2>

            <p className="mt-1 text-xs text-slate-400">
              {group
                ? `${group.name} · ${group.subject}`
                : "لا توجد مجموعة محددة"}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() =>
            openTab("schedule")
          }
          className="mt-4 flex h-10 w-full items-center justify-center rounded-xl bg-slate-50 text-xs font-semibold text-slate-700 transition hover:bg-teal-50 hover:text-teal-700"
        >
          عرض الجدول الكامل
        </button>
      </section>
    </div>
  );
}

function AttendanceSection({
  attendance,
}: {
  attendance: AttendanceRecord[];
}) {
  const summary = {
    present: attendance.filter(
      (item) =>
        item.status === "present",
    ).length,

    absent: attendance.filter(
      (item) =>
        item.status === "absent",
    ).length,

    late: attendance.filter(
      (item) =>
        item.status === "late",
    ).length,
  };

  return (
    <div className="space-y-4">
      <SectionHeader
        title="الحضور والغياب"
        description="متابعة سجل حضور الطالب."
        icon={<FiCheckCircle />}
      />

      <div className="grid grid-cols-3 gap-2">
        <MiniStat
          label="حضور"
          value={summary.present}
          className="text-emerald-700"
        />

        <MiniStat
          label="غياب"
          value={summary.absent}
          className="text-red-700"
        />

        <MiniStat
          label="تأخير"
          value={summary.late}
          className="text-amber-700"
        />
      </div>

      {attendance.length === 0 ? (
        <EmptyState
          icon={<FiCheckCircle />}
          title="لا يوجد سجل حضور"
          description="لا توجد سجلات حضور متاحة حاليًا."
        />
      ) : (
        <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
          <div className="divide-y divide-slate-100">
            {attendance.map(
              (record) => (
                <div
                  key={record.id}
                  className="p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-bold text-slate-800">
                        {formatShortDate(
                          record.checkedInAt,
                        )}
                      </p>

                      <div className="mt-2 flex flex-wrap items-center gap-3 text-[11px] text-slate-400">
                        {record.checkedInAt && (
                          <span className="inline-flex items-center gap-1">
                            <FiClock
                              size={12}
                            />
                            الدخول{" "}
                            {formatTime(
                              new Date(
                                record.checkedInAt,
                              ).toTimeString()
                                .slice(
                                  0,
                                  5,
                                ),
                            )}
                          </span>
                        )}

                        {record.checkedOutAt && (
                          <span className="inline-flex items-center gap-1">
                            <FiClock
                              size={12}
                            />
                            الانصراف{" "}
                            {formatTime(
                              new Date(
                                record.checkedOutAt,
                              ).toTimeString()
                                .slice(
                                  0,
                                  5,
                                ),
                            )}
                          </span>
                        )}
                      </div>
                    </div>

                    <span
                      className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-semibold ${attendanceStatusClass[record.status]}`}
                    >
                      {
                        attendanceStatusLabel[
                          record.status
                        ]
                      }
                    </span>
                  </div>
                </div>
              ),
            )}
          </div>
        </section>
      )}
    </div>
  );
}

function GradesSection({
  grades,
}: {
  grades: Array<{
    exam: Exam;
    grade: Grade;
  }>;
}) {
  return (
    <div className="space-y-4">
      <SectionHeader
        title="الدرجات والنتائج"
        description="نتائج الاختبارات المسجلة للطالب."
        icon={<FiBookOpen />}
      />

      {grades.length === 0 ? (
        <EmptyState
          icon={<FiBookOpen />}
          title="لا توجد نتائج"
          description="لا توجد درجات مسجلة للطالب حاليًا."
        />
      ) : (
        <div className="space-y-3">
          {grades.map(
            ({
              exam,
              grade,
            }) => {
              const percentage =
                grade.score === null ||
                exam.maxScore <= 0
                  ? null
                  : Math.round(
                      (grade.score /
                        exam.maxScore) *
                        100,
                    );

              return (
                <section
                  key={exam.id}
                  className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h3 className="text-sm font-bold text-slate-900">
                        {exam.name}
                      </h3>

                      <p className="mt-1 text-xs text-slate-400">
                        {exam.subject}
                      </p>

                      <p className="mt-2 text-[11px] text-slate-400">
                        {formatShortDate(
                          exam.date,
                        )}
                      </p>
                    </div>

                    <div className="shrink-0 text-left">
                      {grade.score ===
                      null ? (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-2.5 py-1 text-[11px] font-semibold text-amber-700">
                          <FiClock
                            size={12}
                          />
                          لم ترصد الدرجة
                        </span>
                      ) : (
                        <>
                          <p className="text-xl font-bold text-teal-700">
                            {
                              grade.score
                            }
                            <span className="mx-1 text-sm font-medium text-slate-400">
                              /
                            </span>
                            <span className="text-sm text-slate-500">
                              {
                                exam.maxScore
                              }
                            </span>
                          </p>

                          {percentage !==
                            null && (
                            <p className="mt-1 text-[11px] font-semibold text-slate-400">
                              {percentage}%
                            </p>
                          )}
                        </>
                      )}
                    </div>
                  </div>

                  {percentage !== null && (
                    <div className="mt-4">
                      <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                        <div
                          className="h-full rounded-full bg-teal-500 transition-all"
                          style={{
                            width: `${Math.min(
                              100,
                              Math.max(
                                0,
                                percentage,
                              ),
                            )}%`,
                          }}
                        />
                      </div>
                    </div>
                  )}
                </section>
              );
            },
          )}
        </div>
      )}
    </div>
  );
}

function PaymentsSection({
  payments,
  student,
}: {
  payments: Payment[];
  student: Student;
}) {
  return (
    <div className="space-y-4">
      <SectionHeader
        title="المصروفات"
        description="متابعة حالة المصروفات والمدفوعات."
        icon={<FiCreditCard />}
      />

      <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="grid grid-cols-3 gap-2">
          <FinanceCard
            label="المطلوب"
            value={formatCurrency(
              student.financial
                .totalRequired,
            )}
          />

          <FinanceCard
            label="المدفوع"
            value={formatCurrency(
              student.financial.paid,
            )}
          />

          <FinanceCard
            label="المتبقي"
            value={formatCurrency(
              student.financial.remaining,
            )}
            emphasize
          />
        </div>
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 px-5 py-4">
          <h2 className="text-sm font-bold text-slate-900">
            سجل المدفوعات
          </h2>

          <p className="mt-1 text-[11px] text-slate-400">
            جميع المدفوعات الخاصة بالطالب.
          </p>
        </div>

        {payments.length === 0 ? (
          <EmptyState
            icon={<FiCreditCard />}
            title="لا توجد مدفوعات"
            description="لا توجد عمليات دفع مسجلة حاليًا."
          />
        ) : (
          <div className="divide-y divide-slate-100">
            {payments.map(
              (payment) => (
                <div
                  key={payment.id}
                  className="flex items-center justify-between gap-3 px-5 py-4"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-slate-800">
                      {formatCurrency(
                        payment.amount,
                      )}
                    </p>

                    <div className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-[11px] text-slate-400">
                      <span>
                        {
                          paymentMethodLabel[
                            payment.method
                          ]
                        }
                      </span>

                      <span>
                        {formatShortDate(
                          payment.paidAt,
                        )}
                      </span>
                    </div>
                  </div>

                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                    <FiCheckCircle
                      size={17}
                    />
                  </div>
                </div>
              ),
            )}
          </div>
        )}
      </section>
    </div>
  );
}

function ScheduleSection({
  group,
}: {
  group: Group | null;
}) {
  if (!group) {
    return (
      <div className="space-y-4">
        <SectionHeader
          title="الجدول الدراسي"
          description="مواعيد الحصص الخاصة بالطالب."
          icon={<FiCalendar />}
        />

        <EmptyState
          icon={<FiCalendar />}
          title="لا يوجد جدول"
          description="لم يتم ربط الطالب بمجموعة دراسية حتى الآن."
        />
      </div>
    );
  }

  const schedule = [
    ...group.schedule,
  ];

  return (
    <div className="space-y-4">
      <SectionHeader
        title="الجدول الدراسي"
        description="مواعيد الحصص الخاصة بالمجموعة."
        icon={<FiCalendar />}
      />

      <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-teal-50 text-teal-600">
            <FiUsers size={19} />
          </div>

          <div>
            <h2 className="text-sm font-bold text-slate-900">
              {group.name}
            </h2>

            <p className="mt-1 text-xs text-slate-400">
              {group.subject} ·{" "}
              {group.teacher}
            </p>
          </div>
        </div>
      </section>

      {schedule.length === 0 ? (
        <EmptyState
          icon={<FiCalendar />}
          title="لا توجد مواعيد"
          description="لم يتم تحديد مواعيد لهذه المجموعة."
        />
      ) : (
        <section className="space-y-3">
          {schedule.map(
            (item, index) => (
              <div
                key={`${item.day}-${item.startTime}-${index}`}
                className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-slate-100 text-slate-600">
                      <FiCalendar
                        size={18}
                      />
                    </div>

                    <div>
                      <h3 className="text-sm font-bold text-slate-900">
                        {item.day}
                      </h3>

                      <p className="mt-1 text-xs text-slate-400">
                        {group.subject}
                      </p>
                    </div>
                  </div>

                  <div className="text-left">
                    <p className="text-sm font-bold text-teal-700">
                      {formatTime(
                        item.startTime,
                      )}
                    </p>

                    {item.endTime && (
                      <p className="mt-1 text-[11px] text-slate-400">
                        حتى{" "}
                        {formatTime(
                          item.endTime,
                        )}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ),
          )}
        </section>
      )}
    </div>
  );
}

function SectionHeader({
  title,
  description,
  icon,
}: {
  title: string;
  description: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-3 px-1">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-teal-50 text-teal-600">
        {icon}
      </div>

      <div>
        <h2 className="text-base font-bold text-slate-900">
          {title}
        </h2>

        <p className="mt-0.5 text-[11px] text-slate-400">
          {description}
        </p>
      </div>
    </div>
  );
}

function InfoItem({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl bg-slate-50 px-3 py-2.5">
      <p className="text-[10px] font-medium text-slate-400">
        {label}
      </p>

      <p className="mt-1 truncate text-xs font-semibold text-slate-700">
        {value}
      </p>
    </div>
  );
}

function SummaryCard({
  icon,
  label,
  value,
  tone,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  tone:
    | "success"
    | "info"
    | "warning"
    | "neutral";
  onClick: () => void;
}) {
  const toneClass = {
    success:
      "bg-emerald-50 text-emerald-600",
    info: "bg-blue-50 text-blue-600",
    warning:
      "bg-amber-50 text-amber-600",
    neutral:
      "bg-slate-100 text-slate-600",
  }[tone];

  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded-2xl border border-slate-200 bg-white p-4 text-right shadow-sm transition hover:-translate-y-0.5 hover:border-teal-200 hover:shadow-md active:translate-y-0"
    >
      <div
        className={`flex h-9 w-9 items-center justify-center rounded-xl ${toneClass}`}
      >
        {icon}
      </div>

      <p className="mt-3 text-[11px] font-medium text-slate-400">
        {label}
      </p>

      <p className="mt-1 text-sm font-bold text-slate-800">
        {value}
      </p>
    </button>
  );
}

function MiniStat({
  label,
  value,
  className,
}: {
  label: string;
  value: number;
  className: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-3 text-center shadow-sm">
      <p
        className={`text-lg font-bold ${className}`}
      >
        {value}
      </p>

      <p className="mt-1 text-[10px] font-medium text-slate-400">
        {label}
      </p>
    </div>
  );
}

function FinanceCard({
  label,
  value,
  emphasize = false,
}: {
  label: string;
  value: string;
  emphasize?: boolean;
}) {
  return (
    <div
      className={`rounded-2xl p-3 text-center ${
        emphasize
          ? "bg-amber-50"
          : "bg-slate-50"
      }`}
    >
      <p className="text-[10px] font-medium text-slate-400">
        {label}
      </p>

      <p
        className={`mt-1 text-xs font-bold ${
          emphasize
            ? "text-amber-700"
            : "text-slate-700"
        }`}
      >
        {value}
      </p>
    </div>
  );
}

function EmptyState({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white px-5 py-12 text-center shadow-sm">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
        {icon}
      </div>

      <h3 className="mt-4 text-sm font-bold text-slate-800">
        {title}
      </h3>

      <p className="mx-auto mt-1 max-w-xs text-xs leading-5 text-slate-400">
        {description}
      </p>
    </div>
  );
}

function ParentPortalLoading() {
  return (
    <main
      dir="rtl"
      className="min-h-screen bg-slate-50"
    >
      <div className="mx-auto w-full max-w-2xl px-4 pb-8 pt-4 sm:px-6 sm:pt-6">
        <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
          <div className="animate-pulse bg-slate-200 px-5 pb-8 pt-6">
            <div className="h-3 w-24 rounded-full bg-slate-300" />

            <div className="mt-3 h-7 w-40 rounded-lg bg-slate-300" />

            <div className="mt-5 h-8 w-48 rounded-lg bg-slate-300" />
          </div>

          <div className="grid grid-cols-5 gap-2 p-3">
            {Array.from({
              length: 5,
            }).map((_, index) => (
              <div
                key={index}
                className="flex flex-col items-center gap-2 py-2"
              >
                <div className="h-8 w-8 animate-pulse rounded-xl bg-slate-100" />

                <div className="h-2.5 w-10 animate-pulse rounded-full bg-slate-100" />
              </div>
            ))}
          </div>
        </div>

        <ParentPortalContentLoading />
      </div>
    </main>
  );
}

function ParentPortalContentLoading() {
  return (
    <div className="mt-4 space-y-4">
      <div className="h-40 animate-pulse rounded-3xl border border-slate-200 bg-white" />

      <div className="grid grid-cols-2 gap-3">
        <div className="h-28 animate-pulse rounded-2xl border border-slate-200 bg-white" />
        <div className="h-28 animate-pulse rounded-2xl border border-slate-200 bg-white" />
        <div className="h-28 animate-pulse rounded-2xl border border-slate-200 bg-white" />
        <div className="h-28 animate-pulse rounded-2xl border border-slate-200 bg-white" />
      </div>

      <div className="h-32 animate-pulse rounded-3xl border border-slate-200 bg-white" />
    </div>
  );
}

function ParentPortalError({
  message,
}: {
  message: string;
}) {
  return (
    <main
      dir="rtl"
      className="flex min-h-screen items-center justify-center bg-slate-50 px-4"
    >
      <section className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-6 text-center shadow-sm">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 text-red-500">
          <FiAlertCircle
            size={23}
          />
        </div>

        <h1 className="mt-4 text-base font-bold text-slate-900">
          تعذر تحميل البيانات
        </h1>

        <p className="mt-2 text-xs leading-5 text-slate-500">
          {message}
        </p>

        <Link
          href="/"
          className="mt-5 inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-teal-600 px-5 text-xs font-semibold text-white transition hover:bg-teal-700"
        >
          <FiArrowRight
            size={15}
          />
          العودة
        </Link>
      </section>
    </main>
  );
}
