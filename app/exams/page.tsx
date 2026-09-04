
"use client";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type FormEvent,
  type ReactNode,
} from "react";

import {
  FiAlertCircle,
  FiAward,
  FiCalendar,
  FiCheck,
  FiCheckCircle,
  FiChevronDown,
  FiClock,
  FiDownload,
  FiEdit2,
  FiEye,
  FiFileText,
  FiPlus,
  FiSearch,
  FiSend,
  FiUpload,
  FiUsers,
  FiX,
  FiXCircle,
} from "react-icons/fi";

import type { Exam, Grade } from "@/types/exam";
import { examService } from "@/services";
import LoadingState from "@/components/common/LoadingState";

type Student = {
  id: string;
  studentId: string;
  name: string;
  phone: string;
  guardianPhone: string;
  grade: string;
  groupId: string;
};

type ExamForm = {
  name: string;
  subject: string;
  groupId: string;
  maxScore: string;
  date: string;
};

type ImportStatus =
  | "recognized"
  | "unknown"
  | "duplicate"
  | "invalid";

type ImportRow = {
  id: string;
  studentId: string;
  studentName: string;
  score: string;
  status: ImportStatus;
  message: string;
};

type WhatsAppStatus =
  | "not_sent"
  | "pending"
  | "sent"
  | "failed";

const GROUPS = [
  {
    id: "group-1",
    name: "الصف الثالث الثانوي",
  },
  {
    id: "group-2",
    name: "الصف الثاني الثانوي",
  },
  {
    id: "group-3",
    name: "الصف الأول الثانوي",
  },
];

const MOCK_STUDENTS: Student[] = [
  {
    id: "student-1",
    studentId: "ST-1001",
    name: "أحمد محمد",
    phone: "01000000001",
    guardianPhone: "01000000101",
    grade: "الثالث الثانوي",
    groupId: "group-1",
  },
  {
    id: "student-2",
    studentId: "ST-1002",
    name: "محمد علي",
    phone: "01000000002",
    guardianPhone: "01000000102",
    grade: "الثالث الثانوي",
    groupId: "group-1",
  },
  {
    id: "student-3",
    studentId: "ST-1003",
    name: "يوسف أحمد",
    phone: "01000000003",
    guardianPhone: "01000000103",
    grade: "الثالث الثانوي",
    groupId: "group-1",
  },
  {
    id: "student-4",
    studentId: "ST-1004",
    name: "عمر خالد",
    phone: "01000000004",
    guardianPhone: "01000000104",
    grade: "الثالث الثانوي",
    groupId: "group-1",
  },
  {
    id: "student-5",
    studentId: "ST-2001",
    name: "كريم محمود",
    phone: "01000000005",
    guardianPhone: "01000000201",
    grade: "الثاني الثانوي",
    groupId: "group-2",
  },
  {
    id: "student-6",
    studentId: "ST-2002",
    name: "حسن أحمد",
    phone: "01000000006",
    guardianPhone: "01000000202",
    grade: "الثاني الثانوي",
    groupId: "group-2",
  },
];

const EMPTY_FORM: ExamForm = {
  name: "",
  subject: "",
  groupId: "",
  maxScore: "",
  date: "",
};

function formatDate(date: string) {
  if (!date) return "—";

  const value = new Date(date);

  if (Number.isNaN(value.getTime())) {
    return date;
  }

  return new Intl.DateTimeFormat("ar-EG", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(value);
}

function getGroupName(groupId: string) {
  return (
    GROUPS.find((group) => group.id === groupId)?.name ??
    "مجموعة غير معروفة"
  );
}

function getImportStatusLabel(status: ImportStatus) {
  switch (status) {
    case "recognized":
      return "تم التعرف";
    case "unknown":
      return "طالب غير معروف";
    case "duplicate":
      return "بيانات مكررة";
    case "invalid":
      return "خطأ في الدرجة";
    default:
      return "غير معروف";
  }
}

function getWhatsAppStatusLabel(status: WhatsAppStatus) {
  switch (status) {
    case "pending":
      return "Pending";
    case "sent":
      return "Sent";
    case "failed":
      return "Failed";
    default:
      return "لم يتم الإرسال";
  }
}

export default function ExamsPage() {
  const [exams, setExams] = useState<Exam[]>([]);
  const [grades, setGrades] = useState<Grade[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [selectedExamId, setSelectedExamId] = useState<string | null>(
    null
  );

  const [search, setSearch] = useState("");
  const [groupFilter, setGroupFilter] = useState("all");

  const [showExamModal, setShowExamModal] = useState(false);
  const [showGradesModal, setShowGradesModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [showApprovalModal, setShowApprovalModal] = useState(false);

  const [examForm, setExamForm] = useState<ExamForm>(EMPTY_FORM);
  const [isSaving, setIsSaving] = useState(false);

  const [importRows, setImportRows] = useState<ImportRow[]>([]);
  const [fileName, setFileName] = useState("");

  const [whatsappStatuses, setWhatsappStatuses] = useState<
    Record<string, WhatsAppStatus>
  >({});

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    let mounted = true;

    const loadData = async () => {
      try {
        const [examList, gradeList] = await Promise.all([
          examService.list(),
          examService.grades(),
        ]);

        if (mounted) {
          setExams(examList);
          setGrades(gradeList);
          setSelectedExamId(examList[0]?.id ?? null);
        }
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    void loadData();

    return () => {
      mounted = false;
    };
  }, []);

  const selectedExam = useMemo(
    () => exams.find((exam) => exam.id === selectedExamId) ?? null,
    [exams, selectedExamId]
  );

  const selectedExamGrades = useMemo(() => {
    if (!selectedExam) return [];

    return grades.filter(
      (grade) => grade.examId === selectedExam.id
    );
  }, [grades, selectedExam]);

  const selectedExamStudents = useMemo(() => {
    if (!selectedExam) return [];

    return MOCK_STUDENTS.filter(
      (student) => student.groupId === selectedExam.groupId
    );
  }, [selectedExam]);

  const examRows = useMemo(() => {
    if (!selectedExam) return [];

    return selectedExamStudents.map((student) => {
      const grade = selectedExamGrades.find(
        (item) => item.studentId === student.id
      );

      return {
        student,
        grade,
      };
    });
  }, [
    selectedExam,
    selectedExamGrades,
    selectedExamStudents,
  ]);

  const filteredExams = useMemo(() => {
    const query = search.trim().toLowerCase();

    return exams.filter((exam) => {
      const matchesSearch =
        !query ||
        exam.name.toLowerCase().includes(query) ||
        exam.subject.toLowerCase().includes(query);

      const matchesGroup =
        groupFilter === "all" ||
        exam.groupId === groupFilter;

      return matchesSearch && matchesGroup;
    });
  }, [exams, search, groupFilter]);

  const enteredGradesCount = examRows.filter(
    ({ grade }) =>
      grade?.score !== null &&
      grade?.score !== undefined
  ).length;

  const pendingGradesCount =
    examRows.length - enteredGradesCount;

  const hasApprovedGrades =
    examRows.length > 0 &&
    examRows.every(
      ({ grade }) => grade?.status === "approved"
    );

  function openCreateExam() {
    setExamForm(EMPTY_FORM);
    setShowExamModal(true);
  }

  function handleExamFormChange(
    field: keyof ExamForm,
    value: string
  ) {
    setExamForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  async function handleCreateExam(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    const maxScore = Number(examForm.maxScore);

    if (
      !examForm.name.trim() ||
      !examForm.subject.trim() ||
      !examForm.groupId ||
      !examForm.date ||
      !Number.isFinite(maxScore) ||
      maxScore <= 0
    ) {
      return;
    }

    setIsSaving(true);

    try {
      const newExam = await examService.create({
        name: examForm.name.trim(),
        subject: examForm.subject.trim(),
        groupId: examForm.groupId,
        maxScore,
        date: examForm.date,
      });

      setExams((current) => [newExam, ...current]);
      setSelectedExamId(newExam.id);
    } finally {
      setIsSaving(false);
      setShowExamModal(false);
      setExamForm(EMPTY_FORM);
    }
  }

  async function updateGrade(
    studentId: string,
    value: string
  ) {
    if (!selectedExam) return;

    const gradeValue =
      value.trim() === "" ? null : Number(value);

    if (
      gradeValue !== null &&
      (!Number.isFinite(gradeValue) ||
        gradeValue < 0 ||
        gradeValue > selectedExam.maxScore)
    ) {
      return;
    }

    const existing = grades.find(
      (grade) =>
        grade.examId === selectedExam.id &&
        grade.studentId === studentId
    );

    try {
      if (existing) {
        const updated = await examService.updateGrade(
          existing.id,
          {
            score: gradeValue,
            status: "pending",
          }
        );

        if (updated) {
          setGrades((current) =>
            current.map((grade) =>
              grade.id === updated.id ? updated : grade
            )
          );
        }
      } else {
        const created = await examService.createGrade({
          examId: selectedExam.id,
          studentId,
          score: gradeValue,
          status: "pending",
        });

        setGrades((current) => [...current, created]);
      }
    } catch {
      // Persistence is best-effort; the UI remains the source of truth.
    }
  }

  function openGrades(exam: Exam) {
    setSelectedExamId(exam.id);
    setShowGradesModal(true);
  }

  async function approveResults() {
    if (!selectedExam) return;

    const currentRows = selectedExamStudents.map((student) => {
      const grade = grades.find(
        (item) =>
          item.examId === selectedExam.id &&
          item.studentId === student.id
      );

      return {
        student,
        grade,
      };
    });

    const allEntered = currentRows.every(
      ({ grade }) =>
        grade?.score !== null &&
        grade?.score !== undefined
    );

    if (!allEntered) {
      return;
    }

    const examGrades = grades.filter(
      (grade) => grade.examId === selectedExam.id
    );

    await Promise.all(
      examGrades.map((grade) =>
        examService.updateGrade(grade.id, {
          status: "approved",
        })
      )
    );

    setGrades((current) =>
      current.map((grade) =>
        grade.examId === selectedExam.id
          ? {
              ...grade,
              status: "approved",
            }
          : grade
      )
    );

    setWhatsappStatuses((current) => ({
      ...current,
      [selectedExam.id]: "pending",
    }));

    setShowApprovalModal(false);
  }

  function handleImportClick() {
    setImportRows([]);
    setFileName("");
    setShowImportModal(true);
  }

  function handleFileChange(
    event: ChangeEvent<HTMLInputElement>
  ) {
    const file = event.target.files?.[0];

    if (!file || !selectedExam) {
      return;
    }

    setFileName(file.name);

    const preview: ImportRow[] = [
      {
        id: "import-1",
        studentId: "ST-1001",
        studentName: "أحمد محمد",
        score: "45",
        status: "recognized",
        message: "تم التعرف على الطالب بنجاح",
      },
      {
        id: "import-2",
        studentId: "ST-1002",
        studentName: "محمد علي",
        score: "42",
        status: "recognized",
        message: "تم التعرف على الطالب بنجاح",
      },
      {
        id: "import-3",
        studentId: "ST-9999",
        studentName: "طالب غير موجود",
        score: "40",
        status: "unknown",
        message: "رقم الطالب غير موجود في المجموعة",
      },
      {
        id: "import-4",
        studentId: "ST-1003",
        studentName: "يوسف أحمد",
        score: String(selectedExam.maxScore + 5),
        status: "invalid",
        message: `الدرجة أكبر من الدرجة النهائية (${selectedExam.maxScore})`,
      },
      {
        id: "import-5",
        studentId: "ST-1002",
        studentName: "محمد علي",
        score: "42",
        status: "duplicate",
        message: "الطالب موجود أكثر من مرة في الملف",
      },
    ];

    setImportRows(preview);
  }

  async function applyImport() {
    if (!selectedExam) return;

    const validRows = importRows.filter(
      (row) => row.status === "recognized"
    );

    for (const row of validRows) {
      const student = MOCK_STUDENTS.find(
        (item) => item.studentId === row.studentId
      );

      if (!student) continue;

      const score = Number(row.score);

      const existingIndex = grades.findIndex(
        (grade) =>
          grade.examId === selectedExam.id &&
          grade.studentId === student.id
      );

      if (existingIndex >= 0) {
        const updated = await examService.updateGrade(
          grades[existingIndex].id,
          {
            score,
            status: "pending",
          }
        );

        if (updated) {
          setGrades((current) =>
            current.map((grade) =>
              grade.id === updated.id ? updated : grade
            )
          );
        }
      } else {
        const created = await examService.createGrade({
          examId: selectedExam.id,
          studentId: student.id,
          score,
          status: "pending",
        });

        setGrades((current) => [...current, created]);
      }
    }

    setShowImportModal(false);
  }

  function sendWhatsApp() {
    if (!selectedExam || !hasApprovedGrades) {
      return;
    }

    setWhatsappStatuses((current) => ({
      ...current,
      [selectedExam.id]: "sent",
    }));
  }

  function exportResults() {
    if (!selectedExam) return;

    const header = [
      "Student ID",
      "اسم الطالب",
      "المجموعة",
      "الدرجة",
      "الدرجة النهائية",
    ];

    const rows = examRows.map(({ student, grade }) => [
      student.studentId,
      student.name,
      getGroupName(student.groupId),
      grade?.score ?? "",
      selectedExam.maxScore,
    ]);

    const csv = [header, ...rows]
      .map((row) =>
        row
          .map((cell) =>
            `"${String(cell).replace(/"/g, '""')}"`
          )
          .join(",")
      )
      .join("\n");

    const blob = new Blob(["\uFEFF" + csv], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");

    anchor.href = url;
    anchor.download = `${selectedExam.name}-grades.csv`;
    anchor.click();

    URL.revokeObjectURL(url);
  }

  return (
    <main
      dir="rtl"
      className="min-h-screen bg-slate-50 px-4 py-5 text-slate-900 sm:px-6 lg:px-8"
    >
      <div className="mx-auto max-w-[1500px]">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="mb-2 flex items-center gap-2 text-xs font-medium text-slate-500">
              <FiFileText />
              الامتحانات والدرجات
            </div>

            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              الامتحانات والدرجات
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              إنشاء الامتحانات وإدخال درجات الطلاب واعتماد النتائج.
            </p>
          </div>

          <button
            type="button"
            onClick={openCreateExam}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-slate-900 px-5 text-sm font-semibold text-white transition hover:bg-slate-800"
          >
            <FiPlus size={18} />
            إنشاء امتحان جديد
          </button>
        </div>

        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <SummaryCard
            icon={<FiFileText />}
            label="إجمالي الامتحانات"
            value={exams.length}
          />

          <SummaryCard
            icon={<FiUsers />}
            label="طلاب الامتحان المحدد"
            value={selectedExamStudents.length}
          />

          <SummaryCard
            icon={<FiAward />}
            label="درجات تم إدخالها"
            value={enteredGradesCount}
          />
        </div>

        <div className="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1fr)_380px]">
          <section className="min-w-0 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-100 p-4 sm:p-5">
              <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <h2 className="text-base font-bold text-slate-900">
                    قائمة الامتحانات
                  </h2>

                  <p className="mt-1 text-xs text-slate-500">
                    اختر الامتحان لإدخال أو مراجعة درجات الطلاب.
                  </p>
                </div>

                <div className="flex flex-col gap-2 sm:flex-row">
                  <div className="relative">
                    <FiSearch
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
                      size={16}
                    />

                    <input
                      value={search}
                      onChange={(event) =>
                        setSearch(event.target.value)
                      }
                      placeholder="بحث عن امتحان..."
                      className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50 pr-9 pl-3 text-sm outline-none focus:border-slate-400 focus:bg-white sm:w-60"
                    />
                  </div>

                  <div className="relative">
                    <select
                      value={groupFilter}
                      onChange={(event) =>
                        setGroupFilter(event.target.value)
                      }
                      className="h-10 w-full appearance-none rounded-xl border border-slate-200 bg-slate-50 px-3 pl-9 text-xs font-medium text-slate-600 outline-none focus:border-slate-400 focus:bg-white sm:w-48"
                    >
                      <option value="all">
                        كل المجموعات
                      </option>

                      {GROUPS.map((group) => (
                        <option
                          key={group.id}
                          value={group.id}
                        >
                          {group.name}
                        </option>
                      ))}
                    </select>

                    <FiChevronDown
                      size={14}
                      className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                    />
                  </div>
                </div>
              </div>
            </div>

            {isLoading ? (
              <LoadingState label="جاري تحميل الامتحانات..." />
            ) : filteredExams.length === 0 ? (
              <EmptyState />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[780px]">
                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50 text-right text-xs font-semibold text-slate-500">
                      <th className="px-5 py-3.5">
                        الامتحان
                      </th>
                      <th className="px-4 py-3.5">
                        المجموعة
                      </th>
                      <th className="px-4 py-3.5">
                        الدرجة النهائية
                      </th>
                      <th className="px-4 py-3.5">
                        التاريخ
                      </th>
                      <th className="px-4 py-3.5">
                        حالة النتائج
                      </th>
                      <th className="px-5 py-3.5 text-left">
                        الإجراء
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-100">
                    {filteredExams.map((exam) => {
                      const examGrades = grades.filter(
                        (grade) =>
                          grade.examId === exam.id
                      );

                      const studentCount =
                        MOCK_STUDENTS.filter(
                          (student) =>
                            student.groupId === exam.groupId
                        ).length;

                      const entered =
                        examGrades.filter(
                          (grade) =>
                            grade.score !== null
                        ).length;

                      const approved =
                        examGrades.length > 0 &&
                        examGrades.every(
                          (grade) =>
                            grade.status === "approved"
                        );

                      return (
                        <tr
                          key={exam.id}
                          className={`transition hover:bg-slate-50 ${
                            selectedExamId === exam.id
                              ? "bg-slate-50"
                              : ""
                          }`}
                        >
                          <td className="px-5 py-4">
                            <button
                              type="button"
                              onClick={() =>
                                setSelectedExamId(exam.id)
                              }
                              className="text-right"
                            >
                              <p className="text-sm font-semibold text-slate-800">
                                {exam.name}
                              </p>

                              <p className="mt-1 text-xs text-slate-500">
                                {exam.subject}
                              </p>
                            </button>
                          </td>

                          <td className="px-4 py-4 text-sm text-slate-600">
                            {getGroupName(exam.groupId)}
                          </td>

                          <td className="px-4 py-4 text-sm font-semibold text-slate-700">
                            {exam.maxScore}
                          </td>

                          <td className="px-4 py-4 text-sm text-slate-600">
                            {formatDate(exam.date)}
                          </td>

                          <td className="px-4 py-4">
                            <div className="flex flex-col gap-1">
                              <span
                                className={`inline-flex w-fit items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold ${
                                  approved
                                    ? "bg-emerald-50 text-emerald-700"
                                    : entered === studentCount
                                    ? "bg-amber-50 text-amber-700"
                                    : "bg-slate-100 text-slate-500"
                                }`}
                              >
                                {approved ? (
                                  <FiCheckCircle />
                                ) : (
                                  <FiClock />
                                )}

                                {approved
                                  ? "معتمد"
                                  : entered === studentCount
                                  ? "جاهز للاعتماد"
                                  : "درجات ناقصة"}
                              </span>

                              <span className="text-[10px] text-slate-400">
                                {entered} / {studentCount}
                              </span>
                            </div>
                          </td>

                          <td className="px-5 py-4">
                            <div className="flex justify-end">
                              <button
                                type="button"
                                onClick={() =>
                                  openGrades(exam)
                                }
                                className="inline-flex h-9 items-center gap-2 rounded-lg border border-slate-200 px-3 text-xs font-semibold text-slate-600 transition hover:bg-slate-50 hover:text-slate-900"
                              >
                                <FiEye />
                                عرض الدرجات
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </section>

          <aside className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            {!selectedExam ? (
              <EmptySelectedExam />
            ) : (
              <>
                <div className="border-b border-slate-100 p-5">
                  <div className="mb-4 flex items-start justify-between gap-3">
                    <div>
                      <p className="mb-2 text-xs font-medium text-slate-400">
                        الامتحان المحدد
                      </p>

                      <h2 className="text-lg font-bold text-slate-900">
                        {selectedExam.name}
                      </h2>

                      <p className="mt-1 text-sm text-slate-500">
                        {selectedExam.subject}
                      </p>
                    </div>

                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
                      <FiAward />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <DetailItem
                      icon={<FiUsers />}
                      label="المجموعة"
                      value={getGroupName(selectedExam.groupId)}
                    />

                    <DetailItem
                      icon={<FiCalendar />}
                      label="التاريخ"
                      value={formatDate(selectedExam.date)}
                    />

                    <DetailItem
                      icon={<FiAward />}
                      label="الدرجة النهائية"
                      value={`${selectedExam.maxScore}`}
                    />

                    <DetailItem
                      icon={<FiFileText />}
                      label="عدد الطلاب"
                      value={`${selectedExamStudents.length}`}
                    />
                  </div>
                </div>

                <div className="p-5">
                  <div className="mb-4">
                    <div className="mb-2 flex items-center justify-between">
                      <span className="text-xs font-semibold text-slate-700">
                        تقدم إدخال الدرجات
                      </span>

                      <span className="text-xs text-slate-400">
                        {enteredGradesCount} / {examRows.length}
                      </span>
                    </div>

                    <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                      <div
                        className="h-full rounded-full bg-slate-800 transition-all"
                        style={{
                          width: `${
                            examRows.length
                              ? (enteredGradesCount /
                                  examRows.length) *
                                100
                              : 0
                          }%`,
                        }}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <button
                      type="button"
                      onClick={() =>
                        setShowGradesModal(true)
                      }
                      className="flex h-11 w-full items-center justify-between rounded-xl border border-slate-200 px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                    >
                      <span className="flex items-center gap-2">
                        <FiEdit2 />
                        إدخال الدرجات يدويًا
                      </span>

                      <FiChevronDown className="rotate-90 text-slate-400" />
                    </button>

                    <button
                      type="button"
                      onClick={handleImportClick}
                      className="flex h-11 w-full items-center justify-between rounded-xl border border-slate-200 px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                    >
                      <span className="flex items-center gap-2">
                        <FiUpload />
                        استيراد درجات Excel
                      </span>

                      <FiChevronDown className="rotate-90 text-slate-400" />
                    </button>

                    <button
                      type="button"
                      onClick={exportResults}
                      className="flex h-11 w-full items-center justify-between rounded-xl border border-slate-200 px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                    >
                      <span className="flex items-center gap-2">
                        <FiDownload />
                        تصدير النتائج
                      </span>

                      <FiChevronDown className="rotate-90 text-slate-400" />
                    </button>
                  </div>

                  <div className="my-5 border-t border-slate-100" />

                  <div className="mb-3">
                    <p className="text-xs font-semibold text-slate-700">
                      اعتماد النتائج
                    </p>

                    <p className="mt-1 text-[11px] leading-5 text-slate-400">
                      يجب إدخال درجات جميع الطلاب قبل اعتماد
                      النتائج.
                    </p>
                  </div>

                  <button
                    type="button"
                    disabled={
                      pendingGradesCount > 0 ||
                      hasApprovedGrades
                    }
                    onClick={() =>
                      setShowApprovalModal(true)
                    }
                    className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400"
                  >
                    <FiCheckCircle />

                    {hasApprovedGrades
                      ? "تم اعتماد النتائج"
                      : "اعتماد النتائج"}
                  </button>

                  {hasApprovedGrades && (
                    <div className="mt-4 rounded-xl border border-emerald-100 bg-emerald-50 p-3">
                      <div className="flex items-start gap-2">
                        <FiCheckCircle className="mt-0.5 shrink-0 text-emerald-600" />

                        <div>
                          <p className="text-xs font-semibold text-emerald-800">
                            تم اعتماد النتائج
                          </p>

                          <p className="mt-1 text-[11px] leading-5 text-emerald-700">
                            أصبحت النتائج جاهزة لحالة إرسال
                            WhatsApp.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {hasApprovedGrades && (
                    <div className="mt-3">
                      <div className="mb-2 flex items-center justify-between">
                        <span className="text-xs font-semibold text-slate-700">
                          WhatsApp لولي الأمر
                        </span>

                        <span
                          className={`text-xs font-semibold ${
                            whatsappStatuses[selectedExam.id] ===
                            "sent"
                              ? "text-emerald-600"
                              : "text-amber-600"
                          }`}
                        >
                          {getWhatsAppStatusLabel(
                            whatsappStatuses[selectedExam.id] ??
                              "not_sent"
                          )}
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={sendWhatsApp}
                        disabled={
                          whatsappStatuses[selectedExam.id] ===
                          "sent"
                        }
                        className="flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 text-sm font-semibold text-emerald-700 transition hover:bg-emerald-100 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {whatsappStatuses[selectedExam.id] ===
                        "sent" ? (
                          <>
                            <FiCheckCircle />
                            تم الإرسال
                          </>
                        ) : (
                          <>
                            <FiSend />
                            إرسال حالة النتائج
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </div>
              </>
            )}
          </aside>
        </div>
      </div>

      {showExamModal && (
        <Modal
          title="إنشاء امتحان جديد"
          description="أدخل البيانات الأساسية للامتحان."
          onClose={() => setShowExamModal(false)}
        >
          <form
            onSubmit={handleCreateExam}
            className="space-y-4"
          >
            <InputField
              label="اسم الامتحان"
              value={examForm.name}
              onChange={(value) =>
                handleExamFormChange("name", value)
              }
              placeholder="مثال: اختبار الشهر الأول"
              required
            />

            <InputField
              label="المادة"
              value={examForm.subject}
              onChange={(value) =>
                handleExamFormChange("subject", value)
              }
              placeholder="مثال: الرياضيات"
              required
            />

            <SelectField
              label="المجموعة"
              value={examForm.groupId}
              onChange={(value) =>
                handleExamFormChange("groupId", value)
              }
              options={GROUPS.map((group) => ({
                value: group.id,
                label: group.name,
              }))}
              placeholder="اختر المجموعة"
              required
            />

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <InputField
                label="الدرجة النهائية"
                type="number"
                min="1"
                value={examForm.maxScore}
                onChange={(value) =>
                  handleExamFormChange("maxScore", value)
                }
                placeholder="50"
                required
              />

              <InputField
                label="تاريخ الامتحان"
                type="date"
                value={examForm.date}
                onChange={(value) =>
                  handleExamFormChange("date", value)
                }
                required
              />
            </div>

            <div className="flex flex-col-reverse gap-2 border-t border-slate-100 pt-4 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() =>
                  setShowExamModal(false)
                }
                className="h-11 rounded-xl border border-slate-200 px-5 text-sm font-semibold text-slate-600 hover:bg-slate-50"
              >
                إلغاء
              </button>

              <button
                type="submit"
                disabled={isSaving}
                className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-slate-900 px-5 text-sm font-semibold text-white disabled:opacity-50"
              >
                {isSaving ? (
                  <>
                    <FiClock className="animate-spin" />
                    جاري الإنشاء...
                  </>
                ) : (
                  <>
                    <FiCheck />
                    إنشاء الامتحان
                  </>
                )}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {showGradesModal && selectedExam && (
        <Modal
          wide
          title="إدخال درجات الطلاب"
          description={`${selectedExam.name} — الدرجة النهائية ${selectedExam.maxScore}`}
          onClose={() => setShowGradesModal(false)}
        >
          <div className="mb-4 flex flex-col gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-semibold text-slate-800">
                إدخال الدرجات يدويًا
              </p>

              <p className="mt-1 text-xs text-slate-500">
                الدرجة يجب أن تكون من 0 إلى{" "}
                {selectedExam.maxScore}.
              </p>
            </div>

            <div className="text-xs text-slate-500">
              تم إدخال{" "}
              <span className="font-bold text-slate-800">
                {enteredGradesCount}
              </span>{" "}
              من{" "}
              <span className="font-bold text-slate-800">
                {examRows.length}
              </span>
            </div>
          </div>

          {examRows.length === 0 ? (
            <EmptyGrades />
          ) : (
            <div className="overflow-hidden rounded-xl border border-slate-200">
              <div className="max-h-[55vh] overflow-auto">
                <table className="w-full min-w-[700px]">
                  <thead className="sticky top-0 z-10 bg-slate-50">
                    <tr className="border-b border-slate-200 text-right text-xs font-semibold text-slate-500">
                      <th className="px-4 py-3">
                        رقم الطالب
                      </th>
                      <th className="px-4 py-3">
                        اسم الطالب
                      </th>
                      <th className="px-4 py-3">
                        الدرجة
                      </th>
                      <th className="px-4 py-3">
                        الحالة
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-100">
                    {examRows.map(
                      ({ student, grade }) => (
                        <tr
                          key={student.id}
                          className="hover:bg-slate-50"
                        >
                          <td className="px-4 py-3 text-sm font-medium text-slate-600">
                            {student.studentId}
                          </td>

                          <td className="px-4 py-3 text-sm font-semibold text-slate-800">
                            {student.name}
                          </td>

                          <td className="px-4 py-3">
                            <input
                              type="number"
                              min="0"
                              max={selectedExam.maxScore}
                              step="0.5"
                              value={grade?.score ?? ""}
                              disabled={
                                grade?.status === "approved"
                              }
                              onChange={(event) =>
                                updateGrade(
                                  student.id,
                                  event.target.value
                                )
                              }
                              placeholder={`/ ${selectedExam.maxScore}`}
                              className="h-9 w-28 rounded-lg border border-slate-200 bg-white px-3 text-sm font-semibold outline-none focus:border-slate-400 disabled:bg-slate-100 disabled:text-slate-400"
                            />
                          </td>

                          <td className="px-4 py-3">
                            {grade?.status ===
                            "approved" ? (
                              <span className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-50 px-2.5 py-1.5 text-xs font-semibold text-emerald-700">
                                <FiCheckCircle />
                                معتمد
                              </span>
                            ) : grade?.score !== null &&
                              grade?.score !== undefined ? (
                              <span className="inline-flex items-center gap-1.5 rounded-lg bg-amber-50 px-2.5 py-1.5 text-xs font-semibold text-amber-700">
                                <FiClock />
                                في انتظار الاعتماد
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1.5 rounded-lg bg-slate-100 px-2.5 py-1.5 text-xs font-semibold text-slate-500">
                                لم يتم الإدخال
                              </span>
                            )}
                          </td>
                        </tr>
                      )
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={() =>
                setShowGradesModal(false)
              }
              className="h-11 rounded-xl border border-slate-200 px-5 text-sm font-semibold text-slate-600 hover:bg-slate-50"
            >
              إغلاق
            </button>

            <button
              type="button"
              disabled={
                pendingGradesCount > 0 ||
                hasApprovedGrades
              }
              onClick={() => {
                setShowGradesModal(false);
                setShowApprovalModal(true);
              }}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-slate-900 px-5 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400"
            >
              <FiCheckCircle />
              اعتماد النتائج
            </button>
          </div>
        </Modal>
      )}

      {showImportModal && selectedExam && (
        <Modal
          wide
          title="استيراد درجات Excel"
          description="ارفع الملف وراجع البيانات قبل اعتمادها."
          onClose={() => setShowImportModal(false)}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".xlsx,.xls,.csv"
            className="hidden"
            onChange={handleFileChange}
          />

          <button
            type="button"
            onClick={() =>
              fileInputRef.current?.click()
            }
            className="mb-5 flex min-h-[140px] w-full flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 px-5 text-center transition hover:border-slate-300 hover:bg-white"
          >
            <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-white text-slate-600 shadow-sm">
              <FiUpload size={20} />
            </div>

            <p className="text-sm font-semibold text-slate-800">
              {fileName || "اختيار ملف Excel"}
            </p>

            <p className="mt-1 text-xs text-slate-500">
              XLSX / XLS / CSV
            </p>
          </button>

          {importRows.length === 0 ? (
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-5 text-center">
              <FiFileText className="mx-auto mb-2 text-slate-300" />

              <p className="text-sm font-semibold text-slate-700">
                Preview
              </p>

              <p className="mt-1 text-xs text-slate-500">
                ستظهر نتيجة فحص الملف هنا قبل حفظ الدرجات.
              </p>
            </div>
          ) : (
            <>
              <div className="mb-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
                <ImportSummary
                  label="تم التعرف"
                  value={
                    importRows.filter(
                      (row) =>
                        row.status === "recognized"
                    ).length
                  }
                  type="success"
                />

                <ImportSummary
                  label="غير معروف"
                  value={
                    importRows.filter(
                      (row) =>
                        row.status === "unknown"
                    ).length
                  }
                  type="warning"
                />

                <ImportSummary
                  label="مكرر"
                  value={
                    importRows.filter(
                      (row) =>
                        row.status === "duplicate"
                    ).length
                  }
                  type="danger"
                />

                <ImportSummary
                  label="أخطاء الدرجات"
                  value={
                    importRows.filter(
                      (row) =>
                        row.status === "invalid"
                    ).length
                  }
                  type="danger"
                />
              </div>

              <div className="overflow-hidden rounded-xl border border-slate-200">
                <div className="max-h-[45vh] overflow-auto">
                  <table className="w-full min-w-[760px]">
                    <thead className="sticky top-0 z-10 bg-slate-50">
                      <tr className="border-b border-slate-200 text-right text-xs font-semibold text-slate-500">
                        <th className="px-4 py-3">
                          Student ID
                        </th>
                        <th className="px-4 py-3">
                          الطالب
                        </th>
                        <th className="px-4 py-3">
                          الدرجة
                        </th>
                        <th className="px-4 py-3">
                          الحالة
                        </th>
                        <th className="px-4 py-3">
                          الملاحظة
                        </th>
                      </tr>
                    </thead>

                    <tbody className="divide-y divide-slate-100">
                      {importRows.map((row) => (
                        <tr
                          key={row.id}
                          className="hover:bg-slate-50"
                        >
                          <td className="px-4 py-3 text-sm font-medium text-slate-600">
                            {row.studentId}
                          </td>

                          <td className="px-4 py-3 text-sm font-semibold text-slate-800">
                            {row.studentName}
                          </td>

                          <td className="px-4 py-3 text-sm font-semibold text-slate-700">
                            {row.score}
                          </td>

                          <td className="px-4 py-3">
                            <ImportBadge
                              status={row.status}
                            />
                          </td>

                          <td className="px-4 py-3 text-xs text-slate-500">
                            {row.message}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}

          <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={() =>
                setShowImportModal(false)
              }
              className="h-11 rounded-xl border border-slate-200 px-5 text-sm font-semibold text-slate-600 hover:bg-slate-50"
            >
              إلغاء
            </button>

            <button
              type="button"
              disabled={
                !importRows.some(
                  (row) =>
                    row.status === "recognized"
                )
              }
              onClick={applyImport}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-slate-900 px-5 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400"
            >
              <FiCheck />
              تطبيق الدرجات الصحيحة
            </button>
          </div>
        </Modal>
      )}

      {showApprovalModal && selectedExam && (
        <Modal
          title="اعتماد النتائج"
          description="تأكد من صحة جميع الدرجات قبل الاعتماد."
          onClose={() =>
            setShowApprovalModal(false)
          }
        >
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <div className="mb-4">
              <p className="text-sm font-bold text-slate-900">
                {selectedExam.name}
              </p>

              <p className="mt-1 text-xs text-slate-500">
                {selectedExam.subject} ·{" "}
                {getGroupName(selectedExam.groupId)}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <ConfirmItem
                label="عدد الطلاب"
                value={String(examRows.length)}
              />

              <ConfirmItem
                label="الدرجات المدخلة"
                value={String(enteredGradesCount)}
              />

              <ConfirmItem
                label="الدرجة النهائية"
                value={String(selectedExam.maxScore)}
              />

              <ConfirmItem
                label="المتبقي"
                value={String(pendingGradesCount)}
              />
            </div>
          </div>

          <div className="mt-4 rounded-xl border border-amber-100 bg-amber-50 p-3">
            <div className="flex items-start gap-2">
              <FiAlertCircle className="mt-0.5 shrink-0 text-amber-600" />

              <p className="text-xs leading-5 text-amber-800">
                بعد اعتماد النتائج ستظهر حالة إرسال WhatsApp
                لولي الأمر.
              </p>
            </div>
          </div>

          <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={() =>
                setShowApprovalModal(false)
              }
              className="h-11 rounded-xl border border-slate-200 px-5 text-sm font-semibold text-slate-600 hover:bg-slate-50"
            >
              إلغاء
            </button>

            <button
              type="button"
              disabled={pendingGradesCount > 0}
              onClick={approveResults}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-slate-900 px-5 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400"
            >
              <FiCheckCircle />
              تأكيد اعتماد النتائج
            </button>
          </div>
        </Modal>
      )}
    </main>
  );
}

/* -------------------------------------------------------------------------- */
/* Reusable UI                                                               */
/* -------------------------------------------------------------------------- */

function SummaryCard({
  icon,
  label,
  value,
}: {
  icon: ReactNode;
  label: string;
  value: number;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-medium text-slate-500">
            {label}
          </p>

          <p className="mt-2 text-2xl font-bold text-slate-900">
            {value}
          </p>
        </div>

        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
          {icon}
        </div>
      </div>
    </div>
  );
}

function DetailItem({
  icon,
  label,
  value,
}: {
  icon: ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border border-slate-100 bg-slate-50 p-3">
      <div className="mb-1 flex items-center gap-1.5 text-[10px] text-slate-400">
        {icon}
        {label}
      </div>

      <p className="truncate text-xs font-semibold text-slate-700">
        {value}
      </p>
    </div>
  );
}

function InputField({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  required = false,
  min,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: string;
  required?: boolean;
  min?: string;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-semibold text-slate-700">
        {label}

        {required && (
          <span className="mr-1 text-red-500">
            *
          </span>
        )}
      </span>

      <input
        type={type}
        min={min}
        required={required}
        value={value}
        onChange={(event) =>
          onChange(event.target.value)
        }
        placeholder={placeholder}
        className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
      />
    </label>
  );
}

function SelectField({
  label,
  value,
  onChange,
  options,
  placeholder,
  required = false,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: Array<{
    value: string;
    label: string;
  }>;
  placeholder: string;
  required?: boolean;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-semibold text-slate-700">
        {label}

        {required && (
          <span className="mr-1 text-red-500">
            *
          </span>
        )}
      </span>

      <div className="relative">
        <select
          required={required}
          value={value}
          onChange={(event) =>
            onChange(event.target.value)
          }
          className="h-11 w-full appearance-none rounded-xl border border-slate-200 bg-white px-3 pl-9 text-sm outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
        >
          <option value="">
            {placeholder}
          </option>

          {options.map((option) => (
            <option
              key={option.value}
              value={option.value}
            >
              {option.label}
            </option>
          ))}
        </select>

        <FiChevronDown
          size={15}
          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
        />
      </div>
    </label>
  );
}

function Modal({
  title,
  description,
  children,
  onClose,
  wide = false,
}: {
  title: string;
  description?: string;
  children: ReactNode;
  onClose: () => void;
  wide?: boolean;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-sm">
      <div
        className={`max-h-[92vh] w-full overflow-hidden rounded-2xl bg-white shadow-2xl ${
          wide ? "max-w-5xl" : "max-w-xl"
        }`}
      >
        <div className="flex items-start justify-between gap-4 border-b border-slate-100 p-5">
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              {title}
            </h2>

            {description && (
              <p className="mt-1 text-xs leading-5 text-slate-500">
                {description}
              </p>
            )}
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
            aria-label="إغلاق"
          >
            <FiX size={18} />
          </button>
        </div>

        <div className="max-h-[calc(92vh-90px)] overflow-y-auto p-5">
          {children}
        </div>
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex min-h-[320px] flex-col items-center justify-center px-6 text-center">
      <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
        <FiFileText size={24} />
      </div>

      <h3 className="text-sm font-bold text-slate-800">
        لا توجد امتحانات
      </h3>

      <p className="mt-1 max-w-sm text-xs leading-5 text-slate-500">
        لا توجد نتائج مطابقة للبحث أو الفلتر الحالي.
      </p>
    </div>
  );
}

function EmptySelectedExam() {
  return (
    <div className="flex min-h-[420px] flex-col items-center justify-center px-6 text-center">
      <FiEye size={28} className="mb-3 text-slate-300" />

      <h3 className="text-sm font-bold text-slate-800">
        اختر امتحانًا
      </h3>

      <p className="mt-1 text-xs leading-5 text-slate-500">
        اختر امتحانًا من القائمة لعرض بياناته ودرجات الطلاب.
      </p>
    </div>
  );
}

function EmptyGrades() {
  return (
    <div className="flex min-h-[260px] flex-col items-center justify-center rounded-xl border border-slate-200 bg-slate-50 px-6 text-center">
      <FiUsers size={25} className="mb-3 text-slate-300" />

      <h3 className="text-sm font-bold text-slate-800">
        لا يوجد طلاب
      </h3>

      <p className="mt-1 text-xs text-slate-500">
        لا يوجد طلاب مرتبطون بالمجموعة الحالية.
      </p>
    </div>
  );
}

function ImportSummary({
  label,
  value,
  type,
}: {
  label: string;
  value: number;
  type: "success" | "warning" | "danger";
}) {
  const styles = {
    success:
      "border-emerald-100 bg-emerald-50 text-emerald-700",
    warning:
      "border-amber-100 bg-amber-50 text-amber-700",
    danger:
      "border-red-100 bg-red-50 text-red-700",
  };

  return (
    <div
      className={`rounded-xl border p-3 ${styles[type]}`}
    >
      <p className="text-[10px] font-medium opacity-80">
        {label}
      </p>

      <p className="mt-1 text-lg font-bold">
        {value}
      </p>
    </div>
  );
}

function ImportBadge({
  status,
}: {
  status: ImportStatus;
}) {
  const styles = {
    recognized:
      "bg-emerald-50 text-emerald-700",
    unknown:
      "bg-amber-50 text-amber-700",
    duplicate:
      "bg-red-50 text-red-700",
    invalid:
      "bg-red-50 text-red-700",
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold ${styles[status]}`}
    >
      {status === "recognized" ? (
        <FiCheckCircle />
      ) : status === "unknown" ? (
        <FiAlertCircle />
      ) : (
        <FiXCircle />
      )}

      {getImportStatusLabel(status)}
    </span>
  );
}

function ConfirmItem({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border border-white bg-white p-3">
      <p className="text-[10px] text-slate-400">
        {label}
      </p>

      <p className="mt-1 text-sm font-bold text-slate-800">
        {value}
      </p>
    </div>
  );
}
