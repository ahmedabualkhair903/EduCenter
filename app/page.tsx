
"use client";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import Link from "next/link";
import { useRouter } from "next/navigation";

import {
  FiActivity,
  FiArrowLeft,
  FiBookOpen,
  FiCalendar,
  FiCheckCircle,
  FiDollarSign,
  FiSearch,
  FiUsers,
  FiUserPlus,
  FiX,
} from "react-icons/fi";

import StudentModal, {
  type StudentFormData,
} from "@/components/students/StudentModal";

import { paymentService, studentService } from "@/services";
import type { Student } from "@/types";

const quickActions = [
  {
    label: "الطلاب",
    description: "إدارة بيانات الطلاب",
    href: "/students",
    icon: FiUsers,
  },
  {
    label: "الحضور",
    description: "متابعة حضور الطلاب",
    href: "/attendance",
    icon: FiCalendar,
  },
  {
    label: "المجموعات",
    description: "إدارة المجموعات",
    href: "/groups",
    icon: FiBookOpen,
  },
  {
    label: "المدفوعات",
    description: "متابعة المصروفات",
    href: "/payments",
    icon: FiDollarSign,
  },
];

export default function Home() {
  const router = useRouter();

  const [students, setStudents] = useState<Student[]>([]);
  const [search, setSearch] = useState("");
  const [showStudentModal, setShowStudentModal] =
    useState(false);
  const [successStudent, setSuccessStudent] =
    useState<Student | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchOpen, setSearchOpen] = useState(false);

  useEffect(() => {
    let mounted = true;

    const loadStudents = async () => {
      try {
        const data = await studentService.list();

        if (mounted) {
          setStudents(data);
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

  const filteredStudents = useMemo(() => {
    const normalizedSearch = search
      .trim()
      .toLowerCase();

    if (!normalizedSearch) {
      return [];
    }

    return students
      .filter((student) => {
        return [
          student.name,
          student.studentId,
          student.phone,
          student.guardianName,
          student.guardianPhone,
        ].some((value) =>
          value
            ?.toLowerCase()
            .includes(normalizedSearch),
        );
      })
      .slice(0, 6);
  }, [search, students]);

  const handleCreateStudent = async (
    form: StudentFormData,
  ) => {
    const now = new Date().toISOString();

    const totalRequired = Math.max(
      Number(form.totalRequired ?? 0),
      0,
    );

    const initialPayment = Math.min(
      Math.max(
        Number(form.initialPayment ?? 0),
        0,
      ),
      totalRequired,
    );

    const student: Student = {
      id: `student-${Date.now()}`,
      studentId: form.studentId,
      name: form.name,
      phone: form.phone,
      guardianName: form.guardianName,
      guardianPhone: form.guardianPhone,
      grade: form.grade,
      groupId: form.groupId,
      address: form.address,
      status: form.status,
      notes: form.notes,
      customFields: form.customFields,
      financial: {
        totalRequired,
        paid: initialPayment,
        remaining: Math.max(
          totalRequired - initialPayment,
          0,
        ),
      },
      createdAt: now,
      updatedAt: now,
    };

    const createdStudent =
      await studentService.create(student);

    if (initialPayment > 0) {
      await paymentService.create({
        studentId: createdStudent.id,
        amount: initialPayment,
        method: "cash",
        paidAt: now,
        notes: "دفعة أولى عند تسجيل الطالب",
      });
    }

    setStudents((current) => [
      createdStudent,
      ...current,
    ]);

    setShowStudentModal(false);
    setSuccessStudent(createdStudent);
    setSearch("");
  };

  const handleSearchSelect = (
    student: Student,
  ) => {
    router.push(
      `/students?studentId=${encodeURIComponent(
        student.id,
      )}`,
    );
  };

  const closeSuccess = () => {
    setSuccessStudent(null);
  };

  return (
    <main
      dir="rtl"
      className="min-h-screen bg-slate-50"
    >
      <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
          <div className="relative px-5 py-7 sm:px-8 sm:py-9 lg:px-10">
            <div className="absolute -left-24 -top-24 h-64 w-64 rounded-full bg-teal-50 blur-3xl" />
            <div className="absolute -bottom-32 right-1/3 h-64 w-64 rounded-full bg-sky-50 blur-3xl" />

            <div className="relative">
              <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
                <div>
                  <div className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-teal-50 text-teal-600">
                    <FiUserPlus size={21} />
                  </div>

                  <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                    تسجيل طالب جديد
                  </h1>

                  <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
                    ابدأ تسجيل الطالب من هنا، وأضف بياناته
                    الأساسية والمجموعة والمصروفات والدفعة الأولى
                    في خطوة واحدة.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    setShowStudentModal(true)
                  }
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-teal-600 px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-teal-700 active:scale-[0.98]"
                >
                  <FiUserPlus size={17} />
                  تسجيل طالب جديد
                </button>
              </div>

              <div className="mt-8 max-w-3xl">
                <div className="mb-2 flex items-center justify-between">
                  <label
                    htmlFor="home-student-search"
                    className="text-xs font-semibold text-slate-600"
                  >
                    البحث السريع عن طالب
                  </label>

                  {loading && (
                    <span className="text-[11px] text-slate-400">
                      جاري التحميل...
                    </span>
                  )}
                </div>

                <div className="relative">
                  <FiSearch
                    size={18}
                    className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-400"
                  />

                  <input
                    id="home-student-search"
                    value={search}
                    onFocus={() =>
                      setSearchOpen(true)
                    }
                    onChange={(event) => {
                      setSearch(
                        event.target.value,
                      );
                      setSearchOpen(true);
                    }}
                    placeholder="ابحث بالاسم أو رقم الطالب أو الهاتف..."
                    className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 pr-11 pl-11 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-teal-500 focus:bg-white focus:ring-4 focus:ring-teal-500/10"
                  />

                  {search && (
                    <button
                      type="button"
                      onClick={() => {
                        setSearch("");
                        setSearchOpen(false);
                      }}
                      aria-label="مسح البحث"
                      className="absolute left-3 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-md text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                    >
                      <FiX size={15} />
                    </button>
                  )}

                  {searchOpen &&
                    search.trim() && (
                      <div className="absolute right-0 top-[calc(100%+8px)] z-20 w-full overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl">
                        {filteredStudents.length ===
                        0 ? (
                          <div className="px-4 py-5 text-center">
                            <p className="text-sm font-medium text-slate-600">
                              لا توجد نتائج مطابقة
                            </p>

                            <p className="mt-1 text-xs text-slate-400">
                              يمكنك تسجيل الطالب كطالب جديد.
                            </p>

                            <button
                              type="button"
                              onClick={() => {
                                setSearchOpen(
                                  false,
                                );
                                setShowStudentModal(
                                  true,
                                );
                              }}
                              className="mt-4 inline-flex h-9 items-center gap-1.5 rounded-lg bg-teal-600 px-3 text-xs font-semibold text-white transition hover:bg-teal-700"
                            >
                              <FiUserPlus
                                size={13}
                              />
                              تسجيل طالب جديد
                            </button>
                          </div>
                        ) : (
                          <div className="divide-y divide-slate-100">
                            {filteredStudents.map(
                              (student) => (
                                <button
                                  key={student.id}
                                  type="button"
                                  onClick={() =>
                                    handleSearchSelect(
                                      student,
                                    )
                                  }
                                  className="flex w-full items-center justify-between gap-4 px-4 py-3 text-right transition hover:bg-slate-50"
                                >
                                  <div className="min-w-0">
                                    <p className="truncate text-sm font-semibold text-slate-800">
                                      {student.name}
                                    </p>

                                    <p className="mt-1 text-xs text-slate-400">
                                      {student.studentId}
                                      {" • "}
                                      {student.phone ||
                                        "بدون هاتف"}
                                    </p>
                                  </div>

                                  <FiArrowLeft
                                    size={16}
                                    className="shrink-0 text-slate-300"
                                  />
                                </button>
                              ),
                            )}
                          </div>
                        )}
                      </div>
                    )}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="mt-6">
          <div className="mb-4">
            <h2 className="text-base font-bold text-slate-900">
              الإجراءات السريعة
            </h2>

            <p className="mt-1 text-xs text-slate-400">
              الوصول السريع لأكثر المهام استخدامًا.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {quickActions.map((action) => {
              const Icon = action.icon;

              return (
                <Link
                  key={action.href}
                  href={action.href}
                  className="group rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-teal-200 hover:shadow-md"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-50 text-slate-500 transition group-hover:bg-teal-50 group-hover:text-teal-600">
                      <Icon size={18} />
                    </div>

                    <FiArrowLeft
                      size={16}
                      className="text-slate-300 transition group-hover:-translate-x-1 group-hover:text-teal-500"
                    />
                  </div>

                  <h3 className="mt-4 text-sm font-bold text-slate-800">
                    {action.label}
                  </h3>

                  <p className="mt-1 text-xs text-slate-400">
                    {action.description}
                  </p>
                </Link>
              );
            })}
          </div>
        </section>

        <section className="mt-6 grid gap-4 lg:grid-cols-2">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                <FiActivity size={18} />
              </div>

              <div>
                <h2 className="text-sm font-bold text-slate-800">
                  تشغيل سريع
                </h2>

                <p className="mt-1 text-xs leading-5 text-slate-400">
                  استخدم البحث السريع للوصول إلى الطالب،
                  أو ابدأ تسجيل طالب جديد مباشرة من الصفحة
                  الرئيسية.
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
                <FiDollarSign size={18} />
              </div>

              <div>
                <h2 className="text-sm font-bold text-slate-800">
                  المصروفات عند التسجيل
                </h2>

                <p className="mt-1 text-xs leading-5 text-slate-400">
                  يمكنك تسجيل إجمالي المطلوب والدفعة الأولى
                  أثناء إضافة الطالب، وسيتم احتساب المتبقي
                  تلقائيًا.
                </p>
              </div>
            </div>
          </div>
        </section>
      </div>

      <StudentModal
        open={showStudentModal}
        onClose={() =>
          setShowStudentModal(false)
        }
        onSubmit={handleCreateStudent}
        mode="add"
        showFinancialFields
      />

      {successStudent && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-[2px]">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="student-success-title"
            className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                  <FiCheckCircle size={22} />
                </div>

                <div>
                  <h2
                    id="student-success-title"
                    className="text-base font-bold text-slate-900"
                  >
                    تم تسجيل الطالب بنجاح
                  </h2>

                  <p className="mt-1 text-xs text-slate-400">
                    تم حفظ بيانات الطالب والدفعة الأولى إن
                    وُجدت.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={closeSuccess}
                aria-label="إغلاق"
                className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
              >
                <FiX size={17} />
              </button>
            </div>

            <div className="mt-5 rounded-xl bg-slate-50 p-4">
              <p className="text-sm font-bold text-slate-800">
                {successStudent.name}
              </p>

              <p className="mt-1 text-xs text-slate-400">
                رقم الطالب: {successStudent.studentId}
              </p>

              <div className="mt-4 grid grid-cols-3 gap-2">
                <div className="rounded-lg border border-slate-200 bg-white p-3 text-center">
                  <p className="text-[10px] text-slate-400">
                    المطلوب
                  </p>

                  <p className="mt-1 text-sm font-bold text-slate-800">
                    {successStudent.financial.totalRequired}
                  </p>
                </div>

                <div className="rounded-lg border border-slate-200 bg-white p-3 text-center">
                  <p className="text-[10px] text-slate-400">
                    المدفوع
                  </p>

                  <p className="mt-1 text-sm font-bold text-emerald-600">
                    {successStudent.financial.paid}
                  </p>
                </div>

                <div className="rounded-lg border border-slate-200 bg-white p-3 text-center">
                  <p className="text-[10px] text-slate-400">
                    المتبقي
                  </p>

                  <p className="mt-1 text-sm font-bold text-amber-600">
                    {successStudent.financial.remaining}
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-5 flex gap-2">
              <button
                type="button"
                onClick={closeSuccess}
                className="h-10 flex-1 rounded-lg border border-slate-200 bg-white px-4 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
              >
                تسجيل طالب آخر
              </button>

              <Link
                href="/students"
                className="inline-flex h-10 flex-1 items-center justify-center rounded-lg bg-teal-600 px-4 text-sm font-semibold text-white transition hover:bg-teal-700"
              >
                عرض الطلاب
              </Link>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
