
"use client";

import {
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  FiBarChart2,
  FiBookOpen,
  FiCalendar,
  FiCheckCircle,
  FiChevronDown,
  FiClock,
  FiDollarSign,
  FiDownload,
  FiFileText,
  FiUsers,
} from "react-icons/fi";

import { useAppSettings } from "@/components/providers";

import { attendanceService } from "@/services/attendanceService";
import { examService } from "@/services/examService";
import { groupService } from "@/services/groupService";
import { lessonService } from "@/services/lessonService";
import { paymentService } from "@/services/paymentService";
import { studentService } from "@/services/studentService";

import type {
  AttendanceRecord,
  Exam,
  Grade,
  Group,
  Lesson,
  ModuleKey,
  Payment,
  Student,
} from "@/types";

type ReportType =
  | "students"
  | "attendance"
  | "payments"
  | "groups"
  | "exams";

type ReportCard = {
  type: ReportType;
  title: string;
  description: string;
  icon: ReactNode;
  module: ModuleKey;
};

type ReportRow = {
  label: string;
  value: string;
};

type ReportsData = {
  students: Student[];
  attendance: AttendanceRecord[];
  payments: Payment[];
  groups: Group[];
  lessons: Lesson[];
  exams: Exam[];
  grades: Grade[];
  loading: boolean;
};

type ReportChartBar = {
  label: string;
  value: number;
};

const reportCards: ReportCard[] = [
  {
    type: "students",
    title: "تقرير الطلاب",
    description:
      "ملخص بيانات الطلاب وحالتهم داخل المركز.",
    icon: <FiUsers size={19} />,
    module: "students",
  },
  {
    type: "attendance",
    title: "تقرير الحضور",
    description:
      "متابعة الحضور والغياب ونسب الالتزام.",
    icon: <FiCheckCircle size={19} />,
    module: "attendance",
  },
  {
    type: "payments",
    title: "التقرير المالي",
    description:
      "المدفوعات والمبالغ المحصلة والديون.",
    icon: <FiDollarSign size={19} />,
    module: "payments",
  },
  {
    type: "groups",
    title: "تقرير المجموعات",
    description:
      "ملخص المجموعات والطلاب والحصص.",
    icon: <FiBookOpen size={19} />,
    module: "groups",
  },
  {
    type: "exams",
    title: "تقرير الامتحانات",
    description:
      "نتائج الامتحانات ومتوسطات الطلاب.",
    icon: <FiFileText size={19} />,
    module: "exams",
  },
];

const emptyReportsData: ReportsData = {
  students: [],
  attendance: [],
  payments: [],
  groups: [],
  lessons: [],
  exams: [],
  grades: [],
  loading: true,
};

export default function ReportsPage() {
  const { isModuleEnabled } = useAppSettings();

  const [period, setPeriod] =
    useState("هذا الشهر");

  const [activeReport, setActiveReport] =
    useState<ReportType>("students");

  const [reportsData, setReportsData] =
    useState<ReportsData>(
      emptyReportsData,
    );

  useEffect(() => {
    let mounted = true;

    const loadData = async () => {
      try {
        const [
          students,
          attendance,
          payments,
          groups,
          lessons,
          exams,
          grades,
        ] = await Promise.all([
          studentService.list(),
          attendanceService.list(),
          paymentService.list(),
          groupService.list(),
          lessonService.list(),
          examService.list(),
          examService.grades(),
        ]);

        if (mounted) {
          setReportsData({
            students,
            attendance,
            payments,
            groups,
            lessons,
            exams,
            grades,
            loading: false,
          });
        }
      } catch {
        if (mounted) {
          setReportsData({
            ...emptyReportsData,
            loading: false,
          });
        }
      }
    };

    void loadData();

    return () => {
      mounted = false;
    };
  }, []);

  const summary = useMemo(() => {
    const totalStudents =
      reportsData.students.length;

    const markedRecords =
      reportsData.attendance.filter(
        (record) =>
          record.status === "present" ||
          record.status === "late" ||
          record.status === "absent",
      );

    const presentCount =
      markedRecords.filter(
        (record) =>
          record.status === "present" ||
          record.status === "late",
      ).length;

    const attendanceRate =
      markedRecords.length === 0
        ? 0
        : Math.round(
            (presentCount /
              markedRecords.length) *
              100,
          );

    const collected =
      reportsData.payments.reduce(
        (total, payment) =>
          total + payment.amount,
        0,
      );

    const debts =
      reportsData.students.reduce(
        (total, student) =>
          total +
          student.financial.remaining,
        0,
      );

    return {
      students: {
        value: formatNumber(
          totalStudents,
        ),
        label: "إجمالي الطلاب",
        trend: `${formatNumber(
          reportsData.students.filter(
            (student) =>
              student.status === "active",
          ).length,
        )} نشط`,
      },
      attendance: {
        value: formatPercent(
          attendanceRate,
        ),
        label: "نسبة الحضور",
        trend: `${formatNumber(
          markedRecords.length,
        )} سجل`,
      },
      payments: {
        value: formatMoney(collected),
        label: "إجمالي المحصل",
        trend: `${formatNumber(
          reportsData.payments.length,
        )} دفعة`,
      },
      debts: {
        value: formatMoney(debts),
        label: "إجمالي الديون",
        trend: `${formatNumber(
          reportsData.students.filter(
            (student) =>
              student.financial.remaining > 0,
          ).length,
        )} طالب`,
      },
    };
  }, [reportsData]);

  const availableReports = useMemo(
    () =>
      reportCards.filter((report) =>
        isModuleEnabled(report.module),
      ),
    [isModuleEnabled],
  );

  const selectedReport = useMemo(() => {
    const current = availableReports.find(
      (report) =>
        report.type === activeReport,
    );

    return current ?? availableReports[0];
  }, [activeReport, availableReports]);

  const reportMetrics = useMemo(() => {
    if (!selectedReport) {
      return {
        primary: "—",
        secondaryLabel: "قيمة ثانوية",
        secondary: "—",
      };
    }

    return buildReportMetrics(
      selectedReport.type,
      reportsData,
    );
  }, [selectedReport, reportsData]);

  const reportRows = useMemo(() => {
    if (!selectedReport) {
      return [];
    }

    return buildReportRows(
      selectedReport.type,
      reportsData,
    );
  }, [selectedReport, reportsData]);

  const chartBars = useMemo(() => {
    if (!selectedReport) {
      return [];
    }

    return buildChartBars(
      selectedReport.type,
      reportsData,
    );
  }, [selectedReport, reportsData]);

  const handleReportChange = (
    type: ReportType,
  ) => {
    setActiveReport(type);
  };

  const handleExport = () => {
    if (!selectedReport) {
      return;
    }

    const rows = reportRows;

    const csvRows: string[][] = [
      ["التقرير", selectedReport.title],
      ["الفترة", period],
      [],
      ["البيان", "القيمة"],
      ...rows.map((row) => [
        row.label,
        row.value,
      ]),
    ];

    const csv = csvRows
      .map((row) =>
        row
          .map((value) =>
            `"${String(value ?? "").replace(
              /"/g,
              '""',
            )}"`,
          )
          .join(","),
      )
      .join("\n");

    const blob = new Blob(
      [`\uFEFF${csv}`],
      {
        type: "text/csv;charset=utf-8;",
      },
    );

    const url =
      URL.createObjectURL(blob);

    const link =
      document.createElement("a");

    link.href = url;
    link.download = `educenter-report-${selectedReport.type}.csv`;

    document.body.appendChild(link);
    link.click();
    link.remove();

    URL.revokeObjectURL(url);
  };

  if (!isModuleEnabled("reports")) {
    return (
      <main
        dir="rtl"
        className="min-h-screen bg-slate-50"
      >
        <div className="mx-auto flex min-h-[70vh] max-w-7xl items-center justify-center px-4 py-8 sm:px-6 lg:px-8">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 text-slate-500">
              <FiBarChart2 size={22} />
            </div>

            <h1 className="mt-5 text-lg font-bold text-slate-900">
              التقارير غير مفعلة
            </h1>

            <p className="mt-2 text-sm leading-6 text-slate-500">
              وحدة التقارير غير مفعلة حاليًا من إعدادات
              النظام. يمكنك تفعيلها من صفحة الإعدادات.
            </p>
          </div>
        </div>
      </main>
    );
  }

  if (!selectedReport) {
    return (
      <main
        dir="rtl"
        className="min-h-screen bg-slate-50"
      >
        <div className="mx-auto flex min-h-[70vh] max-w-7xl items-center justify-center px-4 py-8 sm:px-6 lg:px-8">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 text-slate-500">
              <FiFileText size={22} />
            </div>

            <h1 className="mt-5 text-lg font-bold text-slate-900">
              لا توجد تقارير متاحة
            </h1>

            <p className="mt-2 text-sm leading-6 text-slate-500">
              لا توجد Modules مفعلة يمكن استخدامها لإنشاء
              التقارير حاليًا.
            </p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main
      dir="rtl"
      className="min-h-screen bg-slate-50"
    >
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        {/* Header */}

        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="mb-2 flex items-center gap-2 text-xs font-medium text-slate-400">
              <span>الرئيسية</span>

              <span>/</span>

              <span className="text-teal-600">
                التقارير
              </span>
            </div>

            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              التقارير
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              متابعة أهم مؤشرات المركز واستخراج التقارير
              الأساسية.
            </p>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row">
            <div className="relative">
              <FiCalendar
                size={15}
                className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <select
                value={period}
                onChange={(event) =>
                  setPeriod(event.target.value)
                }
                aria-label="الفترة الزمنية"
                className="h-10 min-w-36 appearance-none rounded-lg border border-slate-200 bg-white py-0 pl-9 pr-9 text-xs font-medium text-slate-600 outline-none transition hover:border-slate-300 focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10"
              >
                <option value="هذا الشهر">
                  هذا الشهر
                </option>

                <option value="الشهر الماضي">
                  الشهر الماضي
                </option>

                <option value="هذا العام">
                  هذا العام
                </option>

                <option value="العام الماضي">
                  العام الماضي
                </option>
              </select>

              <FiChevronDown
                size={14}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />
            </div>

            <button
              type="button"
              onClick={handleExport}
              className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-teal-600 px-4 text-xs font-semibold text-white shadow-sm transition hover:bg-teal-700 active:scale-[0.98]"
            >
              <FiDownload size={15} />
              تصدير التقرير
            </button>
          </div>
        </div>

        {/* Summary */}

        <section className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <SummaryCard
            label={summary.students.label}
            value={summary.students.value}
            trend={summary.students.trend}
            icon={<FiUsers size={18} />}
          />

          <SummaryCard
            label={summary.attendance.label}
            value={summary.attendance.value}
            trend={summary.attendance.trend}
            icon={<FiCheckCircle size={18} />}
          />

          <SummaryCard
            label={summary.payments.label}
            value={summary.payments.value}
            trend={summary.payments.trend}
            icon={<FiDollarSign size={18} />}
          />

          <SummaryCard
            label={summary.debts.label}
            value={summary.debts.value}
            trend={summary.debts.trend}
            icon={<FiClock size={18} />}
            negative
          />
        </section>

        {/* Report selector */}

        <section className="mb-6 rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="mb-5">
            <h2 className="text-base font-bold text-slate-900">
              أنواع التقارير
            </h2>

            <p className="mt-1 text-xs text-slate-400">
              اختر التقرير الذي تريد مراجعته.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            {availableReports.map(
              (report) => {
                const active =
                  report.type ===
                  selectedReport.type;

                return (
                  <button
                    key={report.type}
                    type="button"
                    onClick={() =>
                      handleReportChange(
                        report.type,
                      )
                    }
                    className={[
                      "group rounded-xl border p-4 text-right transition",
                      active
                        ? "border-teal-200 bg-teal-50/70 shadow-sm"
                        : "border-slate-200 bg-white hover:-translate-y-0.5 hover:border-teal-200 hover:bg-slate-50",
                    ].join(" ")}
                  >
                    <div
                      className={[
                        "flex h-10 w-10 items-center justify-center rounded-lg transition",
                        active
                          ? "bg-white text-teal-600"
                          : "bg-slate-100 text-slate-500 group-hover:bg-teal-50 group-hover:text-teal-600",
                      ].join(" ")}
                    >
                      {report.icon}
                    </div>

                    <h3
                      className={[
                        "mt-4 text-sm font-bold",
                        active
                          ? "text-teal-700"
                          : "text-slate-800",
                      ].join(" ")}
                    >
                      {report.title}
                    </h3>

                    <p className="mt-1 text-[11px] leading-5 text-slate-400">
                      {report.description}
                    </p>
                  </button>
                );
              },
            )}
          </div>
        </section>

        {/* Main report */}

        <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-col gap-4 border-b border-slate-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-teal-50 text-teal-600">
                {selectedReport.icon}
              </div>

              <div>
                <h2 className="text-sm font-bold text-slate-800">
                  {selectedReport.title}
                </h2>

                <p className="mt-1 text-[11px] text-slate-400">
                  الفترة: {period}
                </p>
              </div>
            </div>
          </div>

          <div className="p-5 sm:p-6">
            <div className="grid gap-4 md:grid-cols-3">
              <ReportMetric
                label="القيمة الأساسية"
                value={reportMetrics.primary}
              />

              <ReportMetric
                label={reportMetrics.secondaryLabel}
                value={reportMetrics.secondary}
              />

              <ReportMetric
                label="الفترة"
                value={period}
              />
            </div>

            {/* Chart */}

            <div className="mt-6 rounded-xl border border-slate-200 bg-slate-50/70 p-5">
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-800">
                    ملخص الأداء
                  </h3>

                  <p className="mt-1 text-[11px] text-slate-400">
                    عرض مبسط للمؤشر خلال الفترة المحددة.
                  </p>
                </div>

                <FiBarChart2
                  size={18}
                  className="text-teal-600"
                />
              </div>

              <div className="flex h-48 items-end gap-3 overflow-hidden rounded-lg border border-slate-200 bg-white px-4 py-5">
                {chartBars.length === 0 ? (
                  <div className="flex h-full w-full items-center justify-center text-xs text-slate-400">
                    لا توجد بيانات كافية للرسم.
                  </div>
                ) : (
                  chartBars.map(
                    (bar, index) => (
                      <div
                        key={`${selectedReport.type}-${index}`}
                        className="flex h-full flex-1 items-end"
                      >
                        <div
                          className="w-full rounded-t-md bg-teal-500/80 transition hover:bg-teal-600"
                          style={{
                            height: `${bar.value}%`,
                          }}
                          title={`${bar.label} (${bar.value}%)`}
                        />
                      </div>
                    ),
                  )
                )}
              </div>

              <div className="mt-3 flex justify-between gap-2 text-[10px] text-slate-400">
                <span className="truncate">
                  {chartBars[0]?.label ?? ""}
                </span>

                <span className="truncate">
                  {chartBars.length > 1
                    ? chartBars[
                        chartBars.length - 1
                      ].label
                    : ""}
                </span>
              </div>
            </div>

            {/* Table */}

            <div className="mt-6 overflow-hidden rounded-xl border border-slate-200">
              <div className="border-b border-slate-100 bg-slate-50/70 px-5 py-4">
                <h3 className="text-sm font-bold text-slate-800">
                  تفاصيل التقرير
                </h3>

                <p className="mt-1 text-[11px] text-slate-400">
                  ملخص البيانات المرتبطة بالتقرير المحدد.
                </p>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full min-w-[650px] text-right">
                  <thead>
                    <tr className="border-b border-slate-100">
                      <th className="px-5 py-3 text-xs font-semibold text-slate-500">
                        البيان
                      </th>

                      <th className="px-5 py-3 text-xs font-semibold text-slate-500">
                        القيمة
                      </th>

                      <th className="px-5 py-3 text-xs font-semibold text-slate-500">
                        الفترة
                      </th>

                      <th className="px-5 py-3 text-xs font-semibold text-slate-500">
                        الحالة
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {reportRows.map(
                      (row) => (
                        <tr
                          key={row.label}
                          className="border-b border-slate-100 last:border-0 hover:bg-slate-50/70"
                        >
                          <td className="px-5 py-4 text-xs font-semibold text-slate-700">
                            {row.label}
                          </td>

                          <td className="px-5 py-4 text-xs font-bold text-slate-800">
                            {row.value}
                          </td>

                          <td className="px-5 py-4 text-xs text-slate-500">
                            {period}
                          </td>

                          <td className="px-5 py-4">
                            <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-700">
                              مستقر
                            </span>
                          </td>
                        </tr>
                      ),
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </section>

        {/* API note */}

        <section className="mt-6 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-start gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-500">
              <FiFileText size={17} />
            </div>

            <div>
              <h2 className="text-sm font-bold text-slate-800">
                بيانات محسوبة من النظام
              </h2>

              <p className="mt-1 max-w-3xl text-[11px] leading-5 text-slate-400">
                تُحتسب كل القيم والأرقام المحفوظة محليًا
                (Offline) من سجلات الطلاب والحضور والمدفوعات
                والمجموعات والامتحانات، وتتحدث تلقائيًا مع أي
                تعديل. عند ربط Backend يمكن استبدال مصدر
                البيانات فقط دون تغيير تصميم الصفحة.
              </p>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

/* -------------------------------------------------------------------------- */
/* Components                                                                 */
/* -------------------------------------------------------------------------- */

function SummaryCard({
  label,
  value,
  trend,
  icon,
  negative = false,
}: {
  label: string;
  value: string;
  trend: string;
  icon: ReactNode;
  negative?: boolean;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm text-slate-500">
            {label}
          </p>

          <p className="mt-2 text-xl font-bold text-slate-900">
            {value}
          </p>

          <p
            className={[
              "mt-2 text-[11px] font-semibold",
              negative
                ? "text-emerald-600"
                : "text-teal-600",
            ].join(" ")}
          >
            {trend}
          </p>
        </div>

        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-teal-50 text-teal-600">
          {icon}
        </div>
      </div>
    </div>
  );
}

function ReportMetric({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4">
      <p className="text-[11px] text-slate-400">
        {label}
      </p>

      <p className="mt-2 text-lg font-bold text-slate-800">
        {value}
      </p>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Helpers                                                                    */
/* -------------------------------------------------------------------------- */

function formatNumber(value: number): string {
  return Math.round(value).toLocaleString(
    "ar-EG",
  );
}

function formatMoney(value: number): string {
  return `${formatNumber(value)} ج.م`;
}

function formatPercent(value: number): string {
  return `${Math.round(value)}%`;
}

function getAttendanceRate(
  records: AttendanceRecord[],
): number {
  const marked = records.filter(
    (record) =>
      record.status === "present" ||
      record.status === "late" ||
      record.status === "absent",
  );

  if (marked.length === 0) {
    return 0;
  }

  const present = marked.filter(
    (record) =>
      record.status === "present" ||
      record.status === "late",
  ).length;

  return Math.round(
    (present / marked.length) * 100,
  );
}

function getAverageScore(
  grades: Grade[],
  exams: Exam[],
): number | null {
  let total = 0;
  let count = 0;

  for (const grade of grades) {
    if (grade.score === null) {
      continue;
    }

    const maxScore =
      exams.find(
        (exam) => exam.id === grade.examId,
      )?.maxScore ?? 0;

    if (maxScore <= 0) {
      continue;
    }

    total +=
      (grade.score / maxScore) * 100;
    count += 1;
  }

  if (count === 0) {
    return null;
  }

  return Math.round(total / count);
}

function getPassRate(
  grades: Grade[],
  exams: Exam[],
): number | null {
  let passed = 0;
  let count = 0;

  for (const grade of grades) {
    if (grade.score === null) {
      continue;
    }

    const maxScore =
      exams.find(
        (exam) => exam.id === grade.examId,
      )?.maxScore ?? 0;

    if (maxScore <= 0) {
      continue;
    }

    count += 1;

    if (grade.score >= maxScore * 0.5) {
      passed += 1;
    }
  }

  if (count === 0) {
    return null;
  }

  return Math.round((passed / count) * 100);
}

function buildReportMetrics(
  type: ReportType,
  data: ReportsData,
): {
  primary: string;
  secondaryLabel: string;
  secondary: string;
} {
  switch (type) {
    case "students": {
      const active = data.students.filter(
        (student) =>
          student.status === "active",
      ).length;

      return {
        primary: formatNumber(
          data.students.length,
        ),
        secondaryLabel: "الطلاب النشطون",
        secondary: formatNumber(active),
      };
    }

    case "attendance":
      return {
        primary: formatPercent(
          getAttendanceRate(data.attendance),
        ),
        secondaryLabel: "سجلات الحضور",
        secondary: formatNumber(
          data.attendance.length,
        ),
      };

    case "payments": {
      const collected =
        data.payments.reduce(
          (total, payment) =>
            total + payment.amount,
          0,
        );

      return {
        primary: formatMoney(collected),
        secondaryLabel: "عدد الدفعات",
        secondary: formatNumber(
          data.payments.length,
        ),
      };
    }

    case "groups":
      return {
        primary: formatNumber(
          data.groups.length,
        ),
        secondaryLabel: "عدد الحصص",
        secondary: formatNumber(
          data.lessons.length,
        ),
      };

    case "exams": {
      const average = getAverageScore(
        data.grades,
        data.exams,
      );

      return {
        primary:
          average === null
            ? "—"
            : formatPercent(average),
        secondaryLabel: "الدرجات المسجلة",
        secondary: formatNumber(
          data.grades.length,
        ),
      };
    }

    default:
      return {
        primary: "—",
        secondaryLabel: "قيمة ثانوية",
        secondary: "—",
      };
  }
}

function buildReportRows(
  type: ReportType,
  data: ReportsData,
): ReportRow[] {
  const absent = data.attendance.filter(
    (record) => record.status === "absent",
  ).length;

  const late = data.attendance.filter(
    (record) => record.status === "late",
  ).length;

  const collected = data.payments.reduce(
    (total, payment) =>
      total + payment.amount,
    0,
  );

  const debts = data.students.reduce(
    (total, student) =>
      total + student.financial.remaining,
    0,
  );

  const averagePayment =
    data.payments.length === 0
      ? 0
      : Math.round(
          collected /
            data.payments.length,
        );

  const average = getAverageScore(
    data.grades,
    data.exams,
  );

  const passRate = getPassRate(
    data.grades,
    data.exams,
  );

  switch (type) {
    case "students": {
      const active = data.students.filter(
        (student) =>
          student.status === "active",
      ).length;

      const suspended = data.students.filter(
        (student) =>
          student.status === "suspended",
      ).length;

      const inactive = data.students.filter(
        (student) =>
          student.status === "inactive",
      ).length;

      return [
        {
          label: "إجمالي الطلاب",
          value: formatNumber(
            data.students.length,
          ),
        },
        {
          label: "الطلاب النشطون",
          value: formatNumber(active),
        },
        {
          label: "طلاب متوقفون",
          value: formatNumber(suspended),
        },
        {
          label: "طلاب غير نشطين",
          value: formatNumber(inactive),
        },
      ];
    }

    case "attendance":
      return [
        {
          label: "نسبة الحضور",
          value: formatPercent(
            getAttendanceRate(data.attendance),
          ),
        },
        {
          label: "سجلات الحضور",
          value: formatNumber(
            data.attendance.length,
          ),
        },
        {
          label: "الغياب",
          value: formatNumber(absent),
        },
        {
          label: "التأخير",
          value: formatNumber(late),
        },
      ];

    case "payments":
      return [
        {
          label: "إجمالي المحصل",
          value: formatMoney(collected),
        },
        {
          label: "عدد الدفعات",
          value: formatNumber(
            data.payments.length,
          ),
        },
        {
          label: "إجمالي الديون",
          value: formatMoney(debts),
        },
        {
          label: "متوسط الدفعة",
          value: formatMoney(
            averagePayment,
          ),
        },
      ];

    case "groups": {
      const activeGroups = data.groups.filter(
        (group) => group.status === "active",
      ).length;

      return [
        {
          label: "إجمالي المجموعات",
          value: formatNumber(
            data.groups.length,
          ),
        },
        {
          label: "المجموعات النشطة",
          value: formatNumber(
            activeGroups,
          ),
        },
        {
          label: "إجمالي الطلاب",
          value: formatNumber(
            data.students.length,
          ),
        },
        {
          label: "عدد الحصص",
          value: formatNumber(
            data.lessons.length,
          ),
        },
      ];
    }

    case "exams":
      return [
        {
          label: "عدد الامتحانات",
          value: formatNumber(
            data.exams.length,
          ),
        },
        {
          label: "الدرجات المسجلة",
          value: formatNumber(
            data.grades.length,
          ),
        },
        {
          label: "متوسط الأداء",
          value:
            average === null
              ? "—"
              : formatPercent(average),
        },
        {
          label: "نسبة النجاح",
          value:
            passRate === null
              ? "—"
              : formatPercent(passRate),
        },
      ];

    default:
      return [];
  }
}

function buildChartBars(
  type: ReportType,
  data: ReportsData,
): ReportChartBar[] {
  switch (type) {
    case "students": {
      const total = data.students.length || 1;

      const active = data.students.filter(
        (student) =>
          student.status === "active",
      ).length;

      const suspended = data.students.filter(
        (student) =>
          student.status === "suspended",
      ).length;

      const inactive = data.students.filter(
        (student) =>
          student.status === "inactive",
      ).length;

      return [
        {
          label: "نشط",
          value: Math.round(
            (active / total) * 100,
          ),
        },
        {
          label: "متوقف",
          value: Math.round(
            (suspended / total) * 100,
          ),
        },
        {
          label: "غير نشط",
          value: Math.round(
            (inactive / total) * 100,
          ),
        },
      ];
    }

    case "attendance": {
      const byDay = new Map<
        string,
        { present: number; total: number }
      >();

      for (const record of data.attendance) {
        if (!record.checkedInAt) {
          continue;
        }

        if (
          record.status !== "present" &&
          record.status !== "late" &&
          record.status !== "absent"
        ) {
          continue;
        }

        const day =
          record.checkedInAt.slice(0, 10);
        const bucket =
          byDay.get(day) ?? {
            present: 0,
            total: 0,
          };

        bucket.total += 1;

        if (
          record.status === "present" ||
          record.status === "late"
        ) {
          bucket.present += 1;
        }

        byDay.set(day, bucket);
      }

      const days = Array.from(byDay.entries());

      return days
        .sort((first, second) =>
          first[0].localeCompare(second[0]),
        )
        .slice(-7)
        .map(([day, bucket]) => ({
          label: day.slice(5),
          value: Math.round(
            (bucket.present /
              bucket.total) *
              100,
          ),
        }));
    }

    case "payments": {
      const largest = data.payments.reduce(
        (max, payment) =>
          Math.max(max, payment.amount),
        0,
      );

      return data.payments.map(
        (payment, index) => ({
          label: `دفعة ${index + 1}`,
          value:
            largest === 0
              ? 0
              : Math.round(
                  (payment.amount /
                    largest) *
                    100,
                ),
        }),
      );
    }

    case "groups": {
      const total = data.students.length || 1;
      const buckets = new Map<
        string,
        number
      >();

      for (const student of data.students) {
        const group =
          student.groupId
            ? data.groups.find(
                (item) =>
                  item.id ===
                  student.groupId,
              )
            : undefined;

        const label =
          group?.name ?? "بدون مجموعة";

        buckets.set(
          label,
          (buckets.get(label) ?? 0) + 1,
        );
      }

      return Array.from(
        buckets.entries(),
      ).map(([label, count]) => ({
        label,
        value: Math.round(
          (count / total) * 100,
        ),
      }));
    }

    case "exams":
      return data.exams.map((exam) => {
        const graded = data.grades.filter(
          (grade) =>
            grade.examId === exam.id &&
            grade.score !== null,
        );

        if (
          graded.length === 0 ||
          exam.maxScore <= 0
        ) {
          return {
            label: exam.subject,
            value: 0,
          };
        }

        const average =
          graded.reduce(
            (total, grade) =>
              total +
              ((grade.score ?? 0) /
                exam.maxScore) *
                100,
            0,
          ) / graded.length;

        return {
          label: exam.subject,
          value: Math.round(average),
        };
      });

    default:
      return [];
  }
}
