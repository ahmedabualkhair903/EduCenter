"use client";

import { useMemo, useState, type ReactNode } from "react";
import {
  FiCheckCircle,
  FiChevronDown,
  FiClock,
  FiLogOut,
  FiSearch,
  FiUsers,
} from "react-icons/fi";

import type {
  AttendanceRecord,
  AttendanceStatus,
} from "@/types/attendance";

/* -------------------------------------------------------------------------- */
/* Types                                                                      */
/* -------------------------------------------------------------------------- */

type CheckOutRecord = {
  id: string;
  studentId: string;
  groupId: string;
  lessonId: string;

  student: string;
  phone: string;
  group: string;
  subject: string;

  checkIn: string;
  checkOut: string;
};

type CheckOutStatus = "inside" | "checked-out";

/* -------------------------------------------------------------------------- */
/* Mock Data                                                                  */
/* -------------------------------------------------------------------------- */

/**
 * بيانات تجريبية مؤقتة.
 *
 * عند ربط Backend لاحقًا، يتم استبدال هذه البيانات بمصدر Attendance Service
 * بدون الحاجة لتغيير واجهة الصفحة أو منطق تسجيل الانصراف.
 */
const initialRecords: CheckOutRecord[] = [
  {
    id: "attendance-1",
    studentId: "student-1",
    groupId: "group-a",
    lessonId: "lesson-1",
    student: "محمد أحمد علي",
    phone: "01012345678",
    group: "مجموعة أ",
    subject: "الرياضيات",
    checkIn: "03:52 م",
    checkOut: "05:05 م",
  },
  {
    id: "attendance-2",
    studentId: "student-2",
    groupId: "group-a",
    lessonId: "lesson-1",
    student: "أحمد محمد حسن",
    phone: "01123456789",
    group: "مجموعة أ",
    subject: "الرياضيات",
    checkIn: "03:58 م",
    checkOut: "05:03 م",
  },
  {
    id: "attendance-3",
    studentId: "student-3",
    groupId: "group-b",
    lessonId: "lesson-2",
    student: "سارة محمود",
    phone: "01234567890",
    group: "مجموعة ب",
    subject: "اللغة الإنجليزية",
    checkIn: "05:47 م",
    checkOut: "06:40 م",
  },
  {
    id: "attendance-5",
    studentId: "student-5",
    groupId: "group-d",
    lessonId: "lesson-4",
    student: "نور أحمد",
    phone: "01199887766",
    group: "مجموعة د",
    subject: "الكيمياء",
    checkIn: "08:22 م",
    checkOut: "-",
  },
  {
    id: "attendance-7",
    studentId: "student-7",
    groupId: "group-b",
    lessonId: "lesson-2",
    student: "ملك أحمد",
    phone: "01055667788",
    group: "مجموعة ب",
    subject: "اللغة الإنجليزية",
    checkIn: "05:21 م",
    checkOut: "-",
  },
  {
    id: "attendance-8",
    studentId: "student-8",
    groupId: "group-a",
    lessonId: "lesson-1",
    student: "عبد الرحمن سامي",
    phone: "01122334455",
    group: "مجموعة أ",
    subject: "الرياضيات",
    checkIn: "04:17 م",
    checkOut: "-",
  },
];

const groups = [
  "الكل",
  "مجموعة أ",
  "مجموعة ب",
  "مجموعة ج",
  "مجموعة د",
] as const;

/* -------------------------------------------------------------------------- */
/* Page                                                                       */
/* -------------------------------------------------------------------------- */

export default function CheckOutPage() {
  const [records, setRecords] =
    useState<CheckOutRecord[]>(initialRecords);

  const [search, setSearch] = useState("");
  const [groupFilter, setGroupFilter] =
    useState<string>("الكل");

  const [isLoading] = useState(false);
  const [error] = useState("");

  /* ------------------------------------------------------------------------ */
  /* Derived Data                                                             */
  /* ------------------------------------------------------------------------ */

  const filteredRecords = useMemo(() => {
    const query = search.trim().toLowerCase();

    return records.filter((record) => {
      const searchableText = [
        record.student,
        record.studentId,
        record.phone,
        record.group,
        record.subject,
      ]
        .join(" ")
        .toLowerCase();

      const matchesSearch =
        !query || searchableText.includes(query);

      const matchesGroup =
        groupFilter === "الكل" ||
        record.group === groupFilter;

      return matchesSearch && matchesGroup;
    });
  }, [records, search, groupFilter]);

  const insideCount = records.filter(
    (record) =>
      hasCheckIn(record) &&
      !hasCheckOut(record),
  ).length;

  const checkedOutCount = records.filter(
    (record) => hasCheckOut(record),
  ).length;

  /* ------------------------------------------------------------------------ */
  /* Actions                                                                  */
  /* ------------------------------------------------------------------------ */

  const checkOutStudent = (id: string) => {
    setRecords((current) =>
      current.map((record) => {
        if (record.id !== id) {
          return record;
        }

        if (
          !hasCheckIn(record) ||
          hasCheckOut(record)
        ) {
          return record;
        }

        return {
          ...record,
          checkOut: getCurrentTime(),
        };
      }),
    );
  };

  const checkOutAll = () => {
    if (insideCount === 0) {
      return;
    }

    const currentTime = getCurrentTime();

    setRecords((current) =>
      current.map((record) => {
        if (
          !hasCheckIn(record) ||
          hasCheckOut(record)
        ) {
          return record;
        }

        return {
          ...record,
          checkOut: currentTime,
        };
      }),
    );
  };

  const clearFilters = () => {
    setSearch("");
    setGroupFilter("الكل");
  };

  /* ------------------------------------------------------------------------ */
  /* Loading                                                                  */
  /* ------------------------------------------------------------------------ */

  if (isLoading) {
    return (
      <main
        dir="rtl"
        className="min-h-screen bg-slate-50"
      >
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <div className="mb-6">
            <div className="h-4 w-32 animate-pulse rounded bg-slate-200" />

            <div className="mt-4 h-8 w-64 animate-pulse rounded bg-slate-200" />

            <div className="mt-2 h-4 w-80 animate-pulse rounded bg-slate-200" />
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((item) => (
              <div
                key={item}
                className="h-28 animate-pulse rounded-xl border border-slate-200 bg-white"
              />
            ))}
          </div>

          <div className="mt-6 h-96 animate-pulse rounded-xl border border-slate-200 bg-white" />
        </div>
      </main>
    );
  }

  /* ------------------------------------------------------------------------ */
  /* Error                                                                    */
  /* ------------------------------------------------------------------------ */

  if (error) {
    return (
      <main
        dir="rtl"
        className="min-h-screen bg-slate-50"
      >
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <div className="rounded-xl border border-red-100 bg-red-50 p-6 text-center">
            <h1 className="text-sm font-bold text-red-700">
              تعذر تحميل بيانات الانصراف
            </h1>

            <p className="mt-2 text-xs text-red-600">
              {error}
            </p>
          </div>
        </div>
      </main>
    );
  }

  /* ------------------------------------------------------------------------ */
  /* Render                                                                   */
  /* ------------------------------------------------------------------------ */

  return (
    <main
      dir="rtl"
      className="min-h-screen bg-slate-50"
    >
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        {/* Header */}

        <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="mb-2 flex items-center gap-2 text-xs font-medium text-slate-400">
              <span>الرئيسية</span>

              <span>/</span>

              <span>الحضور</span>

              <span>/</span>

              <span className="text-teal-600">
                الانصراف
              </span>
            </div>

            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              تسجيل الانصراف
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              متابعة الطلاب الموجودين داخل المركز وتسجيل
              وقت الانصراف بدقة.
            </p>
          </div>

          <button
            type="button"
            onClick={checkOutAll}
            disabled={insideCount === 0}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-teal-600 px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-teal-700 active:scale-[0.98] focus:outline-none focus:ring-4 focus:ring-teal-500/20 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400"
          >
            <FiLogOut size={16} />

            تسجيل خروج الكل
          </button>
        </div>

        {/* Stats */}

        <section className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <StatCard
            icon={<FiUsers size={19} />}
            label="إجمالي المسجلين"
            value={records.length}
            className="text-slate-700"
          />

          <StatCard
            icon={<FiClock size={19} />}
            label="داخل المركز"
            value={insideCount}
            className="text-teal-600"
          />

          <StatCard
            icon={<FiLogOut size={19} />}
            label="تم تسجيل انصرافهم"
            value={checkedOutCount}
            className="text-emerald-600"
          />
        </section>

        {/* Current Status */}

        <section className="mb-6 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div
                className={`flex h-10 w-10 items-center justify-center rounded-lg ${
                  insideCount > 0
                    ? "bg-teal-50 text-teal-600"
                    : "bg-emerald-50 text-emerald-600"
                }`}
              >
                {insideCount > 0 ? (
                  <FiUsers size={18} />
                ) : (
                  <FiCheckCircle size={18} />
                )}
              </div>

              <div>
                <p className="text-xs text-slate-400">
                  حالة الانصراف الحالية
                </p>

                <p className="mt-0.5 text-sm font-semibold text-slate-800">
                  {insideCount > 0
                    ? `يوجد ${insideCount.toLocaleString(
                        "ar-EG",
                      )} طالب داخل المركز`
                    : "تم تسجيل انصراف جميع الطلاب"}
                </p>
              </div>
            </div>

            <span
              className={`inline-flex w-fit items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] font-semibold ${
                insideCount > 0
                  ? "bg-teal-50 text-teal-700"
                  : "bg-emerald-50 text-emerald-700"
              }`}
            >
              <span
                className={`h-1.5 w-1.5 rounded-full ${
                  insideCount > 0
                    ? "bg-teal-500"
                    : "bg-emerald-500"
                }`}
              />

              {insideCount > 0
                ? "متابعة الانصراف"
                : "لا يوجد طلاب بالداخل"}
            </span>
          </div>
        </section>

        {/* Main Table */}

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
                  placeholder="ابحث باسم الطالب أو رقم الطالب أو رقم الهاتف..."
                  aria-label="البحث في سجل الانصراف"
                  className="h-10 w-full rounded-lg border border-slate-200 bg-slate-50 pr-9 pl-3 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-teal-500 focus:bg-white focus:ring-4 focus:ring-teal-500/10"
                />
              </div>

              <div className="relative">
                <select
                  value={groupFilter}
                  onChange={(event) =>
                    setGroupFilter(event.target.value)
                  }
                  aria-label="المجموعة"
                  className="h-10 min-w-40 appearance-none rounded-lg border border-slate-200 bg-white px-3 pl-9 text-sm text-slate-600 outline-none transition hover:border-slate-300 focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10"
                >
                  {groups.map((group) => (
                    <option
                      key={group}
                      value={group}
                    >
                      {group === "الكل"
                        ? "كل المجموعات"
                        : group}
                    </option>
                  ))}
                </select>

                <FiChevronDown
                  size={15}
                  className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                />
              </div>
            </div>
          </div>

          {/* Result Count */}

          <div className="border-b border-slate-100 px-5 py-3">
            <p className="text-xs text-slate-400">
              عرض{" "}
              <span className="font-semibold text-slate-600">
                {filteredRecords.length}
              </span>{" "}
              طالب
            </p>
          </div>

          {/* Empty State */}

          {filteredRecords.length === 0 ? (
            <div className="flex min-h-72 flex-col items-center justify-center px-6 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-400">
                <FiSearch size={20} />
              </div>

              <h3 className="mt-4 text-sm font-bold text-slate-800">
                لا توجد نتائج
              </h3>

              <p className="mt-1 text-xs text-slate-400">
                جرّب تغيير البحث أو المجموعة.
              </p>

              {(search || groupFilter !== "الكل") && (
                <button
                  type="button"
                  onClick={clearFilters}
                  className="mt-4 text-xs font-semibold text-teal-600 hover:text-teal-700"
                >
                  مسح الفلاتر
                </button>
              )}
            </div>
          ) : (
            <>
              {/* Table */}

              <div className="overflow-x-auto">
                <table className="w-full min-w-[950px] text-right">
                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50/70">
                      <th className="px-5 py-3 text-xs font-semibold text-slate-500">
                        الطالب
                      </th>

                      <th className="px-5 py-3 text-xs font-semibold text-slate-500">
                        المجموعة
                      </th>

                      <th className="px-5 py-3 text-xs font-semibold text-slate-500">
                        المادة
                      </th>

                      <th className="px-5 py-3 text-xs font-semibold text-slate-500">
                        الدخول
                      </th>

                      <th className="px-5 py-3 text-xs font-semibold text-slate-500">
                        الخروج
                      </th>

                      <th className="px-5 py-3 text-xs font-semibold text-slate-500">
                        الحالة
                      </th>

                      <th className="px-5 py-3 text-xs font-semibold text-slate-500">
                        الإجراء
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {filteredRecords.map((record) => {
                      const status = getCheckOutStatus(
                        record,
                      );

                      const checkedOut =
                        status === "checked-out";

                      return (
                        <tr
                          key={record.id}
                          className="border-b border-slate-100 transition last:border-0 hover:bg-slate-50/70"
                        >
                          {/* Student */}

                          <td className="px-5 py-4">
                            <div className="flex items-center gap-3">
                              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-100 text-xs font-bold text-slate-600">
                                {getInitials(
                                  record.student,
                                )}
                              </div>

                              <div>
                                <p className="text-sm font-semibold text-slate-800">
                                  {record.student}
                                </p>

                                <div className="mt-0.5 flex items-center gap-2">
                                  <span className="text-[10px] text-slate-400">
                                    {record.studentId}
                                  </span>

                                  <span className="text-slate-300">
                                    •
                                  </span>

                                  <span
                                    dir="ltr"
                                    className="text-right text-[10px] text-slate-400"
                                  >
                                    {record.phone}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </td>

                          {/* Group */}

                          <td className="px-5 py-4">
                            <span className="text-sm text-slate-600">
                              {record.group}
                            </span>
                          </td>

                          {/* Subject */}

                          <td className="px-5 py-4">
                            <span className="text-sm text-slate-600">
                              {record.subject}
                            </span>
                          </td>

                          {/* Check In */}

                          <td className="px-5 py-4">
                            <span className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-600">
                              <FiClock
                                size={13}
                                className="text-slate-400"
                              />

                              {record.checkIn}
                            </span>
                          </td>

                          {/* Check Out */}

                          <td className="px-5 py-4">
                            <span
                              className={[
                                "inline-flex items-center gap-1.5 text-xs font-medium",
                                checkedOut
                                  ? "text-slate-600"
                                  : "text-slate-400",
                              ].join(" ")}
                            >
                              <FiLogOut size={13} />

                              {record.checkOut}
                            </span>
                          </td>

                          {/* Status */}

                          <td className="px-5 py-4">
                            {checkedOut ? (
                              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-700">
                                <FiCheckCircle
                                  size={12}
                                />

                                تم الانصراف
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1.5 rounded-full bg-teal-50 px-2.5 py-1 text-[11px] font-semibold text-teal-700">
                                <span className="h-1.5 w-1.5 rounded-full bg-teal-500" />

                                داخل المركز
                              </span>
                            )}
                          </td>

                          {/* Action */}

                          <td className="px-5 py-4">
                            {checkedOut ? (
                              <span className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-400">
                                <FiCheckCircle
                                  size={14}
                                />

                                تم التسجيل
                              </span>
                            ) : (
                              <button
                                type="button"
                                onClick={() =>
                                  checkOutStudent(
                                    record.id,
                                  )
                                }
                                disabled={
                                  !hasCheckIn(record)
                                }
                                className="inline-flex h-8 items-center justify-center gap-1.5 rounded-md bg-slate-100 px-3 text-xs font-semibold text-slate-600 transition hover:bg-teal-50 hover:text-teal-700 active:scale-[0.98] focus:outline-none focus:ring-4 focus:ring-teal-500/10 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-300"
                              >
                                <FiLogOut size={14} />

                                تسجيل الخروج
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Footer */}

              <div className="flex flex-col gap-3 border-t border-slate-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-xs text-slate-400">
                  الطلاب الموجودون داخل المركز:{" "}
                  <span className="font-semibold text-slate-600">
                    {insideCount.toLocaleString(
                      "ar-EG",
                    )}
                  </span>
                </p>

                <span className="flex w-fit items-center gap-1.5 rounded-md bg-teal-50 px-3 py-1.5 text-xs font-semibold text-teal-700">
                  <FiUsers size={13} />

                  متابعة الانصراف
                </span>
              </div>
            </>
          )}
        </section>

        {/* Information */}

        {insideCount === 0 && (
          <div className="mt-4 flex items-start gap-3 rounded-xl border border-emerald-100 bg-emerald-50 p-4">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white text-emerald-600">
              <FiCheckCircle size={17} />
            </div>

            <div>
              <p className="text-sm font-semibold text-emerald-800">
                تم تسجيل انصراف جميع الطلاب
              </p>

              <p className="mt-1 text-xs text-emerald-600">
                لا يوجد حاليًا أي طالب مسجل كـ "داخل
                المركز".
              </p>
            </div>
          </div>
        )}

        {insideCount > 0 && (
          <div className="mt-4 flex items-start gap-3 rounded-xl border border-teal-100 bg-teal-50 p-4">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white text-teal-600">
              <FiClock size={17} />
            </div>

            <div>
              <p className="text-sm font-semibold text-teal-800">
                يوجد طلاب لم يسجلوا الانصراف بعد
              </p>

              <p className="mt-1 text-xs leading-5 text-teal-600">
                يمكنك تسجيل الانصراف لكل طالب بشكل
                منفصل أو استخدام زر "تسجيل خروج الكل".
              </p>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

/* -------------------------------------------------------------------------- */
/* Components                                                                 */
/* -------------------------------------------------------------------------- */

function StatCard({
  icon,
  label,
  value,
  className,
}: {
  icon: ReactNode;
  label: string;
  value: number;
  className: string;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-slate-500">
            {label}
          </p>

          <p
            className={`mt-1 text-2xl font-bold ${className}`}
          >
            {value.toLocaleString("ar-EG")}
          </p>
        </div>

        <div
          className={`flex h-10 w-10 items-center justify-center rounded-lg bg-slate-50 ${className}`}
        >
          {icon}
        </div>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Attendance Helpers                                                         */
/* -------------------------------------------------------------------------- */

function getCheckOutStatus(
  record: CheckOutRecord,
): CheckOutStatus {
  return hasCheckOut(record)
    ? "checked-out"
    : "inside";
}

function hasCheckIn(record: CheckOutRecord) {
  return (
    Boolean(record.checkIn) &&
    record.checkIn !== "-"
  );
}

function hasCheckOut(record: CheckOutRecord) {
  return (
    Boolean(record.checkOut) &&
    record.checkOut !== "-"
  );
}

/**
 * يحول الوقت الحالي إلى الشكل المستخدم في واجهة النظام.
 */
function getCurrentTime() {
  return new Intl.DateTimeFormat("ar-EG", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  }).format(new Date());
}

function getInitials(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((word) => word.charAt(0))
    .join("");
}