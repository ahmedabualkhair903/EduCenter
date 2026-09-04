"use client";

import {
  type ChangeEvent,
  type DragEvent,
  type ReactNode,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  FiAlertCircle,
  FiCheck,
  FiCheckCircle,
  FiDownload,
  FiFileText,
  FiInfo,
  FiSearch,
  FiUpload,
  FiUser,
  FiUsers,
  FiX,
} from "react-icons/fi";

import { readExcelFile, writeExcelFile, generateTemplate } from "@/lib/excel";
import { studentService } from "@/services";

type ImportType = "students" | "grades";

type ImportStatus =
  | "ready"
  | "importing"
  | "imported"
  | "failed";

type PreviewStatus =
  | "recognized"
  | "unknown"
  | "duplicate"
  | "error";

type PreviewRow = {
  id: string;
  values: string[];
  status: PreviewStatus;
  message?: string;
};

type StudentExport = {
  id: string;
  studentId: string;
  name: string;
  phone: string;
  guardianPhone: string;
};

const initialStudents: StudentExport[] = [
  {
    id: "1",
    studentId: "ST-1001",
    name: "أحمد محمد علي",
    phone: "01012345678",
    guardianPhone: "01112345678",
  },
  {
    id: "2",
    studentId: "ST-1002",
    name: "محمد أحمد حسن",
    phone: "01023456789",
    guardianPhone: "01123456789",
  },
  {
    id: "3",
    studentId: "ST-1003",
    name: "سارة محمود",
    phone: "01034567890",
    guardianPhone: "01134567890",
  },
  {
    id: "4",
    studentId: "ST-1004",
    name: "يوسف خالد",
    phone: "01045678901",
    guardianPhone: "01145678901",
  },
];

const initialHistory = [
  {
    id: "1",
    fileName: "students_august.xlsx",
    type: "students" as ImportType,
    date: "23 أغسطس 2026 - 11:40 ص",
    records: 1248,
    status: "imported" as ImportStatus,
  },
  {
    id: "2",
    fileName: "grades_exam_01.xlsx",
    type: "grades" as ImportType,
    date: "22 أغسطس 2026 - 05:20 م",
    records: 86,
    status: "imported" as ImportStatus,
  },
];

const importOptions: Array<{
  value: ImportType;
  label: string;
  description: string;
  icon: ReactNode;
}> = [
  {
    value: "students",
    label: "استيراد الطلاب",
    description: "إضافة أو تحديث بيانات الطلاب.",
    icon: <FiUsers size={17} />,
  },
  {
    value: "grades",
    label: "استيراد الدرجات",
    description: "رفع درجات امتحان من ملف Excel.",
    icon: <FiFileText size={17} />,
  },
];

const typeLabels: Record<ImportType, string> = {
  students: "طلاب",
  grades: "درجات",
};

const statusLabels: Record<ImportStatus, string> = {
  ready: "جاهز",
  importing: "جاري الاستيراد",
  imported: "تم الاعتماد",
  failed: "فشل",
};

const previewStatusLabels: Record<PreviewStatus, string> = {
  recognized: "تم التعرف",
  unknown: "طالب غير معروف",
  duplicate: "بيانات مكررة",
  error: "خطأ",
};

export default function ExcelPage() {
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [importType, setImportType] =
    useState<ImportType>("students");
  const [importStatus, setImportStatus] =
    useState<ImportStatus>("ready");

  const [history, setHistory] = useState(initialHistory);

  const [error, setError] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [isPreviewLoading, setIsPreviewLoading] =
    useState(false);
  const [showPreview, setShowPreview] = useState(false);

  const [previewRows, setPreviewRows] =
    useState<PreviewRow[]>([]);

  const [studentSearch, setStudentSearch] =
    useState("");

  const [selectedStudent, setSelectedStudent] =
    useState<StudentExport | null>(null);

  const [exportLoading, setExportLoading] =
    useState(false);

  const [allStudents, setAllStudents] = useState<StudentExport[]>(initialStudents);

  // Load actual students on mount
  useEffect(() => {
    let mounted = true;
    
    const loadStudents = async () => {
      try {
        const students = await studentService.list();
        if (mounted) {
          setAllStudents(students.map(s => ({
            id: s.id,
            studentId: s.studentId,
            name: s.name,
            phone: s.phone || "",
            guardianPhone: s.guardianPhone,
          })));
        }
      } catch (error) {
        console.error("Failed to load students:", error);
      }
    };
    
    loadStudents();
    return () => { mounted = false; };
  }, []);

  const filteredStudents = useMemo(() => {
    const query = studentSearch.trim().toLowerCase();

    if (!query) {
      return allStudents;
    }

    return allStudents.filter((student) =>
      [
        student.name,
        student.studentId,
        student.guardianPhone,
      ].some((value) =>
        value.toLowerCase().includes(query),
      ),
    );
  }, [studentSearch, allStudents]);

  const handleFile = (file?: File) => {
    if (!file) {
      return;
    }

    setError("");
    setShowPreview(false);
    setPreviewRows([]);
    setImportStatus("ready");

    const fileName = file.name.toLowerCase();

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
  };

  const handleInputChange = (
    event: ChangeEvent<HTMLInputElement>,
  ) => {
    handleFile(event.target.files?.[0]);
  };

  const handleDrop = (
    event: DragEvent<HTMLDivElement>,
  ) => {
    event.preventDefault();
    setIsDragging(false);

    handleFile(event.dataTransfer.files?.[0]);
  };

  const createPreview = async () => {
    if (!selectedFile) {
      setError("اختر ملف Excel أولًا.");
      return;
    }

    setError("");
    setIsPreviewLoading(true);
    setShowPreview(false);

    try {
      const excelData = await readExcelFile(selectedFile);
      
      const rows: PreviewRow[] = await Promise.all(
        excelData.map(async (row, index) => {
          const values = row.map(cell => String(cell ?? ''));
          
          if (importType === "students") {
            const studentId = values[1]?.trim();
            
            // Try to find student by ID
            const existingStudents = await studentService.list();
            const existingStudent = existingStudents.find(s => 
              s.studentId.toLowerCase() === studentId.toLowerCase()
            );
            
            // Check for duplicates in the file
           const isDuplicate = excelData.slice(0, index).some(
  (prevRow) =>
    String(prevRow[1] ?? "").trim().toLowerCase() ===
    studentId.toLowerCase()
);
            
            if (isDuplicate) {
              return {
                id: String(index + 1),
                values,
                status: "duplicate" as const,
                message: "يوجد سجل مكرر داخل الملف.",
              };
            }
            
            if (existingStudent) {
              return {
                id: String(index + 1),
                values,
                status: "recognized" as const,
                message: "تم التعرف على الطالب بنجاح",
              };
            }
            
            return {
              id: String(index + 1),
              values,
              status: "unknown" as const,
              message: "لم يتم العثور على الطالب في النظام.",
            };
          } else {
            // Grades import logic
            const studentId = values[0]?.trim();
            const score = Number(values[2]);
            const maxScore = 20; // This should come from the selected exam
            
            const existingStudents = await studentService.list();
            const existingStudent = existingStudents.find(s => 
              s.studentId.toLowerCase() === studentId.toLowerCase()
            );
            
            if (!existingStudent) {
              return {
                id: String(index + 1),
                values,
                status: "unknown" as const,
                message: "لم يتم التعرف على الطالب.",
              };
            }
            
            if (isNaN(score) || score < 0 || score > maxScore) {
              return {
                id: String(index + 1),
                values,
                status: "error" as const,
                message: `الدرجة أكبر من الدرجة النهائية (${maxScore}).`,
              };
            }
            
            return {
              id: String(index + 1),
              values,
              status: "recognized" as const,
              message: "تم التعرف على الطالب بنجاح",
            };
          }
        })
      );

      setPreviewRows(rows);
      setShowPreview(true);
    } catch (error) {
      setError("فشل قراءة ملف Excel. يرجى التأكد من صحة الملف.");
      console.error("Excel parsing error:", error);
    } finally {
      setIsPreviewLoading(false);
    }
  };

  const validPreviewRows = previewRows.filter(
    (row) => row.status === "recognized",
  );

  const unknownCount = previewRows.filter(
    (row) => row.status === "unknown",
  ).length;

  const duplicateCount = previewRows.filter(
    (row) => row.status === "duplicate",
  ).length;

  const errorCount = previewRows.filter(
    (row) => row.status === "error",
  ).length;

  const handleImport = () => {
    if (!selectedFile) {
      setError("اختر ملف Excel أولًا.");
      return;
    }

    if (!showPreview) {
      setError(
        "يجب مراجعة المعاينة قبل اعتماد البيانات.",
      );
      return;
    }

    if (validPreviewRows.length === 0) {
      setError(
        "لا توجد بيانات صالحة يمكن اعتمادها.",
      );
      return;
    }

    setError("");
    setImportStatus("importing");

    window.setTimeout(() => {
      setHistory((current) => [
        {
          id: crypto.randomUUID(),
          fileName: selectedFile.name,
          type: importType,
          date: "26 أغسطس 2026 - الآن",
          records: validPreviewRows.length,
          status: "imported",
        },
        ...current,
      ]);

      setImportStatus("imported");
    }, 700);
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    setPreviewRows([]);
    setShowPreview(false);
    setImportStatus("ready");
    setError("");

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleDownloadTemplate = () => {
    const headers =
      getTemplateHeaders(importType);

    generateTemplate(headers, `template-${importType}.xlsx`);
  };

  const handleExportAllStudents = async () => {
    setExportLoading(true);

    try {
      const students = await studentService.list();
      
      const headers = [
        "اسم الطالب",
        "Student ID",
        "رقم هاتف الطالب",
        "رقم ولي الأمر",
      ];

      const rows = students.map(
        (student) => [
          student.name,
          student.studentId,
          student.phone || "",
          student.guardianPhone,
        ],
      );

      writeExcelFile([headers, ...rows], "all-students.xlsx");
    } catch (error) {
      setError("فشل تصدير بيانات الطلاب");
      console.error("Export error:", error);
    } finally {
      setExportLoading(false);
    }
  };

  const handleExportSelectedStudent = () => {
    if (!selectedStudent) {
      return;
    }

    setExportLoading(true);

    window.setTimeout(() => {
      const headers = [
        "البيانات الأساسية",
        "المصروفات",
        "الدرجات",
        "الحضور",
        "الغياب",
      ];

      const rows = [
        [
          `${selectedStudent.name} - ${selectedStudent.studentId}`,
          "متاحة",
          "متاحة",
          "متاحة",
          "متاحة",
        ],
      ];

      downloadCsv(
        headers,
        `student-${selectedStudent.studentId}.csv`,
        rows,
      );

      setExportLoading(false);
    }, 400);
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
            استيراد وتصدير بيانات المركز بسهولة مع
            مراجعة البيانات قبل اعتمادها.
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
              ارفع الملف ثم راجع المعاينة والطلاب
              المتعرف عليهم والبيانات المكررة أو
              غير المعروفة قبل الاعتماد.
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
              اختر نوع البيانات ثم ارفع ملف Excel.
            </p>
          </div>

          <div className="mb-5 grid gap-4 sm:grid-cols-2">
            {importOptions.map((option) => (
              <ImportType
                key={option.value}
                label={option.label}
                description={option.description}
                active={
                  importType === option.value
                }
                onClick={() => {
                  setImportType(option.value);
                  setSelectedFile(null);
                  setPreviewRows([]);
                  setShowPreview(false);
                  setImportStatus("ready");
                  setError("");

                  if (fileInputRef.current) {
                    fileInputRef.current.value = "";
                  }
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
              تم اعتماد البيانات بنجاح.
            </div>
          )}

          {/* Actions */}

          <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={
                handleDownloadTemplate
              }
              className="h-10 rounded-lg border border-slate-200 bg-white px-4 text-xs font-semibold text-slate-600 transition hover:bg-slate-50"
            >
              تحميل القالب
            </button>

            <button
              type="button"
              disabled={
                !selectedFile ||
                isPreviewLoading
              }
              onClick={createPreview}
              className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-teal-200 bg-teal-50 px-5 text-xs font-semibold text-teal-700 transition hover:bg-teal-100 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400"
            >
              <FiFileText size={15} />

              {isPreviewLoading
                ? "جاري تجهيز المعاينة..."
                : "معاينة البيانات"}
            </button>

            <button
              type="button"
              disabled={
                !selectedFile ||
                !showPreview ||
                importStatus === "importing" ||
                validPreviewRows.length === 0
              }
              onClick={handleImport}
              className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-teal-600 px-5 text-xs font-semibold text-white transition hover:bg-teal-700 disabled:cursor-not-allowed disabled:bg-slate-300"
            >
              <FiCheck size={15} />

              {importStatus === "importing"
                ? "جاري الاعتماد..."
                : "اعتماد البيانات"}
            </button>
          </div>
        </section>

        {/* Preview */}

        {showPreview && (
          <section className="mb-6 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-100 px-5 py-4 sm:px-6">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <h2 className="text-base font-bold text-slate-900">
                    معاينة البيانات
                  </h2>

                  <p className="mt-1 text-xs text-slate-400">
                    راجع النتائج قبل اعتماد الاستيراد.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                  <PreviewStat
                    label="تم التعرف"
                    value={validPreviewRows.length}
                    type="success"
                  />

                  <PreviewStat
                    label="غير معروف"
                    value={unknownCount}
                    type="warning"
                  />

                  <PreviewStat
                    label="مكرر"
                    value={duplicateCount}
                    type="warning"
                  />

                  <PreviewStat
                    label="أخطاء"
                    value={errorCount}
                    type="error"
                  />
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[760px] text-right">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/70">
                    {getPreviewHeaders(importType).map(
                      (header) => (
                        <th
                          key={header}
                          className="px-5 py-3 text-xs font-semibold text-slate-500"
                        >
                          {header}
                        </th>
                      ),
                    )}

                    <th className="px-5 py-3 text-xs font-semibold text-slate-500">
                      الحالة
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {previewRows.length === 0 ? (
                    <tr>
                      <td
                        colSpan={
                          getPreviewHeaders(
                            importType,
                          ).length + 1
                        }
                        className="px-5 py-10 text-center text-xs text-slate-400"
                      >
                        لا توجد بيانات للمعاينة.
                      </td>
                    </tr>
                  ) : (
                    previewRows.map((row) => (
                      <tr
                        key={row.id}
                        className="border-b border-slate-100 last:border-0"
                      >
                        {row.values.map(
                          (value, index) => (
                            <td
                              key={`${row.id}-${index}`}
                              className="px-5 py-4 text-xs text-slate-600"
                            >
                              {value}
                            </td>
                          ),
                        )}

                        <td className="px-5 py-4">
                          <div>
                            <PreviewBadge
                              status={row.status}
                            />

                            {row.message && (
                              <p className="mt-1 text-[10px] text-slate-400">
                                {row.message}
                              </p>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {/* Export All Students */}

        <section className="mb-6 rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="mb-5">
            <h2 className="text-base font-bold text-slate-900">
              تصدير الطلاب
            </h2>

            <p className="mt-1 text-xs text-slate-400">
              تصدير بيانات جميع الطلاب أو طالب محدد.
            </p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-4">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-800">
                  جميع الطلاب
                </h3>

                <p className="mt-1 text-xs text-slate-400">
                  تصدير بيانات جميع الطلاب المسجلين.
                </p>
              </div>

              <button
                type="button"
                disabled={exportLoading}
                onClick={
                  handleExportAllStudents
                }
                className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-teal-600 px-5 text-xs font-semibold text-white transition hover:bg-teal-700 disabled:cursor-not-allowed disabled:bg-slate-300"
              >
                <FiDownload size={15} />

                {exportLoading
                  ? "جاري التصدير..."
                  : "Export All Students"}
              </button>
            </div>
          </div>
        </section>

        {/* Export Selected Student */}

        <section className="mb-6 rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="mb-5">
            <h2 className="text-base font-bold text-slate-900">
              تصدير طالب محدد
            </h2>

            <p className="mt-1 text-xs text-slate-400">
              ابحث بالاسم أو Student ID أو رقم ولي
              الأمر ثم اختر الطالب.
            </p>
          </div>

          <div className="relative">
            <FiSearch
              size={16}
              className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <input
              type="text"
              value={studentSearch}
              onChange={(event) => {
                setStudentSearch(event.target.value);
                setSelectedStudent(null);
              }}
              placeholder="ابحث باسم الطالب أو Student ID أو رقم ولي الأمر..."
              className="h-11 w-full rounded-lg border border-slate-200 bg-white pr-10 pl-4 text-xs text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-teal-400 focus:ring-2 focus:ring-teal-50"
            />
          </div>

          {studentSearch && (
            <div className="mt-3 overflow-hidden rounded-lg border border-slate-200">
              {filteredStudents.length === 0 ? (
                <div className="px-4 py-8 text-center">
                  <FiUser
                    size={20}
                    className="mx-auto text-slate-300"
                  />

                  <p className="mt-2 text-xs font-semibold text-slate-500">
                    لم يتم العثور على طالب.
                  </p>

                  <p className="mt-1 text-[10px] text-slate-400">
                    جرّب الاسم أو Student ID أو رقم ولي
                    الأمر.
                  </p>
                </div>
              ) : (
                filteredStudents.map(
                  (student) => (
                    <button
                      key={student.id}
                      type="button"
                      onClick={() =>
                        setSelectedStudent(
                          student,
                        )
                      }
                      className={[
                        "flex w-full items-center justify-between gap-4 border-b border-slate-100 px-4 py-3 text-right transition last:border-0",
                        selectedStudent?.id ===
                        student.id
                          ? "bg-teal-50"
                          : "hover:bg-slate-50",
                      ].join(" ")}
                    >
                      <div className="flex min-w-0 items-center gap-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-500">
                          <FiUser size={16} />
                        </div>

                        <div className="min-w-0">
                          <p className="truncate text-xs font-semibold text-slate-700">
                            {student.name}
                          </p>

                          <p className="mt-0.5 text-[10px] text-slate-400">
                            {student.studentId}
                          </p>
                        </div>
                      </div>

                      <span className="shrink-0 text-[10px] text-slate-400">
                        {student.guardianPhone}
                      </span>
                    </button>
                  ),
                )
              )}
            </div>
          )}

          {selectedStudent && (
            <div className="mt-4 flex flex-col gap-4 rounded-xl border border-teal-100 bg-teal-50/60 p-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white text-teal-600">
                  <FiUser size={18} />
                </div>

                <div>
                  <p className="text-sm font-bold text-slate-800">
                    {selectedStudent.name}
                  </p>

                  <p className="mt-1 text-[10px] text-slate-400">
                    {selectedStudent.studentId} •{" "}
                    {selectedStudent.guardianPhone}
                  </p>
                </div>
              </div>

              <button
                type="button"
                disabled={exportLoading}
                onClick={
                  handleExportSelectedStudent
                }
                className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-teal-600 px-5 text-xs font-semibold text-white transition hover:bg-teal-700 disabled:cursor-not-allowed disabled:bg-slate-300"
              >
                <FiDownload size={15} />
                تصدير بيانات الطالب
              </button>
            </div>
          )}
        </section>

        {/* History */}

        <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 px-5 py-4">
            <h2 className="text-sm font-bold text-slate-800">
              سجل الاستيراد
            </h2>

            <p className="mt-1 text-xs text-slate-400">
              آخر عمليات استيراد الطلاب والدرجات.
            </p>
          </div>

          {history.length === 0 ? (
            <div className="px-5 py-12 text-center">
              <FiFileText
                size={22}
                className="mx-auto text-slate-300"
              />

              <p className="mt-3 text-xs font-semibold text-slate-500">
                لا توجد عمليات استيراد حتى الآن.
              </p>

              <p className="mt-1 text-[10px] text-slate-400">
                ستظهر عمليات الاستيراد هنا بعد اعتمادها.
              </p>
            </div>
          ) : (
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
                        {item.records}
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
          )}
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
  description,
  active,
  onClick,
  icon,
}: {
  label: string;
  description: string;
  active: boolean;
  onClick: () => void;
  icon: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "flex items-center gap-3 rounded-lg border p-4 text-right transition",
        active
          ? "border-teal-200 bg-teal-50 text-teal-700"
          : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50",
      ].join(" ")}
      aria-pressed={active}
    >
      <span
        className={[
          "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg",
          active
            ? "bg-white text-teal-600"
            : "bg-slate-100 text-slate-500",
        ].join(" ")}
      >
        {icon}
      </span>

      <span className="min-w-0">
        <span className="block text-xs font-semibold">
          {label}
        </span>

        <span className="mt-1 block text-[10px] leading-5 text-slate-400">
          {description}
        </span>
      </span>
    </button>
  );
}

/* -------------------------------------------------------------------------- */
/* Preview Stat                                                               */
/* -------------------------------------------------------------------------- */

function PreviewStat({
  label,
  value,
  type,
}: {
  label: string;
  value: number;
  type: "success" | "warning" | "error";
}) {
  const styles = {
    success:
      "border-emerald-100 bg-emerald-50 text-emerald-700",
    warning:
      "border-amber-100 bg-amber-50 text-amber-700",
    error:
      "border-red-100 bg-red-50 text-red-700",
  };

  return (
    <div
      className={`rounded-lg border px-3 py-2 ${styles[type]}`}
    >
      <p className="text-[10px] font-medium">
        {label}
      </p>

      <p className="mt-0.5 text-sm font-bold">
        {value}
      </p>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Preview Badge                                                              */
/* -------------------------------------------------------------------------- */

function PreviewBadge({
  status,
}: {
  status: PreviewStatus;
}) {
  const styles: Record<
    PreviewStatus,
    string
  > = {
    recognized:
      "bg-emerald-50 text-emerald-700",
    unknown:
      "bg-amber-50 text-amber-700",
    duplicate:
      "bg-orange-50 text-orange-700",
    error:
      "bg-red-50 text-red-700",
  };

  return (
    <span
      className={`rounded-full px-2.5 py-1 text-[10px] font-semibold ${styles[status]}`}
    >
      {previewStatusLabels[status]}
    </span>
  );
}

/* -------------------------------------------------------------------------- */
/* Import Status Badge                                                        */
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
    ready: "bg-slate-100 text-slate-600",
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

function formatFileSize(bytes: number) {
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
      "اسم الطالب",
      "Student ID",
      "رقم هاتف الطالب",
      "رقم ولي الأمر",
      "الصف",
      "المجموعة",
      "العنوان",
      "ملاحظات",
    ],
    grades: [
      "Student ID",
      "اسم الطالب",
      "الدرجة",
      "الدرجة النهائية",
    ],
  };

  return templates[type];
}

function getPreviewHeaders(
  type: ImportType,
) {
  if (type === "students") {
    return [
      "اسم الطالب",
      "Student ID",
      "رقم الهاتف",
      "رقم ولي الأمر",
    ];
  }

  return [
    "Student ID",
    "اسم الطالب",
    "الدرجة",
    "الدرجة النهائية",
  ];
}

function downloadCsv(
  headers: string[],
  fileName: string,
  rows: string[][] = [],
) {
  const csvRows = [
    headers,
    ...rows,
  ];

  const csvContent =
    "\uFEFF" +
    csvRows
      .map((row) =>
        row
          .map((value) =>
            escapeCsvValue(value),
          )
          .join(","),
      )
      .join("\n");

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

function escapeCsvValue(value: string) {
  return `"${value.replaceAll(
    '"',
    '""',
  )}"`;
}