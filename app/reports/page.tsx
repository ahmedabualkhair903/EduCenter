
"use client";

import {
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
import type { ModuleKey } from "@/types";

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

type SummaryItem = {
  value: string;
  label: string;
  trend: string;
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

const summaryData: Record<
  "students" | "attendance" | "payments" | "debts",
  SummaryItem
> = {
  students: {
    value: "1,248",
    label: "إجمالي الطلاب",
    trend: "+8.4%",
  },
  attendance: {
    value: "91.6%",
    label: "نسبة الحضور",
    trend: "+3.2%",
  },
  payments: {
    value: "184,500 ج.م",
    label: "إجمالي المحصل",
    trend: "+12.8%",
  },
  debts: {
    value: "42,300 ج.م",
    label: "إجمالي الديون",
    trend: "-5.6%",
  },
};

export default function ReportsPage() {
  const { isModuleEnabled } = useAppSettings();

  const [period, setPeriod] =
    useState("هذا الشهر");

  const [activeReport, setActiveReport] =
    useState<ReportType>("students");

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

  const reportRows = useMemo(() => {
    if (!selectedReport) {
      return [];
    }

    return getReportRows(
      selectedReport.type,
    );
  }, [selectedReport]);

  const handleReportChange = (
    type: ReportType,
  ) => {
    setActiveReport(type);
  };

  const handleExport = () => {
    if (!selectedReport) {
      return;
    }

    const rows = getReportRows(
      selectedReport.type,
    );

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
            label={summaryData.students.label}
            value={summaryData.students.value}
            trend={summaryData.students.trend}
            icon={<FiUsers size={18} />}
          />

          <SummaryCard
            label={summaryData.attendance.label}
            value={summaryData.attendance.value}
            trend={summaryData.attendance.trend}
            icon={<FiCheckCircle size={18} />}
          />

          <SummaryCard
            label={summaryData.payments.label}
            value={summaryData.payments.value}
            trend={summaryData.payments.trend}
            icon={<FiDollarSign size={18} />}
          />

          <SummaryCard
            label={summaryData.debts.label}
            value={summaryData.debts.value}
            trend={summaryData.debts.trend}
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

            <div className="inline-flex w-fit items-center gap-2 rounded-full bg-amber-50 px-3 py-1.5 text-[11px] font-semibold text-amber-700">
              <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
              بيانات تجريبية
            </div>
          </div>

          <div className="p-5 sm:p-6">
            <div className="grid gap-4 md:grid-cols-3">
              <ReportMetric
                label="القيمة الأساسية"
                value={getReportValue(
                  selectedReport.type,
                )}
              />

              <ReportMetric
                label="التغير عن الفترة السابقة"
                value={getReportTrend(
                  selectedReport.type,
                )}
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
                {[
                  45,
                  62,
                  51,
                  74,
                  68,
                  86,
                  78,
                  92,
                  81,
                  96,
                  88,
                  100,
                ].map(
                  (height, index) => (
                    <div
                      key={`bar-${index + 1}`}
                      className="flex h-full flex-1 items-end"
                    >
                      <div
                        className="w-full rounded-t-md bg-teal-500/80 transition hover:bg-teal-600"
                        style={{
                          height: `${height}%`,
                        }}
                        title={`الأسبوع ${index + 1}`}
                      />
                    </div>
                  ),
                )}
              </div>

              <div className="mt-3 flex justify-between text-[10px] text-slate-400">
                <span>الأسبوع 1</span>
                <span>الأسبوع 12</span>
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
                التقارير جاهزة للـAPI
              </h2>

              <p className="mt-1 max-w-3xl text-[11px] leading-5 text-slate-400">
                البيانات المعروضة حاليًا تجريبية بهدف تجهيز
                الواجهة. عند ربط Backend يمكن استبدال مصدر
                البيانات فقط دون تغيير تصميم الصفحة أو تجربة
                المستخدم.
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
            {trend} مقارنة بالفترة السابقة
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

function getReportValue(
  type: ReportType,
): string {
  switch (type) {
    case "students":
      return "1,248";

    case "attendance":
      return "91.6%";

    case "payments":
      return "184,500 ج.م";

    case "groups":
      return "36";

    case "exams":
      return "87.4%";

    default:
      return "—";
  }
}

function getReportTrend(
  type: ReportType,
): string {
  switch (type) {
    case "students":
      return "+8.4%";

    case "attendance":
      return "+3.2%";

    case "payments":
      return "+12.8%";

    case "groups":
      return "+2 مجموعة";

    case "exams":
      return "+4.1%";

    default:
      return "—";
  }
}

function getReportRows(
  type: ReportType,
): ReportRow[] {
  switch (type) {
    case "students":
      return [
        {
          label: "إجمالي الطلاب",
          value: "1,248",
        },
        {
          label: "الطلاب النشطون",
          value: "1,186",
        },
        {
          label: "طلاب جدد",
          value: "84",
        },
        {
          label: "طلاب متوقفون",
          value: "62",
        },
      ];

    case "attendance":
      return [
        {
          label: "نسبة الحضور",
          value: "91.6%",
        },
        {
          label: "الحضور",
          value: "2,486",
        },
        {
          label: "الغياب",
          value: "228",
        },
        {
          label: "التأخير",
          value: "94",
        },
      ];

    case "payments":
      return [
        {
          label: "إجمالي المحصل",
          value: "184,500 ج.م",
        },
        {
          label: "المدفوعات",
          value: "426",
        },
        {
          label: "الديون",
          value: "42,300 ج.م",
        },
        {
          label: "متوسط الدفعة",
          value: "433 ج.م",
        },
      ];

    case "groups":
      return [
        {
          label: "إجمالي المجموعات",
          value: "36",
        },
        {
          label: "المجموعات النشطة",
          value: "32",
        },
        {
          label: "إجمالي الطلاب",
          value: "1,248",
        },
        {
          label: "الحصص هذا الشهر",
          value: "284",
        },
      ];

    case "exams":
      return [
        {
          label: "متوسط الدرجات",
          value: "87.4%",
        },
        {
          label: "عدد الامتحانات",
          value: "18",
        },
        {
          label: "الطلاب المشاركون",
          value: "1,086",
        },
        {
          label: "نسبة النجاح",
          value: "94.2%",
        },
      ];

    default:
      return [];
  }
}
