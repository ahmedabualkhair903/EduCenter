"use client";

import {
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  FiAlertCircle,
  FiCalendar,
  FiCheck,
  FiCheckCircle,
  FiChevronDown,
  FiClock,
  FiLock,
  FiLogOut,
  FiMapPin,
  FiPlay,
  FiRefreshCw,
  FiSearch,
  FiShield,
  FiUserCheck,
  FiUsers,
  FiX,
} from "react-icons/fi";

import type {
  AttendanceRecord,
  AttendanceSessionStatus,
  AttendanceStatus,
  SuspiciousAttendanceCase,
} from "@/types";

/* -------------------------------------------------------------------------- */
/* Local UI Types                                                             */
/* -------------------------------------------------------------------------- */

type GroupOption = {
  id: string;
  name: string;
  subject: string;
  studentsCount: number;
};

type LessonOption = {
  id: string;
  groupId: string;
  title: string;
  time: string;
};

/* -------------------------------------------------------------------------- */
/* Mock UI Data                                                               */
/* -------------------------------------------------------------------------- */

const groups: GroupOption[] = [
  {
    id: "group-a",
    name: "مجموعة أ",
    subject: "الرياضيات",
    studentsCount: 32,
  },
  {
    id: "group-b",
    name: "مجموعة ب",
    subject: "اللغة الإنجليزية",
    studentsCount: 28,
  },
  {
    id: "group-c",
    name: "مجموعة ج",
    subject: "الفيزياء",
    studentsCount: 24,
  },
  {
    id: "group-d",
    name: "مجموعة د",
    subject: "الكيمياء",
    studentsCount: 30,
  },
];

const lessons: LessonOption[] = [
  {
    id: "lesson-1",
    groupId: "group-a",
    title: "حصة الرياضيات",
    time: "04:00 م - 05:30 م",
  },
  {
    id: "lesson-2",
    groupId: "group-b",
    title: "حصة اللغة الإنجليزية",
    time: "05:00 م - 06:30 م",
  },
  {
    id: "lesson-3",
    groupId: "group-c",
    title: "حصة الفيزياء",
    time: "06:00 م - 07:30 م",
  },
  {
    id: "lesson-4",
    groupId: "group-d",
    title: "حصة الكيمياء",
    time: "08:00 م - 09:30 م",
  },
];

const initialAttendance: AttendanceRecord[] = [
  {
    id: "attendance-1",
    studentId: "student-1",
    groupId: "group-a",
    lessonId: "lesson-1",
    student: "محمد أحمد علي",
    phone: "01012345678",
    status: "present",
    checkedInAt: "2026-08-26T15:52:00",
    deviceId: "DEVICE-204",
    locationStatus: "allowed",
  },
  {
    id: "attendance-2",
    studentId: "student-2",
    groupId: "group-a",
    lessonId: "lesson-1",
    student: "أحمد محمد حسن",
    phone: "01123456789",
    status: "present",
    checkedInAt: "2026-08-26T15:58:00",
    deviceId: "DEVICE-204",
    locationStatus: "allowed",
  },
  {
    id: "attendance-3",
    studentId: "student-3",
    groupId: "group-a",
    lessonId: "lesson-1",
    student: "سارة محمود",
    phone: "01234567890",
    status: "late",
    checkedInAt: "2026-08-26T16:17:00",
    deviceId: "DEVICE-310",
    locationStatus: "allowed",
  },
  {
    id: "attendance-4",
    studentId: "student-4",
    groupId: "group-a",
    lessonId: "lesson-1",
    student: "يوسف خالد",
    phone: "01098765432",
    status: "present",
    checkedInAt: "2026-08-26T16:21:00",
    deviceId: "DEVICE-411",
    locationStatus: "allowed",
  },
  {
    id: "attendance-5",
    studentId: "student-5",
    groupId: "group-a",
    lessonId: "lesson-1",
    student: "نور أحمد",
    phone: "01199887766",
    status: "present",
    checkedInAt: "2026-08-26T16:25:00",
    deviceId: "DEVICE-512",
    locationStatus: "allowed",
  },
];

const initialSuspicious: SuspiciousAttendanceCase[] = [
  {
    id: "suspicious-1",
    attendanceIds: [
      "attendance-1",
      "attendance-2",
    ],
    studentIds: [
      "student-1",
      "student-2",
    ],
    studentNames: [
      "محمد أحمد علي",
      "أحمد محمد حسن",
    ],
    deviceId: "DEVICE-204",
    reason:
      "تم تسجيل أكثر من طالب من نفس الجهاز خلال فترة قصيرة.",
    detectedAt:
      "2026-08-26T16:03:00",
    status: "pending",
  },
];

/* -------------------------------------------------------------------------- */
/* Page                                                                       */
/* -------------------------------------------------------------------------- */

export default function AttendancePage() {
  const [selectedGroupId, setSelectedGroupId] =
    useState("group-a");

  const [selectedLessonId, setSelectedLessonId] =
    useState("lesson-1");

  const [date, setDate] =
    useState("2026-08-26");

  const [sessionStatus, setSessionStatus] =
    useState<AttendanceSessionStatus>("closed");

  const [attendance, setAttendance] =
    useState<AttendanceRecord[]>(
      initialAttendance,
    );

  const [suspicious, setSuspicious] =
    useState<SuspiciousAttendanceCase[]>(
      initialSuspicious,
    );

  const [search, setSearch] =
    useState("");

  const [passwordEnabled, setPasswordEnabled] =
    useState(true);

  const [sessionPassword, setSessionPassword] =
    useState("2468");

  const [showPassword, setShowPassword] =
    useState(false);

  const [error, setError] =
    useState("");

  const [isLoading, setIsLoading] =
    useState(false);

  const [locationStatus] =
    useState<
      "allowed" | "outside" | "unknown"
    >("allowed");

  const selectedGroup =
    groups.find(
      (group) =>
        group.id === selectedGroupId,
    ) ?? groups[0];

  const availableLessons = useMemo(
    () =>
      lessons.filter(
        (lesson) =>
          lesson.groupId ===
          selectedGroupId,
      ),
    [selectedGroupId],
  );

  const selectedLesson =
    lessons.find(
      (lesson) =>
        lesson.id ===
        selectedLessonId,
    ) ?? availableLessons[0];

  const sessionAttendance =
    useMemo(
      () =>
        attendance.filter(
          (record) =>
            record.groupId ===
              selectedGroupId &&
            record.lessonId ===
              selectedLessonId,
        ),
      [
        attendance,
        selectedGroupId,
        selectedLessonId,
      ],
    );

  const filteredAttendance =
    useMemo(() => {
      const query = search
        .trim()
        .toLowerCase();

      if (!query) {
        return sessionAttendance;
      }

      return sessionAttendance.filter(
        (record) =>
          [
            record.student ?? "",
            record.phone ?? "",
          ]
            .join(" ")
            .toLowerCase()
            .includes(query),
      );
    }, [sessionAttendance, search]);

  const registeredCount =
    sessionAttendance.filter(
      (record) =>
        record.status === "present" ||
        record.status === "late",
    ).length;

  const presentCount =
    sessionAttendance.filter(
      (record) =>
        record.status === "present",
    ).length;

  const lateCount =
    sessionAttendance.filter(
      (record) =>
        record.status === "late",
    ).length;

  const absentCount =
    sessionAttendance.filter(
      (record) =>
        record.status === "absent",
    ).length;

  const pendingSuspicious =
    suspicious.filter(
      (item) =>
        item.status === "pending",
    ).length;

  const openSession = () => {
    setError("");
    setIsLoading(true);
    setSessionStatus("loading");

    window.setTimeout(() => {
      setIsLoading(false);
      setSessionStatus("open");
    }, 500);
  };

  const closeSession = () => {
    setError("");
    setIsLoading(true);
    setSessionStatus("loading");

    window.setTimeout(() => {
      setIsLoading(false);
      setSessionStatus("closed");
    }, 500);
  };

  const handleGroupChange = (
    groupId: string,
  ) => {
    setSelectedGroupId(groupId);

    const firstLesson =
      lessons.find(
        (lesson) =>
          lesson.groupId ===
          groupId,
      );

    if (firstLesson) {
      setSelectedLessonId(
        firstLesson.id,
      );
    }
  };

  const updateAttendanceStatus = (
    id: string,
    status: AttendanceStatus,
  ) => {
    setAttendance((current) =>
      current.map((record) =>
        record.id === id
          ? {
              ...record,
              status,
              checkedInAt:
                status === "present" ||
                status === "late"
                  ? record.checkedInAt ??
                    new Date().toISOString()
                  : record.checkedInAt,
            }
          : record,
      ),
    );
  };

  const checkOutStudent = (
    id: string,
  ) => {
    setAttendance((current) =>
      current.map((record) =>
        record.id === id
          ? {
              ...record,
              checkedOutAt:
                record.checkedOutAt ??
                new Date().toISOString(),
            }
          : record,
      ),
    );
  };

  const approveSuspicious = (
    id: string,
  ) => {
    setSuspicious((current) =>
      current.map((item) =>
        item.id === id
          ? {
              ...item,
              status: "approved",
            }
          : item,
      ),
    );
  };

  const rejectSuspicious = (
    id: string,
  ) => {
    setSuspicious((current) =>
      current.map((item) =>
        item.id === id
          ? {
              ...item,
              status: "rejected",
            }
          : item,
      ),
    );
  };

  const addSuspiciousNote = (
    id: string,
  ) => {
    const note = window.prompt(
      "اكتب ملاحظة الحالة:",
    );

    if (note === null) {
      return;
    }

    setSuspicious((current) =>
      current.map((item) =>
        item.id === id
          ? {
              ...item,
              note: note.trim(),
            }
          : item,
      ),
    );
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
              إدارة جلسات الحضور ومتابعة
              تسجيل الطلاب والحالات
              التي تحتاج إلى مراجعة.
            </p>
          </div>

          <SessionStatusBadge
            status={sessionStatus}
          />
        </div>

        {/* Session Setup */}

        <section className="mb-6 rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="mb-5">
            <h2 className="text-base font-bold text-slate-900">
              إعداد جلسة الحضور
            </h2>

            <p className="mt-1 text-xs text-slate-400">
              اختر المجموعة والحصة
              والتاريخ قبل فتح الجلسة.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <SelectField
              label="المجموعة"
              value={selectedGroupId}
              onChange={
                handleGroupChange
              }
              options={groups.map(
                (group) => ({
                  value: group.id,
                  label: `${group.name} — ${group.subject}`,
                }),
              )}
            />

            <SelectField
              label="الحصة"
              value={
                selectedLesson?.id ??
                ""
              }
              onChange={
                setSelectedLessonId
              }
              options={availableLessons.map(
                (lesson) => ({
                  value: lesson.id,
                  label: `${lesson.title} — ${lesson.time}`,
                }),
              )}
            />

            <div>
              <label className="mb-1.5 block text-xs font-semibold text-slate-600">
                التاريخ
              </label>

              <div className="relative">
                <FiCalendar
                  size={15}
                  className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <input
                  type="date"
                  value={date}
                  onChange={(event) =>
                    setDate(
                      event.target.value,
                    )
                  }
                  className="h-10 w-full rounded-lg border border-slate-200 bg-white pr-9 pl-3 text-sm text-slate-600 outline-none transition focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10"
                />
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-semibold text-slate-600">
                حماية الحضور
              </label>

              <button
                type="button"
                onClick={() =>
                  setPasswordEnabled(
                    (current) =>
                      !current,
                  )
                }
                className={`flex h-10 w-full items-center justify-between rounded-lg border px-3 text-sm transition ${
                  passwordEnabled
                    ? "border-teal-200 bg-teal-50 text-teal-700"
                    : "border-slate-200 bg-slate-50 text-slate-500"
                }`}
              >
                <span className="flex items-center gap-2">
                  <FiLock size={15} />
                  حماية بكلمة مرور
                </span>

                <span
                  className={`h-5 w-9 rounded-full p-0.5 transition ${
                    passwordEnabled
                      ? "bg-teal-600"
                      : "bg-slate-300"
                  }`}
                >
                  <span
                    className={`block h-4 w-4 rounded-full bg-white shadow-sm transition ${
                      passwordEnabled
                        ? "translate-x-4"
                        : "translate-x-0"
                    }`}
                  />
                </span>
              </button>
            </div>
          </div>

          {passwordEnabled && (
            <div className="mt-4 max-w-sm">
              <label className="mb-1.5 block text-xs font-semibold text-slate-600">
                كلمة مرور الحضور
              </label>

              <div className="flex gap-2">
                <input
                  type={
                    showPassword
                      ? "text"
                      : "password"
                  }
                  value={sessionPassword}
                  onChange={(event) =>
                    setSessionPassword(
                      event.target.value,
                    )
                  }
                  className="h-10 flex-1 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10"
                  placeholder="أدخل كلمة المرور"
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowPassword(
                      (current) =>
                        !current,
                    )
                  }
                  className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-500 hover:bg-slate-50"
                >
                  {showPassword
                    ? "إخفاء"
                    : "عرض"}
                </button>
              </div>
            </div>
          )}

          {error && (
            <div className="mt-4 flex items-center gap-2 rounded-lg border border-red-100 bg-red-50 px-3 py-2.5 text-xs font-medium text-red-600">
              <FiAlertCircle size={15} />
              {error}
            </div>
          )}

          <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <FiClock size={14} />

              <span>
                {selectedLesson?.time ??
                  "لا توجد حصة محددة"}
              </span>
            </div>

            {sessionStatus ===
            "open" ? (
              <button
                type="button"
                disabled={isLoading}
                onClick={
                  closeSession
                }
                className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-red-500 px-5 text-xs font-semibold text-white transition hover:bg-red-600 disabled:cursor-not-allowed disabled:bg-slate-300"
              >
                {isLoading ? (
                  <FiRefreshCw
                    size={15}
                    className="animate-spin"
                  />
                ) : (
                  <FiX size={16} />
                )}

                إغلاق الحضور
              </button>
            ) : (
              <button
                type="button"
                disabled={isLoading}
                onClick={
                  openSession
                }
                className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-teal-600 px-5 text-xs font-semibold text-white shadow-sm transition hover:bg-teal-700 disabled:cursor-not-allowed disabled:bg-slate-300"
              >
                {isLoading ? (
                  <FiRefreshCw
                    size={15}
                    className="animate-spin"
                  />
                ) : (
                  <FiPlay size={15} />
                )}

                فتح الحضور
              </button>
            )}
          </div>
        </section>

        {/* Closed */}

        {sessionStatus ===
          "closed" && (
          <section className="mb-6 rounded-xl border border-slate-200 bg-white p-10 text-center shadow-sm">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 text-slate-500">
              <FiLock size={22} />
            </div>

            <h2 className="mt-4 text-sm font-bold text-slate-800">
              الحضور مغلق حاليًا
            </h2>

            <p className="mx-auto mt-1 max-w-md text-xs leading-6 text-slate-400">
              اختر المجموعة والحصة
              ثم اضغط "فتح الحضور"
              لبدء جلسة تسجيل
              الطلاب.
            </p>
          </section>
        )}

        {/* Loading */}

        {sessionStatus ===
          "loading" && (
          <section className="mb-6 rounded-xl border border-slate-200 bg-white p-10 text-center shadow-sm">
            <FiRefreshCw
              size={24}
              className="mx-auto animate-spin text-teal-600"
            />

            <p className="mt-3 text-xs font-medium text-slate-500">
              جاري تجهيز جلسة الحضور...
            </p>
          </section>
        )}

        {/* Error */}

        {sessionStatus ===
          "error" && (
          <section className="mb-6 rounded-xl border border-red-100 bg-red-50 p-10 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-white text-red-500">
              <FiAlertCircle size={22} />
            </div>

            <h2 className="mt-4 text-sm font-bold text-red-800">
              تعذر تحميل جلسة
              الحضور
            </h2>

            <p className="mt-1 text-xs text-red-600">
              حاول مرة أخرى.
            </p>

            <button
              type="button"
              onClick={() =>
                setSessionStatus(
                  "closed",
                )
              }
              className="mt-4 inline-flex h-9 items-center gap-2 rounded-lg bg-white px-4 text-xs font-semibold text-red-600 shadow-sm"
            >
              <FiRefreshCw size={14} />
              إعادة المحاولة
            </button>
          </section>
        )}

        {/* Open Session */}

        {sessionStatus ===
          "open" && (
          <>
            {/* Stats */}

            <section className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
              <AttendanceStat
                icon={
                  <FiUsers size={19} />
                }
                label="إجمالي طلاب المجموعة"
                value={
                  selectedGroup.studentsCount
                }
              />

              <AttendanceStat
                icon={
                  <FiUserCheck
                    size={19}
                  />
                }
                label="تم التسجيل"
                value={
                  registeredCount
                }
                className="text-emerald-600"
              />

              <AttendanceStat
                icon={
                  <FiCheckCircle
                    size={19}
                  />
                }
                label="حاضر"
                value={
                  presentCount
                }
                className="text-teal-600"
              />

              <AttendanceStat
                icon={
                  <FiClock size={19} />
                }
                label="متأخر"
                value={lateCount}
                className="text-amber-600"
              />

              <AttendanceStat
                icon={
                  <FiUsers size={19} />
                }
                label="غائب"
                value={absentCount}
                className="text-red-600"
              />
            </section>

            {/* Session Information */}

            <section className="mb-6 grid gap-4 lg:grid-cols-[1fr_340px]">
              <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-emerald-500" />

                      <span className="text-xs font-semibold text-emerald-600">
                        الحضور مفتوح الآن
                      </span>
                    </div>

                    <h2 className="mt-2 text-base font-bold text-slate-900">
                      {
                        selectedGroup.name
                      }
                    </h2>

                    <p className="mt-1 text-xs text-slate-400">
                      {
                        selectedGroup.subject
                      }
                      {" — "}
                      {
                        selectedLesson?.title
                      }
                    </p>
                  </div>

                  <div className="rounded-lg bg-slate-50 px-4 py-3 text-center">
                    <p className="text-[10px] text-slate-400">
                      تاريخ الجلسة
                    </p>

                    <p className="mt-1 text-xs font-semibold text-slate-700">
                      {formatArabicDate(
                        date,
                      )}
                    </p>
                  </div>
                </div>

                <div className="mt-5 grid gap-3 sm:grid-cols-3">
                  <InfoItem
                    icon={
                      <FiUsers size={15} />
                    }
                    label="الطلاب"
                    value={`${selectedGroup.studentsCount} طالب`}
                  />

                  <InfoItem
                    icon={
                      <FiClock size={15} />
                    }
                    label="الحصة"
                    value={
                      selectedLesson?.time ??
                      "—"
                    }
                  />

                  <InfoItem
                    icon={
                      <FiMapPin size={15} />
                    }
                    label="الموقع"
                    value={
                      locationStatus ===
                      "allowed"
                        ? "متاح"
                        : locationStatus ===
                            "outside"
                          ? "خارج النطاق"
                          : "غير محدد"
                    }
                    valueClassName={
                      locationStatus ===
                      "allowed"
                        ? "text-emerald-600"
                        : "text-red-600"
                    }
                  />
                </div>
              </div>

              {/* QR */}

              <div className="rounded-xl border border-slate-200 bg-white p-5 text-center shadow-sm">
                <div className="flex items-center justify-center gap-2">
                  <FiShield
                    size={16}
                    className="text-teal-600"
                  />

                  <h2 className="text-sm font-bold text-slate-800">
                    رمز الحضور
                  </h2>
                </div>

                <div className="mx-auto mt-4 flex h-36 w-36 items-center justify-center rounded-xl border-2 border-slate-200 bg-slate-50">
                  <QrPlaceholder />
                </div>

                <p className="mt-3 text-[11px] leading-5 text-slate-400">
                  رمز تجريبي للواجهة
                  وسيتم توليده وإدارته
                  من الـBackend لاحقًا.
                </p>

                {passwordEnabled && (
                  <div className="mt-3 rounded-lg bg-teal-50 px-3 py-2">
                    <p className="text-[10px] text-teal-600">
                      كلمة مرور الحضور
                    </p>

                    <p className="mt-0.5 text-sm font-bold tracking-[0.25em] text-teal-800">
                      {sessionPassword}
                    </p>
                  </div>
                )}
              </div>
            </section>

            {/* Live Attendance */}

            <section className="mb-6 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
              <div className="border-b border-slate-100 p-4 sm:p-5">
                <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <h2 className="text-sm font-bold text-slate-800">
                      التسجيل المباشر
                    </h2>

                    <p className="mt-1 text-xs text-slate-400">
                      متابعة حالة كل طالب
                      وإجراء تسجيل الحضور
                      أو الانصراف.
                    </p>
                  </div>

                  <div className="relative w-full lg:w-72">
                    <FiSearch
                      size={16}
                      className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
                    />

                    <input
                      type="search"
                      value={search}
                      onChange={(event) =>
                        setSearch(
                          event.target.value,
                        )
                      }
                      placeholder="ابحث عن طالب..."
                      className="h-9 w-full rounded-lg border border-slate-200 bg-slate-50 pr-9 pl-3 text-xs text-slate-700 outline-none focus:border-teal-500 focus:bg-white focus:ring-4 focus:ring-teal-500/10"
                    />
                  </div>
                </div>
              </div>

              {filteredAttendance.length >
              0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[900px] text-right">
                    <thead>
                      <tr className="border-b border-slate-100 bg-slate-50/70">
                        <th className="px-5 py-3 text-xs font-semibold text-slate-500">
                          الطالب
                        </th>

                        <th className="px-5 py-3 text-xs font-semibold text-slate-500">
                          الحالة
                        </th>

                        <th className="px-5 py-3 text-xs font-semibold text-slate-500">
                          وقت الدخول
                        </th>

                        <th className="px-5 py-3 text-xs font-semibold text-slate-500">
                          وقت الانصراف
                        </th>

                        <th className="px-5 py-3 text-xs font-semibold text-slate-500">
                          الموقع
                        </th>

                        <th className="px-5 py-3 text-xs font-semibold text-slate-500">
                          الإجراءات
                        </th>
                      </tr>
                    </thead>

                    <tbody>
                      {filteredAttendance.map(
                        (record) => (
                          <tr
                            key={
                              record.id
                            }
                            className="border-b border-slate-100 last:border-0 hover:bg-slate-50/70"
                          >
                            <td className="px-5 py-4">
                              <div className="flex items-center gap-3">
                                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-xs font-bold text-slate-600">
                                  {getInitials(
                                    record.student ??
                                      "طالب",
                                  )}
                                </div>

                                <div>
                                  <p className="text-sm font-semibold text-slate-800">
                                    {
                                      record.student ??
                                      "طالب"
                                    }
                                  </p>

                                  {record.phone && (
                                    <p className="mt-0.5 text-[11px] text-slate-400">
                                      {
                                        record.phone
                                      }
                                    </p>
                                  )}
                                </div>
                              </div>
                            </td>

                            <td className="px-5 py-4">
                              <AttendanceBadge
                                status={
                                  record.status
                                }
                              />
                            </td>

                            <td className="px-5 py-4">
                              <span className="text-xs font-medium text-slate-600">
                                {formatTime(
                                  record.checkedInAt,
                                )}
                              </span>
                            </td>

                            <td className="px-5 py-4">
                              <span className="text-xs font-medium text-slate-600">
                                {formatTime(
                                  record.checkedOutAt,
                                )}
                              </span>
                            </td>

                            <td className="px-5 py-4">
                              <LocationBadge
                                status={
                                  record.locationStatus
                                }
                              />
                            </td>

                            <td className="px-5 py-4">
                              <div className="flex flex-wrap items-center gap-2">
                                {record.status !==
                                  "present" && (
                                  <button
                                    type="button"
                                    onClick={() =>
                                      updateAttendanceStatus(
                                        record.id,
                                        "present",
                                      )
                                    }
                                    className="inline-flex h-8 items-center gap-1 rounded-lg bg-emerald-600 px-2.5 text-[11px] font-semibold text-white hover:bg-emerald-700"
                                  >
                                    <FiCheck
                                      size={13}
                                    />
                                    حاضر
                                  </button>
                                )}

                                {record.status !==
                                  "late" && (
                                  <button
                                    type="button"
                                    onClick={() =>
                                      updateAttendanceStatus(
                                        record.id,
                                        "late",
                                      )
                                    }
                                    className="inline-flex h-8 items-center gap-1 rounded-lg border border-amber-200 bg-white px-2.5 text-[11px] font-semibold text-amber-700 hover:bg-amber-50"
                                  >
                                    <FiClock
                                      size={13}
                                    />
                                    متأخر
                                  </button>
                                )}

                                {record.status !==
                                  "absent" && (
                                  <button
                                    type="button"
                                    onClick={() =>
                                      updateAttendanceStatus(
                                        record.id,
                                        "absent",
                                      )
                                    }
                                    className="inline-flex h-8 items-center gap-1 rounded-lg border border-red-200 bg-white px-2.5 text-[11px] font-semibold text-red-600 hover:bg-red-50"
                                  >
                                    غائب
                                  </button>
                                )}

                                {(record.status ===
                                  "present" ||
                                  record.status ===
                                    "late") &&
                                  !record.checkedOutAt && (
                                    <button
                                      type="button"
                                      onClick={() =>
                                        checkOutStudent(
                                          record.id,
                                        )
                                      }
                                      className="inline-flex h-8 items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 text-[11px] font-semibold text-slate-600 hover:bg-slate-50"
                                    >
                                      <FiLogOut
                                        size={13}
                                      />
                                      انصراف
                                    </button>
                                  )}
                              </div>
                            </td>
                          </tr>
                        ),
                      )}
                    </tbody>
                  </table>
                </div>
              ) : (
                <EmptyState
                  title="لا توجد تسجيلات"
                  description="لم يتم تسجيل أي طالب حتى الآن."
                  icon={
                    <FiUsers size={20} />
                  }
                />
              )}
            </section>

            {/* Suspicious Attendance */}

            <section className="overflow-hidden rounded-xl border border-amber-200 bg-white shadow-sm">
              <div className="border-b border-amber-100 bg-amber-50/60 p-4 sm:p-5">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-100 text-amber-700">
                      <FiShield
                        size={18}
                      />
                    </div>

                    <div>
                      <h2 className="text-sm font-bold text-amber-900">
                        الحالات المشبوهة
                      </h2>

                      <p className="mt-1 text-xs text-amber-700">
                        الحالات التي تحتاج
                        إلى مراجعة قبل
                        اعتمادها.
                      </p>
                    </div>
                  </div>

                  <span className="w-fit rounded-full bg-white px-3 py-1 text-[11px] font-semibold text-amber-700">
                    {pendingSuspicious.toLocaleString(
                      "ar-EG",
                    )}{" "}
                    تحتاج مراجعة
                  </span>
                </div>
              </div>

              {suspicious.filter(
                (item) =>
                  item.status ===
                  "pending",
              ).length === 0 ? (
                <EmptyState
                  title="لا توجد حالات مشبوهة"
                  description="لا توجد حاليًا أي حالات تحتاج إلى مراجعة."
                  icon={
                    <FiCheckCircle
                      size={20}
                    />
                  }
                />
              ) : (
                <div className="divide-y divide-slate-100">
                  {suspicious
                    .filter(
                      (item) =>
                        item.status ===
                        "pending",
                    )
                    .map((item) => (
                      <div
                        key={item.id}
                        className="p-5"
                      >
                        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                          <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                              {(
                                item.studentNames ??
                                []
                              ).map(
                                (
                                  studentName,
                                ) => (
                                  <span
                                    key={
                                      studentName
                                    }
                                    className="rounded-md bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-600"
                                  >
                                    {
                                      studentName
                                    }
                                  </span>
                                ),
                              )}
                            </div>

                            <p className="mt-3 text-xs font-semibold text-slate-700">
                              {
                                item.reason
                              }
                            </p>

                            <div className="mt-2 flex flex-wrap gap-4 text-[11px] text-slate-400">
                              {item.deviceId && (
                                <span>
                                  الجهاز:{" "}
                                  {
                                    item.deviceId
                                  }
                                </span>
                              )}

                              <span>
                                الوقت:{" "}
                                {formatTime(
                                  item.detectedAt,
                                )}
                              </span>
                            </div>

                            {item.note && (
                              <p className="mt-2 rounded-lg bg-slate-50 px-3 py-2 text-[11px] text-slate-500">
                                ملاحظة:{" "}
                                {
                                  item.note
                                }
                              </p>
                            )}
                          </div>

                          <div className="flex flex-wrap items-center gap-2">
                            <button
                              type="button"
                              onClick={() =>
                                approveSuspicious(
                                  item.id,
                                )
                              }
                              className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-emerald-600 px-3 text-xs font-semibold text-white transition hover:bg-emerald-700"
                            >
                              <FiCheck
                                size={14}
                              />
                              اعتماد
                            </button>

                            <button
                              type="button"
                              onClick={() =>
                                rejectSuspicious(
                                  item.id,
                                )
                              }
                              className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-red-200 bg-white px-3 text-xs font-semibold text-red-600 transition hover:bg-red-50"
                            >
                              <FiX
                                size={14}
                              />
                              رفض
                            </button>

                            <button
                              type="button"
                              onClick={() =>
                                addSuspiciousNote(
                                  item.id,
                                )
                              }
                              className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-600 transition hover:bg-slate-50"
                            >
                              إضافة ملاحظة
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </section>
          </>
        )}
      </div>
    </main>
  );
}

/* -------------------------------------------------------------------------- */
/* Components                                                                 */
/* -------------------------------------------------------------------------- */

function AttendanceStat({
  icon,
  label,
  value,
  className = "text-slate-700",
}: {
  icon: ReactNode;
  label: string;
  value: number;
  className?: string;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-slate-500">
            {label}
          </p>

          <p
            className={`mt-1 text-2xl font-bold ${className}`}
          >
            {value.toLocaleString(
              "ar-EG",
            )}
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

function SelectField({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (
    value: string,
  ) => void;
  options: Array<{
    value: string;
    label: string;
  }>;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-semibold text-slate-600">
        {label}
      </label>

      <div className="relative">
        <select
          value={value}
          onChange={(event) =>
            onChange(
              event.target.value,
            )
          }
          className="h-10 w-full appearance-none rounded-lg border border-slate-200 bg-white px-3 pl-9 text-xs text-slate-600 outline-none transition hover:border-slate-300 focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10"
        >
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
    </div>
  );
}

function SessionStatusBadge({
  status,
}: {
  status: AttendanceSessionStatus;
}) {
  if (status === "open") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1.5 text-[11px] font-semibold text-emerald-700">
        <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" />
        الحضور مفتوح
      </span>
    );
  }

  if (status === "loading") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1.5 text-[11px] font-semibold text-blue-700">
        <FiRefreshCw
          size={12}
          className="animate-spin"
        />
        جاري التحميل
      </span>
    );
  }

  if (status === "error") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-red-50 px-3 py-1.5 text-[11px] font-semibold text-red-700">
        <FiAlertCircle size={12} />
        خطأ
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1.5 text-[11px] font-semibold text-slate-600">
      <FiLock size={12} />
      الحضور مغلق
    </span>
  );
}

function AttendanceBadge({
  status,
}: {
  status: AttendanceStatus;
}) {
  const styles: Record<
    AttendanceStatus,
    string
  > = {
    present:
      "bg-emerald-50 text-emerald-700",
    absent:
      "bg-red-50 text-red-600",
    late:
      "bg-amber-50 text-amber-700",
    excused:
      "bg-blue-50 text-blue-700",
    unrecorded:
      "bg-slate-100 text-slate-500",
  };

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

  return (
    <span
      className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${styles[status]}`}
    >
      {labels[status]}
    </span>
  );
}

function LocationBadge({
  status,
}: {
  status?:
    | "allowed"
    | "outside"
    | "unknown";
}) {
  if (status === "allowed") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-700">
        <FiMapPin size={11} />
        داخل النطاق
      </span>
    );
  }

  if (status === "outside") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-red-50 px-2.5 py-1 text-[11px] font-semibold text-red-600">
        <FiMapPin size={11} />
        خارج النطاق
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-500">
      <FiMapPin size={11} />
      غير محدد
    </span>
  );
}

function InfoItem({
  icon,
  label,
  value,
  valueClassName = "text-slate-700",
}: {
  icon: ReactNode;
  label: string;
  value: string;
  valueClassName?: string;
}) {
  return (
    <div className="rounded-lg border border-slate-100 bg-slate-50/70 p-3">
      <div className="flex items-center gap-2 text-slate-400">
        {icon}

        <span className="text-[10px]">
          {label}
        </span>
      </div>

      <p
        className={`mt-1 text-xs font-semibold ${valueClassName}`}
      >
        {value}
      </p>
    </div>
  );
}

function EmptyState({
  title,
  description,
  icon,
}: {
  title: string;
  description: string;
  icon: ReactNode;
}) {
  return (
    <div className="flex min-h-48 flex-col items-center justify-center px-6 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-400">
        {icon}
      </div>

      <h3 className="mt-4 text-sm font-bold text-slate-800">
        {title}
      </h3>

      <p className="mt-1 max-w-sm text-xs leading-5 text-slate-400">
        {description}
      </p>
    </div>
  );
}

function QrPlaceholder() {
  const blocks = [
    1, 1, 0, 1, 0, 1, 1, 1,
    1, 0, 1, 0, 1, 0, 1, 0,
    0, 1, 1, 1, 0, 1, 0, 1,
    1, 0, 1, 1, 1, 0, 1, 1,
    0, 1, 0, 1, 0, 1, 1, 0,
    1, 1, 1, 0, 1, 0, 0, 1,
    1, 0, 1, 1, 0, 1, 1, 0,
    0, 1, 0, 1, 1, 0, 1, 1,
  ];

  return (
    <div className="grid w-28 grid-cols-8 gap-0.5 rounded-md bg-white p-1">
      {blocks.map(
        (block, index) => (
          <span
            key={index}
            className={`aspect-square ${
              block
                ? "bg-slate-900"
                : "bg-white"
            }`}
          />
        ),
      )}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Helpers                                                                    */
/* -------------------------------------------------------------------------- */

function getInitials(
  name: string,
) {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((word) =>
      word.charAt(0),
    )
    .join("");
}

function formatTime(
  value?: string,
) {
  if (!value) {
    return "—";
  }

  const parsedDate =
    new Date(value);

  if (
    Number.isNaN(
      parsedDate.getTime(),
    )
  ) {
    return value;
  }

  return new Intl.DateTimeFormat(
    "ar-EG",
    {
      hour: "numeric",
      minute: "2-digit",
    },
  ).format(parsedDate);
}

function formatArabicDate(
  date: string,
) {
  const parsedDate = new Date(
    `${date}T12:00:00`,
  );

  if (
    Number.isNaN(
      parsedDate.getTime(),
    )
  ) {
    return date;
  }

  return new Intl.DateTimeFormat(
    "ar-EG",
    {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    },
  ).format(parsedDate);
}