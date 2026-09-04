
"use client";

import {
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import Image from "next/image";

import {
  FiArrowRight,
  FiCheck,
  FiChevronDown,
  FiFileText,
  FiPrinter,
  FiRefreshCw,
  FiSearch,
  FiUsers,
} from "react-icons/fi";

import { generateQRCode } from "@/lib/qr";

import { groupService } from "@/services/groupService";
import { studentCardService } from "@/services/studentCardService";
import { studentService } from "@/services/studentService";

import type { Group, Student } from "@/types";

type SelectionMode =
  | "student"
  | "students"
  | "group"
  | "grade"
  | "teacher"
  | "all";

type GeneratedCard = {
  student: Student;
  groupName: string;
  teacherName: string;
  attendanceCode: string;
  parentQrValue: string;
};

const selectionModes: Array<{
  value: SelectionMode;
  label: string;
  description: string;
}> = [
  {
    value: "student",
    label: "طالب واحد",
    description: "اختيار طالب محدد لطباعة كارت واحد.",
  },
  {
    value: "students",
    label: "عدة طلاب",
    description: "اختيار أكثر من طالب للطباعة دفعة واحدة.",
  },
  {
    value: "group",
    label: "مجموعة",
    description: "طباعة كروت جميع طلاب مجموعة محددة.",
  },
  {
    value: "grade",
    label: "صف",
    description: "طباعة كروت جميع الطلاب في صف محدد.",
  },
  {
    value: "teacher",
    label: "مدرس",
    description: "طباعة كروت الطلاب المرتبطين بمدرس.",
  },
  {
    value: "all",
    label: "كل الطلاب",
    description: "تجهيز كروت جميع الطلاب المسجلين.",
  },
];

export default function BulkCardPrintingPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);

  const [loading, setLoading] = useState(true);

  const [selectionMode, setSelectionMode] =
    useState<SelectionMode>("student");

  const [selectedStudentId, setSelectedStudentId] =
    useState("");

  const [selectedStudentIds, setSelectedStudentIds] =
    useState<string[]>([]);

  const [selectedGroupId, setSelectedGroupId] =
    useState("");

  const [selectedGrade, setSelectedGrade] =
    useState("");

  const [selectedTeacher, setSelectedTeacher] =
    useState("");

  const [studentSearch, setStudentSearch] =
    useState("");

  const [generatedCards, setGeneratedCards] =
    useState<GeneratedCard[]>([]);

  const [isGenerated, setIsGenerated] =
    useState(false);

  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;

    const loadData = async () => {
      try {
        setLoading(true);
        setError("");

        const [studentsData, groupsData] =
          await Promise.all([
            studentService.list(),
            groupService.list(),
          ]);

        if (!mounted) {
          return;
        }

        setStudents(studentsData);
        setGroups(groupsData);
      } catch {
        if (mounted) {
          setStudents([]);
          setGroups([]);
          setError(
            "تعذر تحميل بيانات الطلاب والمجموعات.",
          );
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    void loadData();

    return () => {
      mounted = false;
    };
  }, []);

  const groupMap = useMemo(() => {
    const map = new Map<string, Group>();

    groups.forEach((group) => {
      map.set(group.id, group);
    });

    return map;
  }, [groups]);

  const availableGrades = useMemo(() => {
    return Array.from(
      new Set(
        students
          .map((student) => student.grade.trim())
          .filter(Boolean),
      ),
    ).sort((a, b) =>
      a.localeCompare(b, "ar"),
    );
  }, [students]);

  const availableTeachers = useMemo(() => {
    return Array.from(
      new Set(
        groups
          .map((group) => group.teacher.trim())
          .filter(Boolean),
      ),
    ).sort((a, b) =>
      a.localeCompare(b, "ar"),
    );
  }, [groups]);

  const filteredStudentOptions = useMemo(() => {
    const query =
      studentSearch.trim().toLowerCase();

    if (!query) {
      return students;
    }

    return students.filter((student) => {
      return (
        student.name
          .toLowerCase()
          .includes(query) ||
        student.studentId
          .toLowerCase()
          .includes(query) ||
        student.guardianName
          .toLowerCase()
          .includes(query) ||
        (student.phone ?? "")
          .toLowerCase()
          .includes(query)
      );
    });
  }, [students, studentSearch]);

  const selectedStudents = useMemo(() => {
    const selectedIds =
      new Set(selectedStudentIds);

    return students.filter((student) =>
      selectedIds.has(student.id),
    );
  }, [students, selectedStudentIds]);

  const selectionPreviewCount = useMemo(() => {
    switch (selectionMode) {
      case "student":
        return selectedStudentId ? 1 : 0;

      case "students":
        return selectedStudentIds.length;

      case "group":
        if (!selectedGroupId) {
          return 0;
        }

        return students.filter(
          (student) =>
            student.groupId === selectedGroupId,
        ).length;

      case "grade":
        if (!selectedGrade) {
          return 0;
        }

        return students.filter(
          (student) =>
            student.grade === selectedGrade,
        ).length;

      case "teacher":
        if (!selectedTeacher) {
          return 0;
        }

        return students.filter((student) => {
          if (!student.groupId) {
            return false;
          }

          return (
            groupMap.get(student.groupId)?.teacher ===
            selectedTeacher
          );
        }).length;

      case "all":
        return students.length;

      default:
        return 0;
    }
  }, [
    selectionMode,
    selectedStudentId,
    selectedStudentIds,
    selectedGroupId,
    selectedGrade,
    selectedTeacher,
    students,
    groupMap,
  ]);

  const getSelectedStudents = (): Student[] => {
    switch (selectionMode) {
      case "student": {
        const student = students.find(
          (item) =>
            item.id === selectedStudentId,
        );

        return student ? [student] : [];
      }

      case "students":
        return selectedStudents;

      case "group":
        return students.filter(
          (student) =>
            student.groupId === selectedGroupId,
        );

      case "grade":
        return students.filter(
          (student) =>
            student.grade === selectedGrade,
        );

      case "teacher":
        return students.filter((student) => {
          if (!student.groupId) {
            return false;
          }

          return (
            groupMap.get(student.groupId)?.teacher ===
            selectedTeacher
          );
        });

      case "all":
        return students;

      default:
        return [];
    }
  };

  const buildGeneratedCards = async (
    selected: Student[],
  ): Promise<GeneratedCard[]> => {
    return Promise.all(
      selected.map(async (student) => {
        const group = student.groupId
          ? groupMap.get(student.groupId)
          : undefined;

        const fallbackCode = `SN:${student.id}`;
        const fallbackQr = `/parent-portal/${student.id}`;

        let attendanceCode = fallbackCode;
        let parentQrValue = fallbackQr;

        try {
          const studentCard =
            await studentCardService.getStudentCard(
              student.id,
            );

          attendanceCode =
            studentCard.attendanceCode ??
            fallbackCode;
          parentQrValue =
            studentCard.parentQrValue ??
            fallbackQr;
        } catch {
          // Keep the offline fallback values when the
          // card registry is temporarily unavailable.
        }

        return {
          student,
          groupName:
            group?.name ??
            "غير محددة",
          teacherName:
            group?.teacher ??
            "غير محدد",
          attendanceCode,
          parentQrValue,
        };
      }),
    );
  };

  const handleGenerateCards = async () => {
    setError("");

    const selected = getSelectedStudents();

    if (selected.length === 0) {
      setGeneratedCards([]);
      setIsGenerated(false);
      setError(
        "يرجى اختيار طالب واحد على الأقل قبل إنشاء الكروت.",
      );
      return;
    }

    const cards =
      await buildGeneratedCards(selected);

    setGeneratedCards(cards);

    setIsGenerated(true);
  };

  const handleReset = () => {
    setSelectionMode("student");
    setSelectedStudentId("");
    setSelectedStudentIds([]);
    setSelectedGroupId("");
    setSelectedGrade("");
    setSelectedTeacher("");
    setStudentSearch("");
    setGeneratedCards([]);
    setIsGenerated(false);
    setError("");
  };

  const toggleStudentSelection = (
    studentId: string,
  ) => {
    setSelectedStudentIds((current) => {
      if (current.includes(studentId)) {
        return current.filter(
          (id) => id !== studentId,
        );
      }

      return [...current, studentId];
    });

    setError("");
  };

  const selectAllVisibleStudents = () => {
    const visibleIds =
      filteredStudentOptions.map(
        (student) => student.id,
      );

    setSelectedStudentIds((current) => {
      const next = new Set(current);

      visibleIds.forEach((id) => {
        next.add(id);
      });

      return Array.from(next);
    });
  };

  const clearSelectedStudents = () => {
    setSelectedStudentIds([]);
  };

  const handlePrint = () => {
    if (generatedCards.length === 0) {
      return;
    }

    window.print();
  };

  const handleExportPdf = () => {
    if (generatedCards.length === 0) {
      return;
    }

    window.print();
  };

  return (
    <main
      dir="rtl"
      className="min-h-screen bg-slate-50 print:bg-white"
    >
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 print:max-w-none print:px-0 print:py-0">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between print:hidden">
          <div>
            <div className="mb-2 flex items-center gap-2 text-xs font-medium text-slate-400">
              <span>الرئيسية</span>
              <span>/</span>
              <span>الطلاب</span>
              <span>/</span>
              <span className="text-teal-600">
                طباعة كروت الطلاب
              </span>
            </div>

            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              طباعة كروت الطلاب
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              اختر الطلاب المطلوبين ثم أنشئ المعاينة قبل الطباعة أو التصدير إلى PDF.
            </p>
          </div>

          <button
            type="button"
            onClick={handleReset}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-600 shadow-sm transition hover:bg-slate-50"
          >
            <FiRefreshCw size={15} />
            إعادة ضبط
          </button>
        </div>

        {!isGenerated ? (
          <section className="grid gap-6 lg:grid-cols-[300px_minmax(0,1fr)] print:hidden">
            <aside className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="mb-4">
                <p className="text-sm font-bold text-slate-900">
                  طريقة الاختيار
                </p>

                <p className="mt-1 text-xs leading-5 text-slate-400">
                  حدد النطاق الذي تريد إنشاء الكروت له.
                </p>
              </div>

              <div className="space-y-2">
                {selectionModes.map((mode) => {
                  const active =
                    selectionMode === mode.value;

                  return (
                    <button
                      key={mode.value}
                      type="button"
                      onClick={() => {
                        setSelectionMode(
                          mode.value,
                        );
                        setError("");
                        setIsGenerated(false);
                        setGeneratedCards([]);
                      }}
                      className={`w-full rounded-xl border p-3 text-right transition ${
                        active
                          ? "border-teal-200 bg-teal-50"
                          : "border-slate-100 bg-white hover:border-slate-200 hover:bg-slate-50"
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div
                          className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
                            active
                              ? "bg-teal-600 text-white"
                              : "bg-slate-100 text-slate-400"
                          }`}
                        >
                          {active ? (
                            <FiCheck size={15} />
                          ) : (
                            <FiUsers size={15} />
                          )}
                        </div>

                        <div className="min-w-0">
                          <p
                            className={`text-xs font-bold ${
                              active
                                ? "text-teal-800"
                                : "text-slate-700"
                            }`}
                          >
                            {mode.label}
                          </p>

                          <p className="mt-1 text-[11px] leading-5 text-slate-400">
                            {mode.description}
                          </p>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </aside>

            <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="border-b border-slate-100 px-5 py-5 sm:px-6">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <h2 className="text-sm font-bold text-slate-900">
                      تحديد البيانات
                    </h2>

                    <p className="mt-1 text-xs text-slate-400">
                      {selectionModes.find(
                        (item) =>
                          item.value ===
                          selectionMode,
                      )?.description}
                    </p>
                  </div>

                  <div className="rounded-xl bg-teal-50 px-3 py-2 text-center">
                    <p className="text-[10px] font-medium text-teal-600">
                      الكروت المتوقعة
                    </p>

                    <p className="mt-0.5 text-lg font-bold text-teal-700">
                      {selectionPreviewCount.toLocaleString(
                        "ar-EG",
                      )}
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-5 sm:p-6">
                {loading ? (
                  <div className="flex min-h-80 items-center justify-center">
                    <div className="text-center">
                      <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-xl bg-teal-50 text-teal-600">
                        <FiRefreshCw
                          size={18}
                          className="animate-spin"
                        />
                      </div>

                      <p className="mt-3 text-sm font-semibold text-slate-600">
                        جاري تحميل البيانات...
                      </p>
                    </div>
                  </div>
                ) : (
                  <>
                    {error && (
                      <div
                        role="alert"
                        className="mb-5 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-xs font-medium text-red-600"
                      >
                        {error}
                      </div>
                    )}

                    {selectionMode ===
                      "student" && (
                      <SingleStudentSelector
                        students={
                          filteredStudentOptions
                        }
                        selectedId={
                          selectedStudentId
                        }
                        search={
                          studentSearch
                        }
                        onSearch={
                          setStudentSearch
                        }
                        onSelect={(
                          id,
                        ) => {
                          setSelectedStudentId(
                            id,
                          );
                          setError("");
                        }}
                      />
                    )}

                    {selectionMode ===
                      "students" && (
                      <MultipleStudentSelector
                        students={
                          filteredStudentOptions
                        }
                        selectedIds={
                          selectedStudentIds
                        }
                        search={
                          studentSearch
                        }
                        onSearch={
                          setStudentSearch
                        }
                        onToggle={
                          toggleStudentSelection
                        }
                        onSelectAll={
                          selectAllVisibleStudents
                        }
                        onClearAll={
                          clearSelectedStudents
                        }
                      />
                    )}

                    {selectionMode ===
                      "group" && (
                      <SelectionField
                        label="المجموعة"
                        description="اختر المجموعة التي تريد طباعة كروت طلابها."
                        value={
                          selectedGroupId
                        }
                        onChange={(
                          value,
                        ) => {
                          setSelectedGroupId(
                            value,
                          );
                          setError("");
                        }}
                        placeholder="اختر المجموعة"
                      >
                        {groups.map(
                          (group) => (
                            <option
                              key={
                                group.id
                              }
                              value={
                                group.id
                              }
                            >
                              {group.name}
                              {group.grade
                                ? ` — ${group.grade}`
                                : ""}
                            </option>
                          ),
                        )}
                      </SelectionField>
                    )}

                    {selectionMode ===
                      "grade" && (
                      <SelectionField
                        label="الصف الدراسي"
                        description="اختر الصف الذي تريد تجهيز كروته."
                        value={
                          selectedGrade
                        }
                        onChange={(
                          value,
                        ) => {
                          setSelectedGrade(
                            value,
                          );
                          setError("");
                        }}
                        placeholder="اختر الصف"
                      >
                        {availableGrades.map(
                          (grade) => (
                            <option
                              key={grade}
                              value={grade}
                            >
                              {grade}
                            </option>
                          ),
                        )}
                      </SelectionField>
                    )}

                    {selectionMode ===
                      "teacher" && (
                      <SelectionField
                        label="المدرس"
                        description="سيتم اختيار الطلاب المرتبطين بالمجموعات الخاصة بالمدرس."
                        value={
                          selectedTeacher
                        }
                        onChange={(
                          value,
                        ) => {
                          setSelectedTeacher(
                            value,
                          );
                          setError("");
                        }}
                        placeholder="اختر المدرس"
                      >
                        {availableTeachers.map(
                          (teacher) => (
                            <option
                              key={
                                teacher
                              }
                              value={
                                teacher
                              }
                            >
                              {teacher}
                            </option>
                          ),
                        )}
                      </SelectionField>
                    )}

                    {selectionMode ===
                      "all" && (
                      <div className="rounded-2xl border border-teal-100 bg-teal-50/60 p-5">
                        <div className="flex items-start gap-4">
                          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white text-teal-600 shadow-sm">
                            <FiUsers
                              size={19}
                            />
                          </div>

                          <div>
                            <p className="text-sm font-bold text-slate-800">
                              جميع الطلاب
                            </p>

                            <p className="mt-1 text-xs leading-6 text-slate-500">
                              سيتم تجهيز كارت لكل طالب موجود حاليًا في النظام.
                            </p>

                            <p className="mt-3 text-sm font-bold text-teal-700">
                              {
                                students.length
                              }{" "}
                              طالب
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="mt-8 flex flex-col gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <p className="text-xs font-semibold text-slate-600">
                          جاهز لإنشاء الكروت؟
                        </p>

                        <p className="mt-1 text-[11px] text-slate-400">
                          يمكنك مراجعة جميع الكروت قبل تنفيذ الطباعة.
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={
                          handleGenerateCards
                        }
                        disabled={
                          selectionPreviewCount ===
                          0
                        }
                        className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-teal-600 px-6 text-sm font-semibold text-white shadow-sm transition hover:bg-teal-700 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400"
                      >
                        إنشاء الكروت
                        <FiArrowRight
                          size={16}
                          className="rotate-180"
                        />
                      </button>
                    </div>
                  </>
                )}
              </div>
            </section>
          </section>
        ) : (
          <BulkPreview
            cards={generatedCards}
            onBack={() => {
              setIsGenerated(false);
            }}
            onReset={handleReset}
            onPrint={handlePrint}
            onExportPdf={handleExportPdf}
          />
        )}
      </div>
    </main>
  );
}

function SingleStudentSelector({
  students,
  selectedId,
  search,
  onSearch,
  onSelect,
}: {
  students: Student[];
  selectedId: string;
  search: string;
  onSearch: (value: string) => void;
  onSelect: (id: string) => void;
}) {
  return (
    <div>
      <div className="mb-5">
        <label
          htmlFor="bulk-student-search"
          className="mb-2 block text-xs font-semibold text-slate-600"
        >
          البحث عن الطالب
        </label>

        <div className="relative">
          <FiSearch
            size={16}
            className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
          />

          <input
            id="bulk-student-search"
            type="search"
            value={search}
            onChange={(event) =>
              onSearch(
                event.target.value,
              )
            }
            placeholder="ابحث بالاسم أو رقم الطالب..."
            className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 pr-9 pl-3 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-teal-500 focus:bg-white focus:ring-4 focus:ring-teal-500/10"
          />
        </div>
      </div>

      <div className="max-h-96 overflow-y-auto rounded-xl border border-slate-200">
        {students.length === 0 ? (
          <EmptyStudents />
        ) : (
          students.map((student) => {
            const selected =
              selectedId === student.id;

            return (
              <button
                key={student.id}
                type="button"
                onClick={() =>
                  onSelect(student.id)
                }
                className={`flex w-full items-center gap-3 border-b border-slate-100 px-4 py-3 text-right last:border-0 transition ${
                  selected
                    ? "bg-teal-50"
                    : "hover:bg-slate-50"
                }`}
              >
                <div
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                    selected
                      ? "bg-teal-600 text-white"
                      : "bg-slate-100 text-slate-500"
                  }`}
                >
                  {student.name.charAt(0)}
                </div>

                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-slate-800">
                    {student.name}
                  </p>

                  <p className="mt-0.5 text-xs text-slate-400">
                    {student.studentId} ·{" "}
                    {student.grade}
                  </p>
                </div>

                {selected && (
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-teal-600 text-white">
                    <FiCheck size={14} />
                  </div>
                )}
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}

function MultipleStudentSelector({
  students,
  selectedIds,
  search,
  onSearch,
  onToggle,
  onSelectAll,
  onClearAll,
}: {
  students: Student[];
  selectedIds: string[];
  search: string;
  onSearch: (value: string) => void;
  onToggle: (id: string) => void;
  onSelectAll: () => void;
  onClearAll: () => void;
}) {
  return (
    <div>
      <div className="mb-5 flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <FiSearch
            size={16}
            className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
          />

          <input
            type="search"
            value={search}
            onChange={(event) =>
              onSearch(
                event.target.value,
              )
            }
            placeholder="ابحث بالاسم أو رقم الطالب..."
            className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 pr-9 pl-3 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-teal-500 focus:bg-white focus:ring-4 focus:ring-teal-500/10"
          />
        </div>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={onSelectAll}
            className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-600 transition hover:bg-slate-50"
          >
            تحديد الظاهر
          </button>

          <button
            type="button"
            onClick={onClearAll}
            className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-500 transition hover:bg-slate-50"
          >
            إلغاء التحديد
          </button>
        </div>
      </div>

      <div className="mb-3 flex items-center justify-between">
        <p className="text-xs text-slate-400">
          المحدد:{" "}
          <span className="font-bold text-teal-600">
            {selectedIds.length}
          </span>{" "}
          طالب
        </p>

        <p className="text-xs text-slate-400">
          الظاهر:{" "}
          <span className="font-semibold text-slate-600">
            {students.length}
          </span>
        </p>
      </div>

      <div className="max-h-96 overflow-y-auto rounded-xl border border-slate-200">
        {students.length === 0 ? (
          <EmptyStudents />
        ) : (
          students.map((student) => {
            const selected =
              selectedIds.includes(
                student.id,
              );

            return (
              <button
                key={student.id}
                type="button"
                onClick={() =>
                  onToggle(student.id)
                }
                className={`flex w-full items-center gap-3 border-b border-slate-100 px-4 py-3 text-right last:border-0 transition ${
                  selected
                    ? "bg-teal-50"
                    : "hover:bg-slate-50"
                }`}
              >
                <div
                  className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md border ${
                    selected
                      ? "border-teal-600 bg-teal-600 text-white"
                      : "border-slate-300 bg-white"
                  }`}
                >
                  {selected && (
                    <FiCheck size={12} />
                  )}
                </div>

                <div
                  className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                    selected
                      ? "bg-teal-100 text-teal-700"
                      : "bg-slate-100 text-slate-500"
                  }`}
                >
                  {student.name.charAt(0)}
                </div>

                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-slate-800">
                    {student.name}
                  </p>

                  <p className="mt-0.5 text-xs text-slate-400">
                    {student.studentId} ·{" "}
                    {student.grade}
                  </p>
                </div>
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}

function SelectionField({
  label,
  description,
  value,
  onChange,
  placeholder,
  children,
}: {
  label: string;
  description: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  children: ReactNode;
}) {
  return (
    <div className="max-w-2xl">
      <label className="block">
        <span className="mb-1.5 block text-sm font-semibold text-slate-700">
          {label}
        </span>

        <span className="mb-3 block text-xs leading-5 text-slate-400">
          {description}
        </span>

        <div className="relative">
          <select
            value={value}
            onChange={(event) =>
              onChange(
                event.target.value,
              )
            }
            className="h-11 w-full appearance-none rounded-xl border border-slate-200 bg-white px-3 pl-9 text-sm text-slate-700 outline-none transition hover:border-slate-300 focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10"
          >
            <option value="">
              {placeholder}
            </option>

            {children}
          </select>

          <FiChevronDown
            size={15}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          />
        </div>
      </label>
    </div>
  );
}

function BulkPreview({
  cards,
  onBack,
  onReset,
  onPrint,
  onExportPdf,
}: {
  cards: GeneratedCard[];
  onBack: () => void;
  onReset: () => void;
  onPrint: () => void;
  onExportPdf: () => void;
}) {
  return (
    <section className="print:block">
      <div className="mb-6 flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between print:hidden">
        <div>
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-teal-50 text-teal-600">
              <FiCheck size={17} />
            </div>

            <div>
              <h2 className="text-base font-bold text-slate-900">
                معاينة الكروت
              </h2>

              <p className="mt-1 text-xs text-slate-400">
                تم تجهيز{" "}
                <span className="font-bold text-teal-600">
                  {cards.length}
                </span>{" "}
                كارت للطباعة.
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={onBack}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 text-xs font-semibold text-slate-600 transition hover:bg-slate-50"
          >
            <FiArrowRight
              size={15}
            />
            تعديل الاختيار
          </button>

          <button
            type="button"
            onClick={onReset}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 text-xs font-semibold text-slate-600 transition hover:bg-slate-50"
          >
            <FiRefreshCw
              size={14}
            />
            بدء جديد
          </button>

          <button
            type="button"
            onClick={onExportPdf}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-teal-200 bg-teal-50 px-4 text-xs font-semibold text-teal-700 transition hover:bg-teal-100"
          >
            <FiFileText
              size={15}
            />
            تصدير PDF
          </button>

          <button
            type="button"
            onClick={onPrint}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-teal-600 px-5 text-xs font-semibold text-white shadow-sm transition hover:bg-teal-700"
          >
            <FiPrinter size={15} />
            طباعة
          </button>
        </div>
      </div>

      <div
        id="bulk-card-print-area"
        className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3 print:grid-cols-2 print:gap-6"
      >
        {cards.map((card) => (
          <BulkStudentCard
            key={card.student.id}
            card={card}
          />
        ))}
      </div>

      <div className="mt-6 rounded-xl border border-amber-100 bg-amber-50 px-4 py-3 text-xs leading-6 text-amber-700 print:hidden">
        <strong>ملاحظة:</strong>{" "}
        زر «تصدير PDF» يستخدم نافذة الطباعة
        الخاصة بالمتصفح، ومنها يمكنك اختيار
        «Save as PDF / حفظ كـ PDF». يُنشئ الكارت
        كود الحضور الخاص بالطالب ورمز بوابة ولي
        الأمر محليًا (Offline) ويتم حفظهما على
        الجهاز لاستمرار عمل القارئ الإلكتروني.
      </div>
    </section>
  );
}

function BulkStudentCard({
  card,
}: {
  card: GeneratedCard;
}) {
  const { student, groupName, teacherName } =
    card;

  return (
    <article className="mx-auto aspect-[1.586/1] w-full max-w-[520px] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-lg print:max-w-none print:break-inside-avoid print:shadow-none">
      <div className="flex h-full flex-col">
        <div className="flex items-center justify-between bg-slate-900 px-5 py-3 text-white">
          <div>
            <p className="text-[10px] font-medium tracking-wide text-slate-300">
              EDUCENTER
            </p>

            <p className="mt-0.5 text-xs font-bold">
              كارت الطالب
            </p>
          </div>

          <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/20 bg-white/10 text-[10px] font-bold">
            EC
          </div>
        </div>

        <div className="flex flex-1 gap-4 p-5">
          <div className="flex min-w-0 flex-1 flex-col">
            <div className="flex items-start gap-3">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-teal-50 text-lg font-bold text-teal-700">
                {student.name.charAt(0)}
              </div>

              <div className="min-w-0">
                <p className="truncate text-base font-bold text-slate-900">
                  {student.name}
                </p>

                <p className="mt-1 text-[10px] font-medium text-slate-400">
                  رقم الطالب:{" "}
                  <span className="font-bold text-slate-600">
                    {student.studentId}
                  </span>
                </p>
              </div>
            </div>

            <div className="mt-5 grid grid-cols-2 gap-2">
              <CardInfo
                label="المجموعة"
                value={groupName}
              />

              <CardInfo
                label="الصف"
                value={student.grade}
              />

              <CardInfo
                label="المدرس"
                value={teacherName}
              />

              <CardInfo
                label="الحالة"
                value={
                  student.status ===
                  "active"
                    ? "نشط"
                    : student.status ===
                      "suspended"
                    ? "متوقف"
                    : "غير نشط"
                }
              />
            </div>

            <div className="mt-auto rounded-xl border border-slate-100 bg-slate-50 px-3 py-2">
              <p className="text-[9px] font-medium text-slate-400">
                كود الحضور
              </p>

              <p className="mt-1 text-sm font-bold tracking-wider text-slate-800">
                {card.attendanceCode}
              </p>
            </div>
          </div>

          <div className="flex w-24 shrink-0 flex-col items-center justify-center">
            <div className="flex aspect-square w-full items-center justify-center rounded-xl border-2 border-slate-200 bg-white p-2">
              <CardQrCode value={card.parentQrValue} />
            </div>

            <p className="mt-2 text-center text-[8px] font-medium leading-4 text-slate-400">
              بوابة ولي
              <br />
              الأمر
            </p>
          </div>
        </div>
      </div>
    </article>
  );
}

function CardInfo({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="min-w-0 rounded-lg border border-slate-100 bg-white px-2.5 py-2">
      <p className="text-[8px] font-medium text-slate-400">
        {label}
      </p>

      <p className="mt-1 truncate text-[10px] font-bold text-slate-700">
        {value}
      </p>
    </div>
  );
}

function CardQrCode({
  value,
}: {
  value: string;
}) {
  const [qrUrl, setQrUrl] =
    useState<string>("");

  useEffect(() => {
    let mounted = true;

    generateQRCode(value, {
      width: 180,
      margin: 1,
    })
      .then((url) => {
        if (mounted) {
          setQrUrl(url);
        }
      })
      .catch(() => {
        // keep an empty placeholder on error
      });

    return () => {
      mounted = false;
    };
  }, [value]);

  if (!qrUrl) {
    return (
      <div
        className="aspect-square w-full bg-white"
        aria-label="جارٍ إنشاء الكود"
      />
    );
  }

  return (
    <Image
      src={qrUrl}
      alt="رمز بطاقة ولي الأمر"
      width={180}
      height={180}
      unoptimized
      className="h-auto w-full"
    />
  );
}

function EmptyStudents() {
  return (
    <div className="flex min-h-48 flex-col items-center justify-center px-6 text-center">
      <div className="flex h-11 w-11 items-center justify-center rounded-full bg-slate-100 text-slate-400">
        <FiSearch size={18} />
      </div>

      <p className="mt-3 text-sm font-semibold text-slate-700">
        لا توجد نتائج
      </p>

      <p className="mt-1 text-xs text-slate-400">
        جرّب تغيير كلمات البحث.
      </p>
    </div>
  );
}
