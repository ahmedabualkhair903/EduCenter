"use client";

import { useEffect, useMemo, useState } from "react";
import {
  FiAward,
  FiCalendar,
  FiChevronDown,
  FiEdit2,
  FiEye,
  FiPlus,
  FiSearch,
  FiUsers,
  FiX,
} from "react-icons/fi";

type ExamStatus = "قادمة" | "مكتملة" | "مصححة";

type Exam = {
  id: number;
  name: string;
  subject: string;
  grade: string;
  date: string;
  totalMarks: number;
  students: number;
  completed: number;
  average: number;
  status: ExamStatus;
};

const initialExams: Exam[] = [
  {
    id: 1,
    name: "اختبار الشهر الأول",
    subject: "الرياضيات",
    grade: "ثالثة ثانوي",
    date: "2026-08-25",
    totalMarks: 50,
    students: 30,
    completed: 30,
    average: 84,
    status: "مصححة",
  },
  {
    id: 2,
    name: "اختبار الوحدة الثالثة",
    subject: "اللغة الإنجليزية",
    grade: "ثانية ثانوي",
    date: "2026-08-27",
    totalMarks: 40,
    students: 25,
    completed: 0,
    average: 0,
    status: "قادمة",
  },
  {
    id: 3,
    name: "اختبار الفيزياء",
    subject: "الفيزياء",
    grade: "ثالثة ثانوي",
    date: "2026-08-29",
    totalMarks: 60,
    students: 25,
    completed: 18,
    average: 76,
    status: "مصححة",
  },
  {
    id: 4,
    name: "اختبار الكيمياء",
    subject: "الكيمياء",
    grade: "ثالثة ثانوي",
    date: "2026-09-01",
    totalMarks: 50,
    students: 22,
    completed: 22,
    average: 81,
    status: "مصححة",
  },
  {
    id: 5,
    name: "اختبار منتصف الترم",
    subject: "اللغة العربية",
    grade: "أولى ثانوي",
    date: "2026-09-04",
    totalMarks: 50,
    students: 20,
    completed: 0,
    average: 0,
    status: "قادمة",
  },
];

const subjects = [
  "الكل",
  "الرياضيات",
  "اللغة الإنجليزية",
  "الفيزياء",
  "الكيمياء",
  "اللغة العربية",
];

const statuses = ["الكل", "قادمة", "مكتملة", "مصححة"];

const grades = [
  "أولى إعدادي",
  "ثانية إعدادي",
  "ثالثة إعدادي",
  "أولى ثانوي",
  "ثانية ثانوي",
  "ثالثة ثانوي",
];

export default function ExamsPage() {
  const [exams, setExams] = useState<Exam[]>(initialExams);
  const [search, setSearch] = useState("");
  const [subjectFilter, setSubjectFilter] = useState("الكل");
  const [statusFilter, setStatusFilter] = useState("الكل");

  const [modalOpen, setModalOpen] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);

  const [editingExam, setEditingExam] = useState<Exam | null>(null);
  const [selectedExam, setSelectedExam] = useState<Exam | null>(null);

  const filteredExams = useMemo(() => {
    const query = search.trim().toLowerCase();

    return exams.filter((exam) => {
      const matchesSearch =
        !query ||
        exam.name.toLowerCase().includes(query) ||
        exam.subject.toLowerCase().includes(query) ||
        exam.grade.toLowerCase().includes(query);

      const matchesSubject =
        subjectFilter === "الكل" ||
        exam.subject === subjectFilter;

      const matchesStatus =
        statusFilter === "الكل" ||
        exam.status === statusFilter;

      return matchesSearch && matchesSubject && matchesStatus;
    });
  }, [exams, search, subjectFilter, statusFilter]);

  const upcomingCount = exams.filter(
    (exam) => exam.status === "قادمة",
  ).length;

  const correctedCount = exams.filter(
    (exam) => exam.status === "مصححة",
  ).length;

  const totalStudents = exams.reduce(
    (total, exam) => total + exam.students,
    0,
  );

  const averages = exams
    .filter((exam) => exam.average > 0)
    .map((exam) => exam.average);

  const overallAverage =
    averages.length > 0
      ? Math.round(
          averages.reduce((sum, value) => sum + value, 0) /
            averages.length,
        )
      : 0;

  const openAddModal = () => {
    setEditingExam(null);
    setModalOpen(true);
  };

  const openEditModal = (exam: Exam) => {
    setEditingExam(exam);
    setDetailsOpen(false);
    setSelectedExam(null);
    setModalOpen(true);
  };

  const openDetails = (exam: Exam) => {
    setSelectedExam(exam);
    setDetailsOpen(true);
  };

  const handleSaveExam = (
    data: Omit<Exam, "id" | "completed" | "average">,
  ) => {
    if (editingExam) {
      setExams((current) =>
        current.map((exam) =>
          exam.id === editingExam.id
            ? {
                ...exam,
                ...data,
              }
            : exam,
        ),
      );
    } else {
      const newExam: Exam = {
        id: Date.now(),
        ...data,
        completed: 0,
        average: 0,
      };

      setExams((current) => [newExam, ...current]);
    }

    setModalOpen(false);
    setEditingExam(null);
  };

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
                الامتحانات والدرجات
              </span>
            </div>

            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              الامتحانات والدرجات
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              إنشاء الامتحانات ومتابعة النتائج ودرجات الطلاب.
            </p>
          </div>

          <button
            type="button"
            onClick={openAddModal}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-teal-600 px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-teal-700 active:scale-[0.98]"
          >
            <FiPlus size={17} />
            إضافة امتحان
          </button>
        </div>

        {/* Stats */}

        <section className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <ExamStat
            icon={<FiAward size={19} />}
            label="إجمالي الامتحانات"
            value={exams.length}
          />

          <ExamStat
            icon={<FiCalendar size={19} />}
            label="الامتحانات القادمة"
            value={upcomingCount}
            valueClass="text-amber-600"
          />

          <ExamStat
            icon={<FiUsers size={19} />}
            label="إجمالي المشاركات"
            value={totalStudents}
          />

          <ExamStat
            icon={<FiAward size={19} />}
            label="متوسط الدرجات"
            value={`${overallAverage}%`}
            valueClass="text-emerald-600"
          />
        </section>

        {/* Main Card */}

        <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          {/* Filters */}

          <div className="border-b border-slate-100 p-4 sm:p-5">
            <div className="flex flex-col gap-3 lg:flex-row">
              <div className="relative flex-1">
                <FiSearch
                  size={17}
                  className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <input
                  type="search"
                  value={search}
                  onChange={(event) =>
                    setSearch(event.target.value)
                  }
                  placeholder="ابحث باسم الامتحان أو المادة أو المرحلة..."
                  className="h-10 w-full rounded-lg border border-slate-200 bg-slate-50 pr-9 pl-3 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-teal-500 focus:bg-white focus:ring-4 focus:ring-teal-500/10"
                />
              </div>

              <FilterSelect
                value={subjectFilter}
                onChange={setSubjectFilter}
                options={subjects}
                label="المادة"
              />

              <FilterSelect
                value={statusFilter}
                onChange={setStatusFilter}
                options={statuses}
                label="الحالة"
              />
            </div>
          </div>

          {/* Result Count */}

          <div className="border-b border-slate-100 px-5 py-3">
            <p className="text-xs text-slate-400">
              عرض{" "}
              <span className="font-semibold text-slate-600">
                {filteredExams.length}
              </span>{" "}
              امتحان
            </p>
          </div>

          {/* Table */}

          <div className="overflow-x-auto">
            <table className="w-full min-w-[1050px] text-right">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/70">
                  <th className="px-5 py-3 text-xs font-semibold text-slate-500">
                    الامتحان
                  </th>

                  <th className="px-5 py-3 text-xs font-semibold text-slate-500">
                    المادة
                  </th>

                  <th className="px-5 py-3 text-xs font-semibold text-slate-500">
                    التاريخ
                  </th>

                  <th className="px-5 py-3 text-xs font-semibold text-slate-500">
                    الدرجة
                  </th>

                  <th className="px-5 py-3 text-xs font-semibold text-slate-500">
                    المشاركة
                  </th>

                  <th className="px-5 py-3 text-xs font-semibold text-slate-500">
                    المتوسط
                  </th>

                  <th className="px-5 py-3 text-xs font-semibold text-slate-500">
                    الحالة
                  </th>

                  <th className="w-32 px-5 py-3 text-xs font-semibold text-slate-500">
                    إجراءات
                  </th>
                </tr>
              </thead>

              <tbody>
                {filteredExams.map((exam) => {
                  const participation =
                    exam.students === 0
                      ? 0
                      : Math.round(
                          (exam.completed / exam.students) *
                            100,
                        );

                  return (
                    <tr
                      key={exam.id}
                      className="border-b border-slate-100 transition last:border-0 hover:bg-slate-50/70"
                    >
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-teal-50 text-teal-600">
                            <FiAward size={16} />
                          </div>

                          <div>
                            <p className="text-sm font-semibold text-slate-800">
                              {exam.name}
                            </p>

                            <p className="mt-0.5 text-xs text-slate-400">
                              {exam.grade}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        <span className="text-sm text-slate-600">
                          {exam.subject}
                        </span>
                      </td>

                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          <FiCalendar
                            size={14}
                            className="text-slate-400"
                          />

                          <span className="text-xs font-medium text-slate-600">
                            {formatDate(exam.date)}
                          </span>
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        <span className="text-sm font-semibold text-slate-700">
                          {exam.totalMarks}
                        </span>

                        <span className="mr-1 text-xs text-slate-400">
                          درجة
                        </span>
                      </td>

                      <td className="px-5 py-4">
                        <div className="w-28">
                          <div className="mb-1 flex items-center justify-between">
                            <span className="text-xs font-semibold text-slate-700">
                              {exam.completed}/{exam.students}
                            </span>

                            <span className="text-[10px] text-slate-400">
                              {participation}%
                            </span>
                          </div>

                          <div className="h-1.5 overflow-hidden rounded-full bg-slate-100">
                            <div
                              className="h-full rounded-full bg-teal-500 transition-all"
                              style={{
                                width: `${Math.min(
                                  participation,
                                  100,
                                )}%`,
                              }}
                            />
                          </div>
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        {exam.average > 0 ? (
                          <span className="text-sm font-bold text-slate-700">
                            {exam.average}%
                          </span>
                        ) : (
                          <span className="text-xs text-slate-400">
                            لم تصحح
                          </span>
                        )}
                      </td>

                      <td className="px-5 py-4">
                        <ExamStatusBadge
                          status={exam.status}
                        />
                      </td>

                      <td className="px-5 py-4">
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() =>
                              openDetails(exam)
                            }
                            className="flex h-8 w-8 items-center justify-center rounded-md text-slate-400 transition hover:bg-teal-50 hover:text-teal-600"
                            aria-label="عرض الامتحان"
                            title="عرض"
                          >
                            <FiEye size={16} />
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              openEditModal(exam)
                            }
                            className="flex h-8 w-8 items-center justify-center rounded-md text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                            aria-label="تعديل الامتحان"
                            title="تعديل"
                          >
                            <FiEdit2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {filteredExams.length === 0 && (
              <div className="flex min-h-64 flex-col items-center justify-center px-6 text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-400">
                  <FiSearch size={20} />
                </div>

                <h3 className="mt-4 text-sm font-bold text-slate-800">
                  لا توجد امتحانات
                </h3>

                <p className="mt-1 text-xs text-slate-400">
                  جرّب تغيير البحث أو الفلاتر.
                </p>
              </div>
            )}
          </div>

          {/* Footer */}

          <div className="flex items-center justify-between border-t border-slate-100 px-5 py-4">
            <p className="text-xs text-slate-400">
              إجمالي النتائج:{" "}
              <span className="font-semibold text-slate-600">
                {filteredExams.length}
              </span>
            </p>

            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled
                className="h-8 rounded-md border border-slate-200 px-3 text-xs text-slate-400"
              >
                السابق
              </button>

              <span className="flex h-8 min-w-8 items-center justify-center rounded-md bg-teal-600 px-2 text-xs font-semibold text-white">
                1
              </span>

              <button
                type="button"
                disabled
                className="h-8 rounded-md border border-slate-200 px-3 text-xs text-slate-400"
              >
                التالي
              </button>
            </div>
          </div>
        </section>
      </div>

      {/* Add / Edit Modal */}

      <ExamModal
        open={modalOpen}
        exam={editingExam}
        onClose={() => {
          setModalOpen(false);
          setEditingExam(null);
        }}
        onSubmit={handleSaveExam}
      />

      {/* Details Modal */}

      <ExamDetailsModal
        open={detailsOpen}
        exam={selectedExam}
        onClose={() => {
          setDetailsOpen(false);
          setSelectedExam(null);
        }}
        onEdit={openEditModal}
      />
    </main>
  );
}

/* -------------------------------------------------------------------------- */
/* Statistics                                                                  */
/* -------------------------------------------------------------------------- */

function ExamStat({
  icon,
  label,
  value,
  valueClass = "text-slate-900",
}: {
  icon: React.ReactNode;
  label: string;
  value: number | string;
  valueClass?: string;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-slate-500">
            {label}
          </p>

          <p
            className={`mt-1 text-2xl font-bold ${valueClass}`}
          >
            {value}
          </p>
        </div>

        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-teal-50 text-teal-600">
          {icon}
        </div>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Filter                                                                      */
/* -------------------------------------------------------------------------- */

function FilterSelect({
  value,
  onChange,
  options,
  label,
}: {
  value: string;
  onChange: (value: string) => void;
  options: string[];
  label: string;
}) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(event) =>
          onChange(event.target.value)
        }
        aria-label={label}
        className="h-10 min-w-40 appearance-none rounded-lg border border-slate-200 bg-white px-3 pl-9 text-sm text-slate-600 outline-none transition hover:border-slate-300 focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10"
      >
        {options.map((option) => (
          <option
            key={option}
            value={option}
          >
            {option === "الكل"
              ? `كل ${label}`
              : option}
          </option>
        ))}
      </select>

      <FiChevronDown
        size={15}
        className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
      />
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Status                                                                      */
/* -------------------------------------------------------------------------- */

function ExamStatusBadge({
  status,
}: {
  status: ExamStatus;
}) {
  const styles: Record<ExamStatus, string> = {
    قادمة: "bg-amber-50 text-amber-700",
    مكتملة: "bg-blue-50 text-blue-700",
    مصححة: "bg-emerald-50 text-emerald-700",
  };

  return (
    <span
      className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${styles[status]}`}
    >
      {status}
    </span>
  );
}

/* -------------------------------------------------------------------------- */
/* Exam Modal                                                                  */
/* -------------------------------------------------------------------------- */

function ExamModal({
  open,
  exam,
  onClose,
  onSubmit,
}: {
  open: boolean;
  exam: Exam | null;
  onClose: () => void;
  onSubmit: (
    data: Omit<Exam, "id" | "completed" | "average">,
  ) => void;
}) {
  const isEdit = Boolean(exam);

  const [name, setName] = useState("");
  const [subject, setSubject] = useState("");
  const [grade, setGrade] = useState("");
  const [date, setDate] = useState("");
  const [totalMarks, setTotalMarks] = useState("50");
  const [students, setStudents] = useState("25");
  const [status, setStatus] =
    useState<ExamStatus>("قادمة");
  const [error, setError] = useState("");

  /*
   * مهم:
   * كان هنا useState يستخدم كأنه useEffect.
   * تم تصحيحه حتى يتم تحميل بيانات الامتحان
   * بشكل صحيح عند فتح الـModal أو تغيير الامتحان.
   */
  useEffect(() => {
    if (!open) return;

    setName(exam?.name ?? "");
    setSubject(exam?.subject ?? "");
    setGrade(exam?.grade ?? "");
    setDate(exam?.date ?? "2026-08-30");
    setTotalMarks(
      String(exam?.totalMarks ?? 50),
    );
    setStudents(
      String(exam?.students ?? 25),
    );
    setStatus(exam?.status ?? "قادمة");
    setError("");
  }, [open, exam]);

  if (!open) {
    return null;
  }

  const handleSubmit = () => {
    if (
      !name.trim() ||
      !subject ||
      !grade ||
      !date
    ) {
      setError(
        "يرجى إدخال جميع البيانات المطلوبة.",
      );
      return;
    }

    const marks = Number(totalMarks);
    const studentCount = Number(students);

    if (
      !Number.isFinite(marks) ||
      !Number.isInteger(marks) ||
      marks < 1
    ) {
      setError(
        "درجة الامتحان يجب أن تكون رقمًا صحيحًا أكبر من صفر.",
      );
      return;
    }

    if (
      !Number.isFinite(studentCount) ||
      !Number.isInteger(studentCount) ||
      studentCount < 1
    ) {
      setError(
        "عدد الطلاب يجب أن يكون رقمًا صحيحًا أكبر من صفر.",
      );
      return;
    }

    if (
      exam &&
      studentCount < exam.completed
    ) {
      setError(
        `عدد الطلاب لا يمكن أن يكون أقل من عدد المشاركين الحالي (${exam.completed}).`,
      );
      return;
    }

    onSubmit({
      name: name.trim(),
      subject,
      grade,
      date,
      totalMarks: marks,
      students: studentCount,
      status,
    });
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-[2px]"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="exam-modal-title"
        className="flex max-h-[92vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl"
      >
        {/* Header */}

        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4 sm:px-6">
          <div>
            <h2
              id="exam-modal-title"
              className="text-base font-bold text-slate-900"
            >
              {isEdit
                ? "تعديل الامتحان"
                : "إضافة امتحان جديد"}
            </h2>

            <p className="mt-1 text-xs text-slate-400">
              أدخل بيانات الامتحان الأساسية.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
            aria-label="إغلاق"
          >
            <FiX size={19} />
          </button>
        </div>

        {/* Body */}

        <div className="flex-1 overflow-y-auto px-5 py-5 sm:px-6">
          {error && (
            <div
              role="alert"
              className="mb-4 rounded-lg border border-red-100 bg-red-50 px-3 py-2 text-xs font-medium text-red-600"
            >
              {error}
            </div>
          )}

          <div className="grid gap-4 sm:grid-cols-2">
            <FormField label="اسم الامتحان">
              <input
                value={name}
                onChange={(event) =>
                  setName(event.target.value)
                }
                placeholder="مثال: اختبار الشهر الأول"
                className="field"
              />
            </FormField>

            <FormField label="المادة">
              <select
                value={subject}
                onChange={(event) =>
                  setSubject(event.target.value)
                }
                className="field"
              >
                <option value="">
                  اختر المادة
                </option>

                {subjects
                  .filter(
                    (item) => item !== "الكل",
                  )
                  .map((item) => (
                    <option
                      key={item}
                      value={item}
                    >
                      {item}
                    </option>
                  ))}
              </select>
            </FormField>

            <FormField label="المرحلة الدراسية">
              <select
                value={grade}
                onChange={(event) =>
                  setGrade(event.target.value)
                }
                className="field"
              >
                <option value="">
                  اختر المرحلة
                </option>

                {grades.map((item) => (
                  <option
                    key={item}
                    value={item}
                  >
                    {item}
                  </option>
                ))}
              </select>
            </FormField>

            <FormField label="تاريخ الامتحان">
              <input
                type="date"
                value={date}
                onChange={(event) =>
                  setDate(event.target.value)
                }
                className="field"
              />
            </FormField>

            <FormField label="الدرجة النهائية">
              <input
                type="number"
                min="1"
                step="1"
                value={totalMarks}
                onChange={(event) =>
                  setTotalMarks(
                    event.target.value,
                  )
                }
                className="field"
              />
            </FormField>

            <FormField label="عدد الطلاب">
              <input
                type="number"
                min="1"
                step="1"
                value={students}
                onChange={(event) =>
                  setStudents(
                    event.target.value,
                  )
                }
                className="field"
              />
            </FormField>

            <FormField label="الحالة">
              <select
                value={status}
                onChange={(event) =>
                  setStatus(
                    event.target.value as ExamStatus,
                  )
                }
                className="field"
              >
                <option value="قادمة">
                  قادمة
                </option>

                <option value="مكتملة">
                  مكتملة
                </option>

                <option value="مصححة">
                  مصححة
                </option>
              </select>
            </FormField>
          </div>
        </div>

        {/* Footer */}

        <div className="flex items-center justify-end gap-2 border-t border-slate-100 bg-slate-50/70 px-5 py-4 sm:px-6">
          <button
            type="button"
            onClick={onClose}
            className="h-10 rounded-lg border border-slate-200 bg-white px-4 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
          >
            إلغاء
          </button>

          <button
            type="button"
            onClick={handleSubmit}
            className="h-10 rounded-lg bg-teal-600 px-5 text-sm font-semibold text-white transition hover:bg-teal-700"
          >
            {isEdit
              ? "حفظ التعديلات"
              : "إضافة الامتحان"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Details Modal                                                               */
/* -------------------------------------------------------------------------- */

function ExamDetailsModal({
  open,
  exam,
  onClose,
  onEdit,
}: {
  open: boolean;
  exam: Exam | null;
  onClose: () => void;
  onEdit: (exam: Exam) => void;
}) {
  if (!open || !exam) {
    return null;
  }

  const participation =
    exam.students === 0
      ? 0
      : Math.round(
          (exam.completed / exam.students) *
            100,
        );

  return (
    <div
      className="fixed inset-0 z-[90] flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-[2px]"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="exam-details-title"
        className="flex max-h-[92vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl"
      >
        {/* Header */}

        <div className="flex items-start justify-between border-b border-slate-100 px-5 py-5 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-teal-50 text-teal-600">
              <FiAward size={19} />
            </div>

            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2
                  id="exam-details-title"
                  className="text-base font-bold text-slate-900"
                >
                  {exam.name}
                </h2>

                <ExamStatusBadge
                  status={exam.status}
                />
              </div>

              <p className="mt-1 text-xs text-slate-400">
                {exam.subject} · {exam.grade}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
            aria-label="إغلاق"
          >
            <FiX size={19} />
          </button>
        </div>

        {/* Body */}

        <div className="flex-1 overflow-y-auto px-5 py-5 sm:px-6">
          <div className="grid gap-3 sm:grid-cols-2">
            <InfoBox
              icon={<FiAward size={16} />}
              label="المادة"
              value={exam.subject}
            />

            <InfoBox
              icon={<FiUsers size={16} />}
              label="المرحلة"
              value={exam.grade}
            />

            <InfoBox
              icon={<FiCalendar size={16} />}
              label="تاريخ الامتحان"
              value={formatDate(exam.date)}
            />

            <InfoBox
              icon={<FiAward size={16} />}
              label="الدرجة النهائية"
              value={`${exam.totalMarks} درجة`}
            />
          </div>

          {/* Participation */}

          <section className="mt-6 border-t border-slate-100 pt-6">
            <h3 className="text-sm font-bold text-slate-800">
              نسبة المشاركة
            </h3>

            <p className="mt-1 text-xs text-slate-400">
              عدد الطلاب الذين تم تسجيل نتائجهم.
            </p>

            <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-4">
              <div className="flex items-end justify-between">
                <div>
                  <p className="text-xs text-slate-400">
                    النتائج المسجلة
                  </p>

                  <p className="mt-1 text-xl font-bold text-slate-900">
                    {exam.completed}{" "}
                    <span className="text-sm font-medium text-slate-400">
                      / {exam.students}
                    </span>
                  </p>
                </div>

                <span className="text-sm font-bold text-teal-600">
                  {participation}%
                </span>
              </div>

              <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-200">
                <div
                  className="h-full rounded-full bg-teal-500 transition-all"
                  style={{
                    width: `${Math.min(
                      participation,
                      100,
                    )}%`,
                  }}
                />
              </div>
            </div>
          </section>

          {/* Average */}

          <section className="mt-6 border-t border-slate-100 pt-6">
            <h3 className="text-sm font-bold text-slate-800">
              نتيجة الامتحان
            </h3>

            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <div className="rounded-xl border border-slate-200 bg-white p-4">
                <p className="text-xs text-slate-400">
                  متوسط الدرجات
                </p>

                <p className="mt-2 text-2xl font-bold text-slate-900">
                  {exam.average > 0
                    ? `${exam.average}%`
                    : "--"}
                </p>
              </div>

              <div className="rounded-xl border border-slate-200 bg-white p-4">
                <p className="text-xs text-slate-400">
                  حالة التصحيح
                </p>

                <p className="mt-2 text-sm font-bold text-slate-700">
                  {exam.status === "مصححة"
                    ? "تم تصحيح النتائج"
                    : "لم يتم التصحيح بعد"}
                </p>
              </div>
            </div>
          </section>

          {/* Student Results */}

          <section className="mt-6 border-t border-slate-100 pt-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-800">
                  درجات الطلاب
                </h3>

                <p className="mt-1 text-xs text-slate-400">
                  إدارة وتسجيل درجات الطلاب في هذا الامتحان.
                </p>
              </div>

              <button
                type="button"
                className="inline-flex h-9 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-600 transition hover:border-teal-200 hover:bg-teal-50 hover:text-teal-700"
              >
                <FiEdit2 size={14} />
                إدخال الدرجات
              </button>
            </div>

            <div className="mt-4 rounded-xl border border-dashed border-slate-200 bg-slate-50 p-5 text-center">
              <p className="text-sm font-semibold text-slate-700">
                شاشة إدخال الدرجات
              </p>

              <p className="mt-1 text-xs text-slate-400">
                سيتم تطوير جدول الدرجات التفصيلي في الخطوة التالية.
              </p>
            </div>
          </section>
        </div>

        {/* Footer */}

        <div className="flex items-center justify-end gap-2 border-t border-slate-100 bg-slate-50/70 px-5 py-4 sm:px-6">
          <button
            type="button"
            onClick={onClose}
            className="h-10 rounded-lg border border-slate-200 bg-white px-4 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
          >
            إغلاق
          </button>

          <button
            type="button"
            onClick={() => onEdit(exam)}
            className="inline-flex h-10 items-center gap-2 rounded-lg bg-teal-600 px-5 text-sm font-semibold text-white transition hover:bg-teal-700"
          >
            <FiEdit2 size={15} />
            تعديل الامتحان
          </button>
        </div>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Small Components                                                            */
/* -------------------------------------------------------------------------- */

function FormField({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-semibold text-slate-600">
        {label}
      </span>

      {children}
    </label>
  );
}

function InfoBox({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
      <div className="flex items-center gap-2 text-slate-400">
        {icon}

        <span className="text-[11px] font-medium">
          {label}
        </span>
      </div>

      <p className="mt-2 text-sm font-semibold text-slate-700">
        {value}
      </p>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Helpers                                                                     */
/* -------------------------------------------------------------------------- */

function formatDate(value: string) {
  const date = new Date(`${value}T12:00:00`);

  return new Intl.DateTimeFormat("ar-EG", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
}