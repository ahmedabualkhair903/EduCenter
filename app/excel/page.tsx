"use client";

import {
  type ChangeEvent,
  type DragEvent,
  type ReactNode,
  useRef,
  useState,
} from "react";
import {
  FiAlertCircle,
  FiCheckCircle,
  FiDownload,
  FiFileText,
  FiInfo,
  FiUpload,
  FiUsers,
  FiX,
} from "react-icons/fi";

type ImportType =
  | "students"
  | "groups"
  | "payments"
  | "attendance";

type ImportStatus =
  | "ready"
  | "importing"
  | "imported"
  | "failed";

type ImportHistory = {
  id: string;
  fileName: string;
  type: ImportType;
  date: string;
  records: number;
  status: ImportStatus;
};

const initialHistory: ImportHistory[] = [
  {
    id: "1",
    fileName: "students_august.xlsx",
    type: "students",
    date: "23 أغسطس 2026 - 11:40 ص",
    records: 1248,
    status: "imported",
  },
  {
    id: "2",
    fileName: "groups_2026.xlsx",
    type: "groups",
    date: "22 أغسطس 2026 - 05:20 م",
    records: 36,
    status: "imported",
  },
  {
    id: "3",
    fileName: "payments_august.xlsx",
    type: "payments",
    date: "20 أغسطس 2026 - 02:15 م",
    records: 426,
    status: "imported",
  },
];

const importOptions: Array<{
  value: ImportType;
  label: string;
  icon: ReactNode;
}> = [
  {
    value: "students",
    label: "الطلاب",
    icon: <FiUsers size={17} />,
  },
  {
    value: "groups",
    label: "المجموعات",
    icon: <FiFileText size={17} />,
  },
  {
    value: "payments",
    label: "المدفوعات",
    icon: <FiFileText size={17} />,
  },
  {
    value: "attendance",
    label: "الحضور",
    icon: <FiCheckCircle size={17} />,
  },
];

const exportOptions: Array<{
  title: string;
  description: string;
  type: ImportType;
  icon: React.ElementType;
}> = [
  {
    title: "بيانات الطلاب",
    description:
      "تصدير جميع بيانات الطلاب المسجلة في النظام.",
    type: "students",
    icon: FiUsers,
  },
  {
    title: "المجموعات",
    description:
      "تصدير المجموعات والمدرسين والمواد المرتبطة بها.",
    type: "groups",
    icon: FiFileText,
  },
  {
    title: "المدفوعات",
    description:
      "تصدير سجل المدفوعات والديون والمبالغ المحصلة.",
    type: "payments",
    icon: FiFileText,
  },
  {
    title: "الحضور",
    description:
      "تصدير سجل حضور وغياب الطلاب.",
    type: "attendance",
    icon: FiCheckCircle,
  },
];

const typeLabels: Record<
  ImportType,
  string
> = {
  students: "طلاب",
  groups: "مجموعات",
  payments: "مدفوعات",
  attendance: "حضور",
};

const statusLabels: Record<
  ImportStatus,
  string
> = {
  ready: "جاهز",
  importing: "جاري الاستيراد",
  imported: "تم الاستيراد",
  failed: "فشل",
};

export default function ExcelPage() {
  const fileInputRef =
    useRef<HTMLInputElement | null>(null);

  const [selectedFile, setSelectedFile] =
    useState<File | null>(null);

  const [importType, setImportType] =
    useState<ImportType>("students");

  const [importStatus, setImportStatus] =
    useState<ImportStatus>("ready");

  const [history, setHistory] =
    useState<ImportHistory[]>(initialHistory);

  const [error, setError] = useState("");

  const [isDragging, setIsDragging] =
    useState(false);

  const handleFile = (
    file: File | undefined,
  ) => {
    if (!file) {
      return;
    }

    setError("");

    const fileName =
      file.name.toLowerCase();

    const isExcelFile =
      fileName.endsWith(".xlsx") ||
      fileName.endsWith(".xls") ||
      fileName.endsWith(".csv");

    if (!isExcelFile) {
      setSelectedFile(null);
      setImportStatus("failed");
      setError(
        "يرجى اختيار ملف Excel بصيغة XLSX أو XLS أو CSV.",
      );
      return;
    }

    setSelectedFile(file);
    setImportStatus("ready");
  };

  const handleInputChange = (
    event: ChangeEvent<HTMLInputElement>,
  ) => {
    handleFile(
      event.target.files?.[0],
    );
  };

  const handleDrop = (
    event: DragEvent<HTMLDivElement>,
  ) => {
    event.preventDefault();

    setIsDragging(false);

    handleFile(
      event.dataTransfer.files?.[0],
    );
  };

  const handleImport = () => {
    if (!selectedFile) {
      setError("اختر ملف Excel أولًا.");
      return;
    }

    setError("");
    setImportStatus("importing");

    window.setTimeout(() => {
      const newRecord: ImportHistory = {
        id: crypto.randomUUID(),
        fileName: selectedFile.name,
        type: importType,
        date: "24 أغسطس 2026 - الآن",
        records: 0,
        status: "imported",
      };

      setHistory((current) => [
        newRecord,
        ...current,
      ]);

      setImportStatus("imported");
    }, 700);
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    setImportStatus("ready");
    setError("");

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleDownloadTemplate = () => {
    const headers =
      getTemplateHeaders(importType);

    downloadCsv(
      headers,
      `template-${importType}.csv`,
    );
  };

  const handleExport = (
    type: ImportType,
  ) => {
    const headers =
      getExportHeaders(type);

    /*
     * Frontend-only stage:
     * We export a valid CSV file for now.
     * The real XLSX generation will be connected
     * to the backend / Excel library later.
     */

    downloadCsv(
      headers,
      `${typeLabels[type]}.csv`,
    );
  };

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        {/* Header */}

        <div className="mb-6">
          <div className="mb-2 flex items-center gap-2 text-xs font-medium text-slate-400">
            <span>الرئيسية</span>
            <span>/</span>
            <span className="text-teal-600">
              Excel
            </span>
          </div>

          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Excel
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            استيراد وتصدير بيانات المركز بسهولة
            باستخدام ملفات Excel.
          </p>
        </div>

        {/* Info */}

        <section className="mb-6 flex gap-3 rounded-xl border border-blue-100 bg-blue-50/70 p-4">
          <div className="mt-0.5 shrink-0 text-blue-600">
            <FiInfo size={18} />
          </div>

          <div>
            <h2 className="text-sm font-bold text-blue-900">
              قبل استيراد البيانات
            </h2>

            <p className="mt-1 text-xs leading-6 text-blue-700">
              تأكد من أن الملف يحتوي على الأعمدة
              المطلوبة وبالصيغة الصحيحة. يمكنك
              استخدام القوالب الجاهزة لتجنب أخطاء
              الاستيراد.
            </p>
          </div>
        </section>

        {/* Import */}

        <section className="mb-6 rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="mb-5">
            <h2 className="text-base font-bold text-slate-900">
              استيراد البيانات
            </h2>

            <p className="mt-1 text-xs text-slate-400">
              قم برفع ملف Excel لإضافة البيانات إلى
              النظام.
            </p>
          </div>

          <div className="mb-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {importOptions.map((option) => (
              <ImportType
                key={option.value}
                label={option.label}
                active={
                  importType === option.value
                }
                onClick={() => {
                  setImportType(
                    option.value,
                  );
                  setError("");
                }}
                icon={option.icon}
              />
            ))}
          </div>

          {/* Dropzone */}

          <div
            onDragOver={(event) => {
              event.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() =>
              setIsDragging(false)
            }
            onDrop={handleDrop}
            onClick={() =>
              fileInputRef.current?.click()
            }
            role="button"
            tabIndex={0}
            onKeyDown={(event) => {
              if (
                event.key === "Enter" ||
                event.key === " "
              ) {
                event.preventDefault();
                fileInputRef.current?.click();
              }
            }}
            className={[
              "cursor-pointer rounded-xl border-2 border-dashed p-8 text-center transition",
              isDragging
                ? "border-teal-400 bg-teal-50"
                : "border-slate-200 bg-slate-50 hover:border-teal-300 hover:bg-teal-50/40",
            ].join(" ")}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx,.xls,.csv"
              onChange={handleInputChange}
              className="hidden"
            />

            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-white text-teal-600 shadow-sm">
              <FiUpload size={21} />
            </div>

            <h3 className="mt-4 text-sm font-bold text-slate-800">
              اسحب ملف Excel هنا
            </h3>

            <p className="mt-1 text-xs text-slate-400">
              أو اضغط لاختيار ملف من جهازك
            </p>

            <p className="mt-3 text-[10px] text-slate-400">
              XLSX / XLS / CSV
            </p>
          </div>

          {/* Selected File */}

          {selectedFile && (
            <div className="mt-4 flex items-center justify-between gap-3 rounded-lg border border-teal-100 bg-teal-50/60 p-3">
              <div className="flex min-w-0 items-center gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white text-teal-600">
                  <FiFileText size={17} />
                </div>

                <div className="min-w-0">
                  <p className="truncate text-xs font-semibold text-slate-700">
                    {selectedFile.name}
                  </p>

                  <p className="mt-0.5 text-[10px] text-slate-400">
                    {formatFileSize(
                      selectedFile.size,
                    )}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  handleRemoveFile();
                }}
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-slate-400 transition hover:bg-white hover:text-red-600"
                title="إزالة الملف"
                aria-label="إزالة الملف"
              >
                <FiX size={16} />
              </button>
            </div>
          )}

          {/* Error */}

          {error && (
            <div className="mt-4 flex items-center gap-2 rounded-lg border border-red-100 bg-red-50 px-3 py-2.5 text-xs font-medium text-red-600">
              <FiAlertCircle size={15} />
              {error}
            </div>
          )}

          {/* Success */}

          {importStatus === "imported" && (
            <div className="mt-4 flex items-center gap-2 rounded-lg border border-emerald-100 bg-emerald-50 px-3 py-2.5 text-xs font-medium text-emerald-700">
              <FiCheckCircle size={15} />
              تم استيراد الملف بنجاح.
            </div>
          )}

          {/* Actions */}

          <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={
                handleDownloadTemplate
              }
              className="h-10 rounded-lg border border-slate-200 bg-white px-4 text-xs font-semibold text-slate-600 transition hover:bg-slate-50"
            >
              تحميل قالب CSV
            </button>

            <button
              type="button"
              disabled={
                !selectedFile ||
                importStatus ===
                  "importing"
              }
              onClick={handleImport}
              className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-teal-600 px-5 text-xs font-semibold text-white transition hover:bg-teal-700 disabled:cursor-not-allowed disabled:bg-slate-300"
            >
              <FiUpload size={15} />

              {importStatus === "importing"
                ? "جاري الاستيراد..."
                : "استيراد البيانات"}
            </button>
          </div>
        </section>

        {/* Export */}

        <section className="mb-6 rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="mb-5">
            <h2 className="text-base font-bold text-slate-900">
              تصدير البيانات
            </h2>

            <p className="mt-1 text-xs text-slate-400">
              اختر نوع البيانات التي تريد تصديرها.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {exportOptions.map((option) => {
              const Icon = option.icon;

              return (
                <div
                  key={option.type}
                  className="group rounded-xl border border-slate-200 p-4 transition hover:-translate-y-0.5 hover:border-teal-200 hover:bg-teal-50/30 hover:shadow-sm"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100 text-slate-600 transition group-hover:bg-teal-50 group-hover:text-teal-600">
                      <Icon size={18} />
                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        handleExport(
                          option.type,
                        )
                      }
                      className="flex h-8 w-8 items-center justify-center rounded-md text-slate-400 transition hover:bg-white hover:text-teal-600"
                      title="تصدير"
                      aria-label={`تصدير ${option.title}`}
                    >
                      <FiDownload size={16} />
                    </button>
                  </div>

                  <h3 className="mt-4 text-sm font-bold text-slate-800">
                    {option.title}
                  </h3>

                  <p className="mt-1 min-h-10 text-[11px] leading-5 text-slate-400">
                    {option.description}
                  </p>

                  <button
                    type="button"
                    onClick={() =>
                      handleExport(
                        option.type,
                      )
                    }
                    className="mt-4 inline-flex items-center gap-2 text-xs font-semibold text-teal-600 transition hover:text-teal-700"
                  >
                    <FiDownload size={14} />
                    تصدير CSV
                  </button>
                </div>
              );
            })}
          </div>
        </section>

        {/* History */}

        <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 px-5 py-4">
            <h2 className="text-sm font-bold text-slate-800">
              سجل الاستيراد
            </h2>

            <p className="mt-1 text-xs text-slate-400">
              آخر عمليات استيراد البيانات.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[750px] text-right">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/70">
                  <th className="px-5 py-3 text-xs font-semibold text-slate-500">
                    الملف
                  </th>

                  <th className="px-5 py-3 text-xs font-semibold text-slate-500">
                    النوع
                  </th>

                  <th className="px-5 py-3 text-xs font-semibold text-slate-500">
                    التاريخ
                  </th>

                  <th className="px-5 py-3 text-xs font-semibold text-slate-500">
                    السجلات
                  </th>

                  <th className="px-5 py-3 text-xs font-semibold text-slate-500">
                    الحالة
                  </th>
                </tr>
              </thead>

              <tbody>
                {history.map((item) => (
                  <tr
                    key={item.id}
                    className="border-b border-slate-100 last:border-0"
                  >
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-slate-500">
                          <FiFileText
                            size={15}
                          />
                        </div>

                        <span className="text-xs font-semibold text-slate-700">
                          {item.fileName}
                        </span>
                      </div>
                    </td>

                    <td className="px-5 py-4">
                      <span className="rounded-md bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-600">
                        {typeLabels[item.type]}
                      </span>
                    </td>

                    <td className="px-5 py-4 text-xs text-slate-500">
                      {item.date}
                    </td>

                    <td className="px-5 py-4 text-xs font-semibold text-slate-700">
                      {item.records === 0
                        ? "—"
                        : item.records}
                    </td>

                    <td className="px-5 py-4">
                      <ImportStatusBadge
                        status={item.status}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </main>
  );
}

/* -------------------------------------------------------------------------- */
/* Import Type                                                                */
/* -------------------------------------------------------------------------- */

function ImportType({
  label,
  active,
  onClick,
  icon,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
  icon: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "flex items-center gap-3 rounded-lg border p-3 text-right transition",
        active
          ? "border-teal-200 bg-teal-50 text-teal-700"
          : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50",
      ].join(" ")}
      aria-pressed={active}
    >
      <span
        className={[
          "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg",
          active
            ? "bg-white text-teal-600"
            : "bg-slate-100 text-slate-500",
        ].join(" ")}
      >
        {icon}
      </span>

      <span className="text-xs font-semibold">
        {label}
      </span>
    </button>
  );
}

/* -------------------------------------------------------------------------- */
/* Status Badge                                                               */
/* -------------------------------------------------------------------------- */

function ImportStatusBadge({
  status,
}: {
  status: ImportStatus;
}) {
  const styles: Record<
    ImportStatus,
    string
  > = {
    ready:
      "bg-slate-100 text-slate-600",
    importing:
      "bg-blue-50 text-blue-700",
    imported:
      "bg-emerald-50 text-emerald-700",
    failed:
      "bg-red-50 text-red-700",
  };

  return (
    <span
      className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${styles[status]}`}
    >
      {statusLabels[status]}
    </span>
  );
}

/* -------------------------------------------------------------------------- */
/* Helpers                                                                    */
/* -------------------------------------------------------------------------- */

function formatFileSize(
  bytes: number,
) {
  if (bytes < 1024) {
    return `${bytes} B`;
  }

  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  }

  return `${(
    bytes /
    (1024 * 1024)
  ).toFixed(1)} MB`;
}

function getTemplateHeaders(
  type: ImportType,
) {
  const templates: Record<
    ImportType,
    string[]
  > = {
    students: [
      "الاسم",
      "رقم الهاتف",
      "هاتف ولي الأمر",
      "المرحلة",
      "المجموعة",
    ],
    groups: [
      "اسم المجموعة",
      "المادة",
      "المدرس",
      "المرحلة",
    ],
    payments: [
      "الطالب",
      "المبلغ",
      "المدفوع",
      "المتبقي",
      "التاريخ",
    ],
    attendance: [
      "الطالب",
      "التاريخ",
      "الحالة",
      "وقت الحضور",
      "وقت الانصراف",
    ],
  };

  return templates[type];
}

function getExportHeaders(
  type: ImportType,
) {
  return getTemplateHeaders(type);
}

function downloadCsv(
  headers: string[],
  fileName: string,
) {
  const csvContent =
    "\uFEFF" +
    headers
      .map((header) => escapeCsvValue(header))
      .join(",") +
    "\n";

  const blob = new Blob(
    [csvContent],
    {
      type: "text/csv;charset=utf-8;",
    },
  );

  const url =
    URL.createObjectURL(blob);

  const link =
    document.createElement("a");

  link.href = url;
  link.download = fileName;

  document.body.appendChild(link);
  link.click();
  link.remove();

  URL.revokeObjectURL(url);
}

function escapeCsvValue(
  value: string,
) {
  return `"${value.replaceAll(
    '"',
    '""',
  )}"`;
}