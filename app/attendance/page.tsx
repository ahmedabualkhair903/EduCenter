"use client";

import { useMemo, useState, type ReactNode } from "react";
import {
  FiCalendar,
  FiCheckCircle,
  FiChevronDown,
  FiClock,
  FiDownload,
  FiLogOut,
  FiSearch,
  FiUserCheck,
  FiUserX,
  FiUsers,
} from "react-icons/fi";

import type { AttendanceStatus } from "@/types/attendance";

type AttendanceTableRecord = {
  id: string;
  studentId: string;
  groupId: string;
  lessonId: string;

  student: string;
  phone: string;
  group: string;
  subject: string;

  status: AttendanceStatus;
  checkIn: string;
  checkOut: string;
};

const initialRecords: AttendanceTableRecord[] = [
  {
    id: "attendance-1",
    studentId: "student-1",
    groupId: "group-a",
    lessonId: "lesson-1",
    student: "محمد أحمد علي",
    phone: "01012345678",
    group: "مجموعة أ",
    subject: "الرياضيات",
    status: "present",
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
    status: "present",
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
    status: "late",
    checkIn: "05:47 م",
    checkOut: "06:40 م",
  },
  {
    id: "attendance-4",
    studentId: "student-4",
    groupId: "group-c",
    lessonId: "lesson-3",
    student: "يوسف خالد",
    phone: "01098765432",
    group: "مجموعة ج",
    subject: "الفيزياء",
    status: "absent",
    checkIn: "-",
    checkOut: "-",
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
    status: "present",
    checkIn: "08:22 م",
    checkOut: "09:28 م",
  },
  {
    id: "attendance-6",
    studentId: "student-6",
    groupId: "group-c",
    lessonId: "lesson-3",
    student: "عمر محمد",
    phone: "01211223344",
    group: "مجموعة ج",
    subject: "الفيزياء",
    status: "unrecorded",
    checkIn: "-",
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
    status: "present",
    checkIn: "05:21 م",
    checkOut: "06:32 م",
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
    status: "late",
    checkIn: "04:17 م",
    checkOut: "05:08 م",
  },
];

const groups = [
  "الكل",
  "مجموعة أ",
  "مجموعة ب",
  "مجموعة ج",
  "مجموعة د",
] as const;

const statuses = [
  "الكل",
  "present",
  "absent",
  "late",
  "unrecorded",
] as const;

type StatusFilter = (typeof statuses)[number];

const statusLabels: Record<StatusFilter, string> = {
  الكل: "الكل",
  present: "حاضر",
  absent: "غائب",
  late: "متأخر",
  unrecorded: "لم يسجل",
};

export default function AttendancePage() {
  const [records, setRecords] =
    useState<AttendanceTableRecord[]>(initialRecords);

  const [search, setSearch] = useState("");

  const [groupFilter, setGroupFilter] =
    useState<string>("الكل");

  const [statusFilter, setStatusFilter] =
    useState<StatusFilter>("الكل");

  const [date, setDate] =
    useState("2026-08-23");

  const filteredRecords = useMemo(() => {
    const query = search.trim().toLowerCase();

    return records.filter((record) => {
      const searchableText = [
        record.student,
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

      const matchesStatus =
        statusFilter === "الكل" ||
        record.status === statusFilter;

      return (
        matchesSearch &&
        matchesGroup &&
        matchesStatus
      );
    });
  }, [
    records,
    search,
    groupFilter,
    statusFilter,
  ]);

  const presentCount = records.filter(
    (record) => record.status === "present",
  ).length;

  const absentCount = records.filter(
    (record) => record.status === "absent",
  ).length;

  const lateCount = records.filter(
    (record) => record.status === "late",
  ).length;

  const notRecordedCount = records.filter(
    (record) => record.status === "unrecorded",
  ).length;

  const checkIn = (
    id: string,
    status: "present" | "late",
  ) => {
    setRecords((current) =>
      current.map((record) => {
        if (record.id !== id) {
          return record;
        }

        return {
          ...record,
          status,
          checkIn:
            record.checkIn === "-"
              ? getCurrentTime()
              : record.checkIn,
        };
      }),
    );
  };

  const checkOut = (id: string) => {
    setRecords((current) =>
      current.map((record) => {
        if (record.id !== id) {
          return record;
        }

        const canCheckOut =
          record.checkIn !== "-" &&
          record.status !== "absent" &&
          record.status !== "unrecorded";

        if (!canCheckOut) {
          return record;
        }

        return {
          ...record,
          checkOut:
            record.checkOut === "-"
              ? getCurrentTime()
              : record.checkOut,
        };
      }),
    );
  };

  const markAbsent = (id: string) => {
    setRecords((current) =>
      current.map((record) => {
        if (record.id !== id) {
          return record;
        }

        return {
          ...record,
          status: "absent",
          checkIn: "-",
          checkOut: "-",
        };
      }),
    );
  };

  const markAllPresent = () => {
    const currentTime = getCurrentTime();

    setRecords((current) =>
      current.map((record) => ({
        ...record,
        status: "present",
        checkIn:
          record.checkIn === "-"
            ? currentTime
            : record.checkIn,
      })),
    );
  };

  const exportAttendance = () => {
    const header =
      "الطالب,رقم الهاتف,المجموعة,المادة,الحالة,وقت الدخول,وقت الخروج";

    const rows = records.map((record) =>
      [
        record.student,
        record.phone,
        record.group,
        record.subject,
        getStatusLabel(record.status),
        record.checkIn,
        record.checkOut,
      ]
        .map((value) => `"${escapeCsvValue(value)}"`)
        .join(","),
    );

    const csv = [header, ...rows].join("\n");

    const blob = new Blob(["\ufeff" + csv], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = `attendance-${date}.csv`;

    document.body.appendChild(link);
    link.click();
    link.remove();

    URL.revokeObjectURL(url);
  };

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
              <span className="text-teal-600">
                الحضور والغياب
              </span>
            </div>

            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              الحضور والغياب
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              تسجيل ومتابعة حضور الطلاب يوميًا.
            </p>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row">
            <button
              type="button"
              onClick={markAllPresent}
              className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 text-sm font-medium text-slate-600 transition hover:border-teal-200 hover:bg-teal-50 hover:text-teal-700 focus:outline-none focus:ring-4 focus:ring-teal-500/10"
            >
              <FiCheckCircle size={16} />
              تسجيل الكل حاضر
            </button>

            <button
              type="button"
              onClick={exportAttendance}
              className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-teal-600 px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-teal-700 active:scale-[0.98] focus:outline-none focus:ring-4 focus:ring-teal-500/20"
            >
              <FiDownload size={16} />
              تصدير التقرير
            </button>
          </div>
        </div>

        {/* Date */}

        <section className="mb-6 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-teal-50 text-teal-600">
                <FiCalendar size={18} />
              </div>

              <div>
                <p className="text-xs text-slate-400">
                  تاريخ الحضور
                </p>

                <p className="mt-0.5 text-sm font-semibold text-slate-800">
                  {formatArabicDate(date)}
                </p>
              </div>
            </div>

            <input
              type="date"
              value={date}
              onChange={(event) =>
                setDate(event.target.value)
              }
              aria-label="تاريخ الحضور"
              className="field w-full md:w-44"
            />
          </div>
        </section>

        {/* Stats */}

        <section className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <AttendanceStat
            icon={<FiUserCheck size={19} />}
            label="حاضر"
            value={presentCount}
            className="text-emerald-600"
          />

          <AttendanceStat
            icon={<FiUserX size={19} />}
            label="غائب"
            value={absentCount}
            className="text-red-500"
          />

          <AttendanceStat
            icon={<FiClock size={19} />}
            label="متأخر"
            value={lateCount}
            className="text-amber-600"
          />

          <AttendanceStat
            icon={<FiUsers size={19} />}
            label="لم يسجل"
            value={notRecordedCount}
            className="text-slate-600"
          />
        </section>

        {/* Attendance Table */}

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
                  placeholder="ابحث باسم الطالب أو رقم الهاتف..."
                  aria-label="البحث في الحضور"
                  className="h-10 w-full rounded-lg border border-slate-200 bg-slate-50 pr-9 pl-3 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-teal-500 focus:bg-white focus:ring-4 focus:ring-teal-500/10"
                />
              </div>

              <Select
                value={groupFilter}
                onChange={setGroupFilter}
                options={groups}
                label="المجموعة"
              />

              <Select
                value={statusFilter}
                onChange={(value) =>
                  setStatusFilter(
                    value as StatusFilter,
                  )
                }
                options={statuses}
                label="الحالة"
                formatOption={(option) =>
                  statusLabels[option as StatusFilter]
                }
              />
            </div>
          </div>

          {/* Result */}

          <div className="border-b border-slate-100 px-5 py-3">
            <p className="text-xs text-slate-400">
              عرض{" "}
              <span className="font-semibold text-slate-600">
                {filteredRecords.length}
              </span>{" "}
              طالب
            </p>
          </div>

          {/* Table */}

          <div className="overflow-x-auto">
            <table className="w-full min-w-[1100px] text-right">
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
                    الحالة
                  </th>

                  <th className="px-5 py-3 text-xs font-semibold text-slate-500">
                    الدخول
                  </th>

                  <th className="px-5 py-3 text-xs font-semibold text-slate-500">
                    الخروج
                  </th>

                  <th className="px-5 py-3 text-xs font-semibold text-slate-500">
                    تسجيل
                  </th>
                </tr>
              </thead>

              <tbody>
                {filteredRecords.map((record) => {
                  const canCheckOut =
                    record.checkIn !== "-" &&
                    record.status !== "absent" &&
                    record.status !== "unrecorded";

                  const hasCheckedOut =
                    record.checkOut !== "-";

                  return (
                    <tr
                      key={record.id}
                      className="border-b border-slate-100 transition last:border-0 hover:bg-slate-50/70"
                    >
                      {/* Student */}

                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-100 text-xs font-bold text-slate-600">
                            {getInitials(record.student)}
                          </div>

                          <div>
                            <p className="text-sm font-semibold text-slate-800">
                              {record.student}
                            </p>

                            <p
                              dir="ltr"
                              className="mt-0.5 text-right text-[10px] text-slate-400"
                            >
                              {record.phone}
                            </p>
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

                      {/* Status */}

                      <td className="px-5 py-4">
                        <StatusBadge
                          status={record.status}
                        />
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
                          className={`inline-flex items-center gap-1.5 text-xs font-medium ${
                            hasCheckedOut
                              ? "text-slate-600"
                              : "text-slate-400"
                          }`}
                        >
                          <FiLogOut size={13} />
                          {record.checkOut}
                        </span>
                      </td>

                      {/* Actions */}

                      <td className="px-5 py-4">
                        <div className="flex items-center gap-1.5">
                          {/* Present */}

                          <button
                            type="button"
                            onClick={() =>
                              checkIn(
                                record.id,
                                "present",
                              )
                            }
                            className={`flex h-8 w-8 items-center justify-center rounded-md transition focus:outline-none focus:ring-4 focus:ring-emerald-500/10 ${
                              record.status === "present"
                                ? "bg-emerald-100 text-emerald-700"
                                : "bg-slate-100 text-slate-400 hover:bg-emerald-50 hover:text-emerald-600"
                            }`}
                            aria-label="تسجيل حضور"
                            title="تسجيل حضور"
                          >
                            <FiCheckCircle size={15} />
                          </button>

                          {/* Absent */}

                          <button
                            type="button"
                            onClick={() =>
                              markAbsent(record.id)
                            }
                            className={`flex h-8 w-8 items-center justify-center rounded-md transition focus:outline-none focus:ring-4 focus:ring-red-500/10 ${
                              record.status === "absent"
                                ? "bg-red-100 text-red-600"
                                : "bg-slate-100 text-slate-400 hover:bg-red-50 hover:text-red-500"
                            }`}
                            aria-label="تسجيل غياب"
                            title="تسجيل غياب"
                          >
                            <FiUserX size={15} />
                          </button>

                          {/* Late */}

                          <button
                            type="button"
                            onClick={() =>
                              checkIn(
                                record.id,
                                "late",
                              )
                            }
                            className={`flex h-8 w-8 items-center justify-center rounded-md transition focus:outline-none focus:ring-4 focus:ring-amber-500/10 ${
                              record.status === "late"
                                ? "bg-amber-100 text-amber-700"
                                : "bg-slate-100 text-slate-400 hover:bg-amber-50 hover:text-amber-600"
                            }`}
                            aria-label="تسجيل تأخير"
                            title="تسجيل تأخير"
                          >
                            <FiClock size={15} />
                          </button>

                          {/* Check Out */}

                          <button
                            type="button"
                            onClick={() =>
                              checkOut(record.id)
                            }
                            disabled={
                              !canCheckOut ||
                              hasCheckedOut
                            }
                            className={`flex h-8 w-8 items-center justify-center rounded-md transition focus:outline-none focus:ring-4 focus:ring-teal-500/10 ${
                              hasCheckedOut
                                ? "bg-teal-100 text-teal-700"
                                : canCheckOut
                                  ? "bg-slate-100 text-slate-400 hover:bg-teal-50 hover:text-teal-600"
                                  : "cursor-not-allowed bg-slate-50 text-slate-300"
                            }`}
                            aria-label="تسجيل خروج"
                            title={
                              hasCheckedOut
                                ? "تم تسجيل الخروج"
                                : canCheckOut
                                  ? "تسجيل خروج"
                                  : "يجب تسجيل الدخول أولًا"
                            }
                          >
                            <FiLogOut size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {filteredRecords.length === 0 && (
              <div className="flex min-h-64 flex-col items-center justify-center px-6 text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-400">
                  <FiSearch size={20} />
                </div>

                <h3 className="mt-4 text-sm font-bold text-slate-800">
                  لا توجد نتائج
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
              إجمالي الطلاب:{" "}
              <span className="font-semibold text-slate-600">
                {filteredRecords.length}
              </span>
            </p>

            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled
                className="h-8 rounded-md border border-slate-200 px-3 text-xs text-slate-400 disabled:cursor-not-allowed"
              >
                السابق
              </button>

              <span className="flex h-8 min-w-8 items-center justify-center rounded-md bg-teal-600 px-2 text-xs font-semibold text-white">
                1
              </span>

              <button
                type="button"
                disabled
                className="h-8 rounded-md border border-slate-200 px-3 text-xs text-slate-400 disabled:cursor-not-allowed"
              >
                التالي
              </button>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

/* -------------------------------------------------------------------------- */
/* Components                                                                  */
/* -------------------------------------------------------------------------- */

function AttendanceStat({
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

function Select({
  value,
  onChange,
  options,
  label,
  formatOption,
}: {
  value: string;
  onChange: (value: string) => void;
  options: readonly string[];
  label: string;
  formatOption?: (option: string) => string;
}) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(event) =>
          onChange(event.target.value)
        }
        aria-label={label}
        className="h-10 min-w-36 appearance-none rounded-lg border border-slate-200 bg-white px-3 pl-9 text-sm text-slate-600 outline-none transition hover:border-slate-300 focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10"
      >
        {options.map((option) => (
          <option
            key={option}
            value={option}
          >
            {formatOption
              ? formatOption(option)
              : option === "الكل"
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

function StatusBadge({
  status,
}: {
  status: AttendanceStatus;
}) {
  const styles: Record<AttendanceStatus, string> = {
    present: "bg-emerald-50 text-emerald-700",
    absent: "bg-red-50 text-red-600",
    late: "bg-amber-50 text-amber-700",
    excused: "bg-blue-50 text-blue-700",
    unrecorded: "bg-slate-100 text-slate-500",
  };

  return (
    <span
      className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${styles[status]}`}
    >
      {getStatusLabel(status)}
    </span>
  );
}

/* -------------------------------------------------------------------------- */
/* Helpers                                                                     */
/* -------------------------------------------------------------------------- */

function getStatusLabel(
  status: AttendanceStatus,
) {
  const labels: Record<
    AttendanceStatus,
    string
  > = {
    present: "حاضر",
    absent: "غائب",
    late: "متأخر",
    excused: "معذور",
    unrecorded: "لم يسجل",
  };

  return labels[status];
}

function escapeCsvValue(value: string) {
  return value.replace(/"/g, '""');
}

function getInitials(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((word) => word.charAt(0))
    .join("");
}

function getCurrentTime() {
  return new Intl.DateTimeFormat("ar-EG", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  }).format(new Date());
}

function formatArabicDate(date: string) {
  const parsedDate = new Date(
    `${date}T12:00:00`,
  );

  if (Number.isNaN(parsedDate.getTime())) {
    return date;
  }

  return new Intl.DateTimeFormat("ar-EG", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(parsedDate);
}