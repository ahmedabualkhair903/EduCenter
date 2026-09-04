"use client";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import Link from "next/link";

import {
  FiChevronDown,
  FiEdit2,
  FiEye,
  FiPlus,
  FiPrinter,
  FiSearch,
  FiUsers,
} from "react-icons/fi";

import StudentDetailsModal from "@/components/students/StudentDetailsModal";

import StudentModal, {
  type StudentFormData,
} from "@/components/students/StudentModal";

import { studentService } from "@/services/studentService";

import type {
  Student,
  StudentStatus,
} from "@/types";

const groupNames: Record<
  string,
  string
> = {
  "group-001": "مجموعة أ",
  "group-002": "مجموعة ب",
  "group-003": "مجموعة ج",
};

const statusLabels: Record<
  StudentStatus,
  string
> = {
  active: "نشط",
  inactive: "غير نشط",
  suspended: "متوقف",
};

const groups = [
  "الكل",
  "group-001",
  "group-002",
  "group-003",
];

export default function StudentsPage() {
  const [students, setStudents] =
    useState<Student[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [search, setSearch] =
    useState("");

  const [status, setStatus] =
    useState<
      "الكل" | StudentStatus
    >("الكل");

  const [group, setGroup] =
    useState("الكل");

  const [addModalOpen, setAddModalOpen] =
    useState(false);

  const [editModalOpen, setEditModalOpen] =
    useState(false);

  const [editingStudent, setEditingStudent] =
    useState<Student | null>(null);

  const [selectedStudent, setSelectedStudent] =
    useState<Student | null>(null);

  const [detailsOpen, setDetailsOpen] =
    useState(false);

  const [page, setPage] = useState(1);

  useEffect(() => {
    let mounted = true;

    const loadStudents = async () => {
      try {
        setLoading(true);

        const data =
          await studentService.list();

        if (mounted) {
          setStudents(data);
        }
      } catch {
        if (mounted) {
          setStudents([]);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    void loadStudents();

    return () => {
      mounted = false;
    };
  }, []);

  const activeStudents = useMemo(
    () =>
      students.filter(
        (student) =>
          student.status ===
          "active",
      ).length,
    [students],
  );

  const studentsWithBalance =
    useMemo(
      () =>
        students.filter(
          (student) =>
            student.financial
              .remaining > 0,
        ).length,
      [students],
    );

  const totalBalance = useMemo(
    () =>
      students.reduce(
        (total, student) =>
          total +
          student.financial
            .remaining,
        0,
      ),
    [students],
  );

  const filteredStudents =
    useMemo(() => {
      const normalizedSearch =
        search
          .trim()
          .toLowerCase();

      return students.filter(
        (student) => {
          const matchesSearch =
            !normalizedSearch ||
            student.name
              .toLowerCase()
              .includes(
                normalizedSearch,
              ) ||
            (
              student.phone ?? ""
            ).includes(
              normalizedSearch,
            ) ||
            student.guardianName
              .toLowerCase()
              .includes(
                normalizedSearch,
              ) ||
            student.studentId
              .toLowerCase()
              .includes(
                normalizedSearch,
              );

          const matchesStatus =
            status === "الكل" ||
            student.status ===
              status;

          const matchesGroup =
            group === "الكل" ||
            student.groupId ===
              group;

          return (
            matchesSearch &&
            matchesStatus &&
            matchesGroup
          );
        },
      );
    }, [
      students,
      search,
      status,
      group,
    ]);

  const pageSize = 8;

  const pageCount = useMemo(
    () =>
      Math.max(
        1,
        Math.ceil(
          filteredStudents.length /
            pageSize,
        ),
      ),
    [filteredStudents],
  );

  const visibleStudents = useMemo(
    () =>
      filteredStudents.slice(
        (page - 1) * pageSize,
        page * pageSize,
      ),
    [filteredStudents, page],
  );

  const firstVisibleIndex =
    filteredStudents.length === 0
      ? 0
      : (page - 1) * pageSize + 1;

  const lastVisibleIndex =
    Math.min(
      page * pageSize,
      filteredStudents.length,
    );

  const handleAddStudent = async (
    data: StudentFormData,
  ) => {
    const now =
      new Date().toISOString();

    const newStudent: Student = {
      id: `student-${Date.now()}`,
      studentId:
        data.studentId.trim(),
      name: data.name.trim(),
      phone: data.phone.trim(),
      guardianName:
        data.guardianName.trim(),
      guardianPhone:
        data.guardianPhone.trim(),
      grade: data.grade,
      groupId: data.groupId,
      address: data.address.trim(),
      status: data.status,
      notes: data.notes.trim(),
      customFields:
        data.customFields ?? [],
      financial: {
        totalRequired: 0,
        paid: 0,
        remaining: 0,
      },
      createdAt: now,
      updatedAt: now,
    };

    try {
      const createdStudent =
        await studentService.create(
          newStudent,
        );

      setStudents((current) => [
        createdStudent,
        ...current,
      ]);

      setAddModalOpen(false);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "تعذر إضافة الطالب";

      window.alert(message);
    }
  };

  const handleViewStudent = (
    student: Student,
  ) => {
    setSelectedStudent(student);
    setDetailsOpen(true);
  };

  const handleEditStudent = (
    student: Student,
  ) => {
    setEditingStudent(student);
    setDetailsOpen(false);
    setEditModalOpen(true);
  };

  const handleUpdateStudent =
    async (
      data: StudentFormData,
    ) => {
      if (!editingStudent) {
        return;
      }

      try {
        const updatedStudent =
          await studentService.update(
            editingStudent.id,
            {
              studentId:
                data.studentId.trim(),
              name: data.name.trim(),
              phone: data.phone.trim(),
              guardianName:
                data.guardianName.trim(),
              guardianPhone:
                data.guardianPhone.trim(),
              grade: data.grade,
              groupId: data.groupId,
              address:
                data.address.trim(),
              status: data.status,
              notes:
                data.notes.trim(),
              customFields:
                data.customFields ?? [],
            },
          );

        if (!updatedStudent) {
          window.alert(
            "تعذر العثور على الطالب",
          );
          return;
        }

        setStudents((current) =>
          current.map((student) =>
            student.id ===
            updatedStudent.id
              ? updatedStudent
              : student,
          ),
        );

        setSelectedStudent(
          (current) =>
            current?.id ===
            updatedStudent.id
              ? updatedStudent
              : current,
        );

        setEditModalOpen(false);
        setEditingStudent(null);
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : "تعذر تعديل بيانات الطالب";

        window.alert(message);
      }
    };

  const handleCloseDetails =
    () => {
      setDetailsOpen(false);
      setSelectedStudent(null);
    };

  const clearFilters = () => {
    setSearch("");
    setStatus("الكل");
    setGroup("الكل");
    setPage(1);
  };

  return (
    <main
      dir="rtl"
      className="min-h-screen bg-slate-50"
    >
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <section className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="mb-2 flex items-center gap-2 text-xs font-medium text-slate-400">
              <span>الرئيسية</span>
              <span>/</span>
              <span className="text-teal-600">
                الطلاب
              </span>
            </div>

            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              الطلاب
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              إدارة بيانات الطلاب ومتابعة حالتهم الدراسية والمالية.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/students/bulk-card-printing"
              className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 active:scale-[0.98]"
            >
              <FiPrinter size={17} />
              طباعة الكروت
            </Link>

            <button
              type="button"
              onClick={() =>
                setAddModalOpen(true)
              }
              className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-teal-600 px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-teal-700 active:scale-[0.98]"
            >
              <FiPlus size={17} />
              إضافة طالب
            </button>
          </div>
        </section>

        <section className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <SummaryCard
            label="إجمالي الطلاب"
            value={students.length}
            icon={
              <FiUsers size={19} />
            }
            iconClassName="bg-teal-50 text-teal-600"
          />

          <SummaryCard
            label="الطلاب النشطون"
            value={activeStudents}
            description="من إجمالي الطلاب"
            valueClassName="text-emerald-600"
          />

          <SummaryCard
            label="عليهم مستحقات"
            value={
              studentsWithBalance
            }
            description="يحتاجون متابعة مالية"
            valueClassName="text-amber-600"
          />

          <SummaryCard
            label="إجمالي المستحقات"
            value={`${totalBalance.toLocaleString(
              "ar-EG",
            )} ج.م`}
            description="إجمالي الديون الحالية"
          />
        </section>

        <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 p-4 sm:p-5">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
              <div className="relative flex-1">
                <FiSearch
                  size={17}
                  className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <input
                  type="search"
                  value={search}
                  onChange={(event) => {
                    setSearch(
                      event.target.value,
                    );

                    setPage(1);
                  }}
                  placeholder="ابحث باسم الطالب أو رقم الطالب أو الهاتف أو ولي الأمر..."
                  aria-label="البحث عن طالب"
                  className="h-10 w-full rounded-lg border border-slate-200 bg-slate-50 pr-9 pl-3 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-teal-500 focus:bg-white focus:ring-4 focus:ring-teal-500/10"
                />
              </div>

              <FilterSelect
                value={status}
                onChange={(value) => {
                  setStatus(
                    value as
                      | "الكل"
                      | StudentStatus,
                  );

                  setPage(1);
                }}
                ariaLabel="فلترة حسب الحالة"
              >
                <option value="الكل">
                  كل الحالات
                </option>

                <option value="active">
                  نشط
                </option>

                <option value="inactive">
                  غير نشط
                </option>

                <option value="suspended">
                  متوقف
                </option>
              </FilterSelect>

              <FilterSelect
                value={group}
                onChange={(value) => {
                  setGroup(value);

                  setPage(1);
                }}
                ariaLabel="فلترة حسب المجموعة"
              >
                {groups.map(
                  (item) => (
                    <option
                      key={item}
                      value={item}
                    >
                      {item ===
                      "الكل"
                        ? "كل المجموعات"
                        : groupNames[
                            item
                          ]}
                    </option>
                  ),
                )}
              </FilterSelect>

              {(search ||
                status !==
                  "الكل" ||
                group !==
                  "الكل") && (
                <button
                  type="button"
                  onClick={
                    clearFilters
                  }
                  className="h-10 shrink-0 rounded-lg px-3 text-xs font-semibold text-slate-500 transition hover:bg-slate-100 hover:text-slate-800"
                >
                  مسح الفلاتر
                </button>
              )}
            </div>
          </div>

          <div className="border-b border-slate-100 px-5 py-3">
            <p className="text-xs text-slate-400">
              تم العثور على{" "}
              <span className="font-semibold text-slate-600">
                {filteredStudents.length.toLocaleString(
                  "ar-EG",
                )}
              </span>{" "}
              طالب
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[950px] text-right">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/70">
                  <TableHeader>
                    الطالب
                  </TableHeader>

                  <TableHeader>
                    ولي الأمر
                  </TableHeader>

                  <TableHeader>
                    المجموعة
                  </TableHeader>

                  <TableHeader>
                    المرحلة
                  </TableHeader>

                  <TableHeader>
                    الحالة
                  </TableHeader>

                  <TableHeader>
                    المستحقات
                  </TableHeader>

                  <TableHeader>
                    إجراءات
                  </TableHeader>
                </tr>
              </thead>

              <tbody>
                {loading ? (
                  <tr>
                    <td
                      colSpan={7}
                      className="px-5 py-16 text-center text-sm text-slate-400"
                    >
                      جاري تحميل بيانات الطلاب...
                    </td>
                  </tr>
                ) : (
                  visibleStudents.map(
                    (student) => (
                      <tr
                        key={
                          student.id
                        }
                        className="border-b border-slate-100 transition last:border-0 hover:bg-slate-50/70"
                      >
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-teal-50 text-xs font-bold text-teal-700">
                              {student.name.charAt(
                                0,
                              )}
                            </div>

                            <div className="min-w-0">
                              <p className="truncate text-sm font-semibold text-slate-800">
                                {student.name}
                              </p>

                              <p className="mt-0.5 text-xs text-slate-400">
                                {
                                  student.studentId
                                }
                              </p>
                            </div>
                          </div>
                        </td>

                        <td className="px-5 py-4">
                          <p className="text-sm text-slate-600">
                            {
                              student.guardianName
                            }
                          </p>

                          <p
                            dir="ltr"
                            className="mt-0.5 text-right text-xs text-slate-400"
                          >
                            {
                              student.guardianPhone
                            }
                          </p>
                        </td>

                        <td className="px-5 py-4">
                          <span className="rounded-md bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
                            {student.groupId
                              ? groupNames[
                                  student.groupId
                                ] ??
                                "غير محددة"
                              : "غير محددة"}
                          </span>
                        </td>

                        <td className="px-5 py-4 text-sm text-slate-600">
                          {student.grade}
                        </td>

                        <td className="px-5 py-4">
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
                        </td>

                        <td className="px-5 py-4">
                          {student.financial
                            .remaining ===
                          0 ? (
                            <span className="text-sm font-medium text-emerald-600">
                              لا يوجد
                            </span>
                          ) : (
                            <span className="text-sm font-semibold text-amber-600">
                              {student.financial.remaining.toLocaleString(
                                "ar-EG",
                              )}{" "}
                              ج.م
                            </span>
                          )}
                        </td>

                        <td className="px-5 py-4">
                          <div className="flex items-center gap-1">
                            <ActionButton
                              label={`عرض ${student.name}`}
                              onClick={() =>
                                handleViewStudent(
                                  student,
                                )
                              }
                            >
                              <FiEye
                                size={16}
                              />
                            </ActionButton>

                            <ActionButton
                              label={`تعديل ${student.name}`}
                              onClick={() =>
                                handleEditStudent(
                                  student,
                                )
                              }
                            >
                              <FiEdit2
                                size={15}
                              />
                            </ActionButton>

                            <ActionButton
                              href={`/students/${student.id}/card-designer`}
                              label={`تصميم كارت ${student.name}`}
                            >
                              <FiPrinter
                                size={16}
                              />
                            </ActionButton>
                          </div>
                        </td>
                      </tr>
                    ),
                  )
                )}
              </tbody>
            </table>

            {!loading &&
              filteredStudents.length ===
                0 && (
                <div className="flex min-h-64 flex-col items-center justify-center px-6 text-center">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-400">
                    <FiSearch
                      size={20}
                    />
                  </div>

                  <h3 className="mt-4 text-sm font-bold text-slate-800">
                    لا توجد نتائج
                  </h3>

                  <p className="mt-1 text-xs text-slate-400">
                    جرّب تغيير كلمات البحث أو الفلاتر.
                  </p>

                  <button
                    type="button"
                    onClick={
                      clearFilters
                    }
                    className="mt-4 rounded-lg bg-teal-50 px-3 py-2 text-xs font-semibold text-teal-700 transition hover:bg-teal-100"
                  >
                    مسح الفلاتر
                  </button>
                </div>
              )}
          </div>

          <div className="flex flex-col gap-3 border-t border-slate-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs text-slate-400">
              عرض{" "}
              <span className="font-semibold text-slate-600">
                {filteredStudents.length === 0
                  ? 0
                  : firstVisibleIndex.toLocaleString(
                      "ar-EG",
                    )}
              </span>
              {" - "}
              <span className="font-semibold text-slate-600">
                {lastVisibleIndex.toLocaleString(
                  "ar-EG",
                )}
              </span>{" "}
              من أصل{" "}
              <span className="font-semibold text-slate-600">
                {filteredStudents.length.toLocaleString(
                  "ar-EG",
                )}
              </span>{" "}
              طالب
            </p>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() =>
                  setPage((current) =>
                    Math.max(1, current - 1),
                  )
                }
                disabled={page === 1}
                className="h-8 rounded-md border border-slate-200 px-3 text-xs font-medium text-slate-500 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:text-slate-300"
              >
                السابق
              </button>

              {Array.from(
                { length: pageCount },
                (_, index) => index + 1,
              ).map((pageNumber) => (
                <button
                  key={pageNumber}
                  type="button"
                  onClick={() =>
                    setPage(pageNumber)
                  }
                  aria-current={
                    pageNumber === page
                      ? "page"
                      : undefined
                  }
                  className={`h-8 min-w-8 rounded-md px-2 text-xs font-semibold transition ${
                    pageNumber === page
                      ? "bg-teal-600 text-white"
                      : "border border-slate-200 text-slate-500 hover:bg-slate-50"
                  }`}
                >
                  {pageNumber.toLocaleString(
                    "ar-EG",
                  )}
                </button>
              ))}

              <button
                type="button"
                onClick={() =>
                  setPage((current) =>
                    Math.min(
                      pageCount,
                      current + 1,
                    ),
                  )
                }
                disabled={page === pageCount}
                className="h-8 rounded-md border border-slate-200 px-3 text-xs font-medium text-slate-500 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:text-slate-300"
              >
                التالي
              </button>
            </div>
          </div>
        </section>
      </div>

      <StudentModal
        open={addModalOpen}
        onClose={() =>
          setAddModalOpen(false)
        }
        onSubmit={
          handleAddStudent
        }
        mode="add"
      />

      <StudentModal
        open={editModalOpen}
        onClose={() => {
          setEditModalOpen(false);
          setEditingStudent(null);
        }}
        onSubmit={
          handleUpdateStudent
        }
        mode="edit"
        initialData={
          editingStudent
        }
      />

      <StudentDetailsModal
        open={detailsOpen}
        student={
          selectedStudent
        }
        onClose={
          handleCloseDetails
        }
        onEdit={
          handleEditStudent
        }
      />
    </main>
  );
}

function SummaryCard({
  label,
  value,
  description,
  icon,
  iconClassName = "bg-slate-100 text-slate-500",
  valueClassName = "text-slate-900",
}: {
  label: string;
  value: number | string;
  description?: string;
  icon?: React.ReactNode;
  iconClassName?: string;
  valueClassName?: string;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between gap-4">
        <div className="min-w-0">
          <p className="text-sm text-slate-500">
            {label}
          </p>

          <p
            className={`mt-1 text-2xl font-bold ${valueClassName}`}
          >
            {typeof value ===
            "number"
              ? value.toLocaleString(
                  "ar-EG",
                )
              : value}
          </p>

          {description && (
            <p className="mt-1 text-xs text-slate-400">
              {description}
            </p>
          )}
        </div>

        {icon && (
          <div
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${iconClassName}`}
          >
            {icon}
          </div>
        )}
      </div>
    </div>
  );
}

function FilterSelect({
  value,
  onChange,
  children,
  ariaLabel,
}: {
  value: string;
  onChange: (
    value: string,
  ) => void;
  children: React.ReactNode;
  ariaLabel: string;
}) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(event) =>
          onChange(
            event.target.value,
          )
        }
        aria-label={ariaLabel}
        className="h-10 min-w-36 appearance-none rounded-lg border border-slate-200 bg-white px-3 pl-9 text-sm text-slate-600 outline-none transition hover:border-slate-300 focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10"
      >
        {children}
      </select>

      <FiChevronDown
        size={15}
        className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
      />
    </div>
  );
}

function TableHeader({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <th className="px-5 py-3 text-xs font-semibold text-slate-500">
      {children}
    </th>
  );
}

function ActionButton({
  children,
  label,
  onClick,
  href,
}: {
  children: React.ReactNode;
  label: string;
  onClick?: () => void;
  href?: string;
}) {
  const className =
    "flex h-8 w-8 items-center justify-center rounded-md text-slate-400 transition hover:bg-teal-50 hover:text-teal-600 focus:outline-none focus:ring-2 focus:ring-teal-500/20";

  if (href) {
    return (
      <Link
        href={href}
        aria-label={label}
        className={className}
      >
        {children}
      </Link>
    );
  }

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className={className}
    >
      {children}
    </button>
  );
}