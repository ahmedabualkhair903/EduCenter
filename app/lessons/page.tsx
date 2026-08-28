
"use client";

import {
  ReactNode,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  FiBookOpen,
  FiCalendar,
  FiCheckCircle,
  FiClock,
  FiEdit2,
  FiFilter,
  FiMoreVertical,
  FiPlus,
  FiSearch,
  FiTrash2,
  FiUsers,
  FiX,
} from "react-icons/fi";

/* -------------------------------------------------------------------------- */
/* Types                                                                      */
/* -------------------------------------------------------------------------- */

type LessonStatus =
  | "قادمة"
  | "جارية"
  | "مكتملة"
  | "ملغاة";

type Lesson = {
  id: number;
  subject: string;
  teacher: string;
  group: string;
  date: string;
  time: string;
  duration: number;
  room: string;
  students: number;
  status: LessonStatus;
  notes: string;
};

type LessonFormData = Omit<Lesson, "id">;

const statusOptions = [
  "الكل",
  "قادمة",
  "جارية",
  "مكتملة",
  "ملغاة",
];

/* -------------------------------------------------------------------------- */
/* Helpers                                                                    */
/* -------------------------------------------------------------------------- */

const getDateKey = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

const getTomorrowKey = () => {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);

  return getDateKey(tomorrow);
};

const formatDate = (date: string) => {
  if (!date) {
    return "";
  }

  const parsedDate = new Date(`${date}T00:00:00`);

  if (Number.isNaN(parsedDate.getTime())) {
    return date;
  }

  return new Intl.DateTimeFormat("ar-EG", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(parsedDate);
};

const formatTime = (time: string) => {
  if (!time) {
    return "";
  }

  const [hours, minutes] = time.split(":").map(Number);

  if (
    !Number.isFinite(hours) ||
    !Number.isFinite(minutes)
  ) {
    return time;
  }

  const date = new Date();

  date.setHours(hours, minutes, 0, 0);

  return new Intl.DateTimeFormat("ar-EG", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(date);
};

/* -------------------------------------------------------------------------- */
/* Initial Data                                                               */
/* -------------------------------------------------------------------------- */

const initialLessons: Lesson[] = [
  {
    id: 1,
    subject: "الرياضيات",
    teacher: "أحمد محمد",
    group: "ثالثة ثانوي - A",
    date: "2026-08-24",
    time: "16:00",
    duration: 90,
    room: "قاعة 1",
    students: 32,
    status: "مكتملة",
    notes: "",
  },
  {
    id: 2,
    subject: "اللغة الإنجليزية",
    teacher: "محمد خالد",
    group: "ثانية ثانوي - B",
    date: "2026-08-24",
    time: "17:30",
    duration: 90,
    room: "قاعة 2",
    students: 28,
    status: "جارية",
    notes: "",
  },
  {
    id: 3,
    subject: "الفيزياء",
    teacher: "د. محمود علي",
    group: "ثالثة ثانوي - A",
    date: "2026-08-24",
    time: "19:00",
    duration: 120,
    room: "قاعة 1",
    students: 32,
    status: "قادمة",
    notes: "مراجعة الفصل الثالث.",
  },
  {
    id: 4,
    subject: "الكيمياء",
    teacher: "د. أحمد حسن",
    group: "ثالثة ثانوي - B",
    date: "2026-08-24",
    time: "20:30",
    duration: 120,
    room: "قاعة 3",
    students: 30,
    status: "قادمة",
    notes: "",
  },
  {
    id: 5,
    subject: "اللغة العربية",
    teacher: "أستاذ كريم",
    group: "أولى ثانوي - A",
    date: "2026-08-25",
    time: "16:00",
    duration: 90,
    room: "قاعة 2",
    students: 25,
    status: "قادمة",
    notes: "",
  },
  {
    id: 6,
    subject: "الأحياء",
    teacher: "د. سارة محمود",
    group: "ثالثة ثانوي - C",
    date: "2026-08-25",
    time: "18:00",
    duration: 120,
    room: "قاعة 1",
    students: 27,
    status: "قادمة",
    notes: "",
  },
  {
    id: 7,
    subject: "الرياضيات",
    teacher: "أحمد محمد",
    group: "ثانية ثانوي - A",
    date: "2026-08-22",
    time: "18:00",
    duration: 90,
    room: "قاعة 3",
    students: 29,
    status: "مكتملة",
    notes: "",
  },
  {
    id: 8,
    subject: "الفيزياء",
    teacher: "د. محمود علي",
    group: "ثانية ثانوي - B",
    date: "2026-08-22",
    time: "20:00",
    duration: 90,
    room: "قاعة 2",
    students: 28,
    status: "ملغاة",
    notes: "تم إلغاء الحصة لظرف طارئ.",
  },
];

/* -------------------------------------------------------------------------- */
/* Page                                                                       */
/* -------------------------------------------------------------------------- */

export default function LessonsPage() {
  const [lessons, setLessons] =
    useState<Lesson[]>(initialLessons);

  const [search, setSearch] = useState("");

  const [statusFilter, setStatusFilter] =
    useState("الكل");

  const [selectedDate, setSelectedDate] =
    useState("اليوم");

  const [modalOpen, setModalOpen] =
    useState(false);

  const [editingLesson, setEditingLesson] =
    useState<Lesson | null>(null);

  const todayKey = getDateKey(new Date());
  const tomorrowKey = getTomorrowKey();

  const filteredLessons = useMemo(() => {
    const query = search.trim().toLowerCase();

    return lessons
      .filter((lesson) => {
        const searchableContent = [
          lesson.subject,
          lesson.teacher,
          lesson.group,
          lesson.room,
        ]
          .join(" ")
          .toLowerCase();

        const matchesSearch =
          !query ||
          searchableContent.includes(query);

        const matchesStatus =
          statusFilter === "الكل" ||
          lesson.status === statusFilter;

        let matchesDate = true;

        if (selectedDate === "اليوم") {
          matchesDate = lesson.date === todayKey;
        }

        if (selectedDate === "غدًا") {
          matchesDate =
            lesson.date === tomorrowKey;
        }

        return (
          matchesSearch &&
          matchesStatus &&
          matchesDate
        );
      })
      .sort((a, b) => {
        const first = `${a.date} ${a.time}`;
        const second = `${b.date} ${b.time}`;

        return first.localeCompare(second);
      });
  }, [
    lessons,
    search,
    statusFilter,
    selectedDate,
    todayKey,
    tomorrowKey,
  ]);

  const todayCount = useMemo(
    () =>
      lessons.filter(
        (lesson) => lesson.date === todayKey,
      ).length,
    [lessons, todayKey],
  );

  const upcomingCount = useMemo(
    () =>
      lessons.filter(
        (lesson) => lesson.status === "قادمة",
      ).length,
    [lessons],
  );

  const ongoingCount = useMemo(
    () =>
      lessons.filter(
        (lesson) => lesson.status === "جارية",
      ).length,
    [lessons],
  );

  const completedCount = useMemo(
    () =>
      lessons.filter(
        (lesson) => lesson.status === "مكتملة",
      ).length,
    [lessons],
  );

  const openCreateModal = () => {
    setEditingLesson(null);
    setModalOpen(true);
  };

  const openEditModal = (lesson: Lesson) => {
    setEditingLesson(lesson);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingLesson(null);
  };

  const handleSaveLesson = (
    data: LessonFormData,
  ) => {
    if (editingLesson) {
      setLessons((current) =>
        current.map((lesson) =>
          lesson.id === editingLesson.id
            ? {
                ...lesson,
                ...data,
              }
            : lesson,
        ),
      );
    } else {
      setLessons((current) => [
        {
          id: Date.now(),
          ...data,
        },
        ...current,
      ]);
    }

    closeModal();
  };

  const handleDelete = (lesson: Lesson) => {
    const confirmed = window.confirm(
      `هل أنت متأكد من حذف حصة ${lesson.subject}؟`,
    );

    if (!confirmed) {
      return;
    }

    setLessons((current) =>
      current.filter(
        (item) => item.id !== lesson.id,
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

        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="mb-2 flex items-center gap-2 text-xs font-medium text-slate-400">
              <span>الرئيسية</span>
              <span>/</span>
              <span className="text-teal-600">
                الحصص
              </span>
            </div>

            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              الحصص
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              إدارة جدول الحصص ومتابعة الحصص اليومية.
            </p>
          </div>

          <button
            type="button"
            onClick={openCreateModal}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-teal-600 px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-teal-700 active:scale-[0.98]"
          >
            <FiPlus size={17} />
            إضافة حصة
          </button>
        </div>

        {/* Stats */}

        <section className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <LessonStat
            label="حصص اليوم"
            value={todayCount}
            icon={<FiCalendar size={19} />}
          />

          <LessonStat
            label="الحصص القادمة"
            value={upcomingCount}
            icon={<FiClock size={19} />}
          />

          <LessonStat
            label="حصص جارية"
            value={ongoingCount}
            icon={<FiBookOpen size={19} />}
          />

          <LessonStat
            label="حصص مكتملة"
            value={completedCount}
            icon={<FiCheckCircle size={19} />}
          />
        </section>

        {/* Filters */}

        <section className="mb-6 rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
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
                placeholder="ابحث باسم المادة أو المدرس أو المجموعة..."
                aria-label="البحث في الحصص"
                className="h-10 w-full rounded-lg border border-slate-200 bg-slate-50 pr-9 pl-3 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-teal-500 focus:bg-white focus:ring-4 focus:ring-teal-500/10"
              />
            </div>

            <LessonSelect
              value={selectedDate}
              onChange={setSelectedDate}
              options={[
                "اليوم",
                "غدًا",
                "كل الأيام",
              ]}
              ariaLabel="فلترة حسب التاريخ"
            />

            <LessonSelect
              value={statusFilter}
              onChange={setStatusFilter}
              options={statusOptions}
              ariaLabel="فلترة حسب الحالة"
            />

            <button
              type="button"
              onClick={() => {
                setSearch("");
                setStatusFilter("الكل");
                setSelectedDate("اليوم");
              }}
              className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-slate-200 px-4 text-sm font-medium text-slate-600 transition hover:border-teal-200 hover:bg-teal-50 hover:text-teal-700"
            >
              <FiFilter size={15} />
              إعادة ضبط
            </button>
          </div>
        </section>

        {/* Lessons */}

        <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
            <div>
              <h2 className="text-sm font-bold text-slate-800">
                جدول الحصص
              </h2>

              <p className="mt-1 text-xs text-slate-400">
                عرض {filteredLessons.length} حصة
              </p>
            </div>

            <div className="hidden items-center gap-2 sm:flex">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />

              <span className="text-xs text-slate-400">
                جارية
              </span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[1050px] text-right">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/70">
                  <th className="px-5 py-3 text-xs font-semibold text-slate-500">
                    المادة
                  </th>

                  <th className="px-5 py-3 text-xs font-semibold text-slate-500">
                    المدرس
                  </th>

                  <th className="px-5 py-3 text-xs font-semibold text-slate-500">
                    المجموعة
                  </th>

                  <th className="px-5 py-3 text-xs font-semibold text-slate-500">
                    الموعد
                  </th>

                  <th className="px-5 py-3 text-xs font-semibold text-slate-500">
                    القاعة
                  </th>

                  <th className="px-5 py-3 text-xs font-semibold text-slate-500">
                    الطلاب
                  </th>

                  <th className="px-5 py-3 text-xs font-semibold text-slate-500">
                    الحالة
                  </th>

                  <th className="px-5 py-3 text-xs font-semibold text-slate-500">
                    إجراءات
                  </th>
                </tr>
              </thead>

              <tbody>
                {filteredLessons.map((lesson) => (
                  <tr
                    key={lesson.id}
                    className="border-b border-slate-100 transition last:border-0 hover:bg-slate-50/70"
                  >
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-teal-50 text-teal-600">
                          <FiBookOpen size={16} />
                        </div>

                        <div>
                          <p className="text-sm font-semibold text-slate-800">
                            {lesson.subject}
                          </p>

                          <p className="mt-0.5 text-[10px] text-slate-400">
                            #{lesson.id}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="px-5 py-4">
                      <span className="text-xs font-medium text-slate-600">
                        {lesson.teacher}
                      </span>
                    </td>

                    <td className="px-5 py-4">
                      <span className="rounded-md bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-600">
                        {lesson.group}
                      </span>
                    </td>

                    <td className="px-5 py-4">
                      <div>
                        <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                          <FiClock
                            size={14}
                            className="text-slate-400"
                          />

                          {formatTime(lesson.time)}
                        </div>

                        <p className="mt-1 text-[10px] text-slate-400">
                          {formatDate(lesson.date)}{" "}
                          · {lesson.duration} دقيقة
                        </p>
                      </div>
                    </td>

                    <td className="px-5 py-4">
                      <span className="text-xs font-medium text-slate-600">
                        {lesson.room}
                      </span>
                    </td>

                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <FiUsers
                          size={14}
                          className="text-slate-400"
                        />

                        <span className="text-sm font-semibold text-slate-700">
                          {lesson.students}
                        </span>
                      </div>
                    </td>

                    <td className="px-5 py-4">
                      <LessonStatusBadge
                        status={lesson.status}
                      />
                    </td>

                    <td className="px-5 py-4">
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() =>
                            openEditModal(lesson)
                          }
                          className="flex h-8 w-8 items-center justify-center rounded-md text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                          title="تعديل"
                          aria-label={`تعديل حصة ${lesson.subject}`}
                        >
                          <FiEdit2 size={15} />
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            handleDelete(lesson)
                          }
                          className="flex h-8 w-8 items-center justify-center rounded-md text-slate-400 transition hover:bg-red-50 hover:text-red-600"
                          title="حذف"
                          aria-label={`حذف حصة ${lesson.subject}`}
                        >
                          <FiTrash2 size={15} />
                        </button>

                        <button
                          type="button"
                          className="flex h-8 w-8 items-center justify-center rounded-md text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                          title="المزيد"
                          aria-label={`المزيد من إجراءات حصة ${lesson.subject}`}
                        >
                          <FiMoreVertical size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {filteredLessons.length === 0 && (
              <div className="flex min-h-64 flex-col items-center justify-center px-6 text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-400">
                  <FiBookOpen size={20} />
                </div>

                <h3 className="mt-4 text-sm font-bold text-slate-800">
                  لا توجد حصص
                </h3>

                <p className="mt-1 text-xs text-slate-400">
                  جرّب تغيير البحث أو الفلاتر.
                </p>

                {(search ||
                  statusFilter !== "الكل" ||
                  selectedDate !== "اليوم") && (
                  <button
                    type="button"
                    onClick={() => {
                      setSearch("");
                      setStatusFilter("الكل");
                      setSelectedDate("اليوم");
                    }}
                    className="mt-4 text-xs font-semibold text-teal-600 transition hover:text-teal-700"
                  >
                    إعادة ضبط الفلاتر
                  </button>
                )}
              </div>
            )}
          </div>
        </section>
      </div>

      {/* Modal */}

      <LessonModal
        key={`${modalOpen}-${editingLesson?.id ?? "new"}`}
        open={modalOpen}
        lesson={editingLesson}
        onClose={closeModal}
        onSubmit={handleSaveLesson}
      />
    </main>
  );
}

/* -------------------------------------------------------------------------- */
/* Stats                                                                      */
/* -------------------------------------------------------------------------- */

function LessonStat({
  label,
  value,
  icon,
}: {
  label: string;
  value: number;
  icon: ReactNode;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-slate-300 hover:shadow">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-slate-500">
            {label}
          </p>

          <p className="mt-1 text-xl font-bold text-slate-900">
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
/* Select                                                                     */
/* -------------------------------------------------------------------------- */

function LessonSelect({
  value,
  onChange,
  options,
  ariaLabel,
}: {
  value: string;
  onChange: (value: string) => void;
  options: string[];
  ariaLabel: string;
}) {
  return (
    <select
      value={value}
      onChange={(event) =>
        onChange(event.target.value)
      }
      aria-label={ariaLabel}
      className="h-10 min-w-32 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-600 outline-none transition hover:border-slate-300 focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10"
    >
      {options.map((option) => (
        <option key={option} value={option}>
          {option}
        </option>
      ))}
    </select>
  );
}

/* -------------------------------------------------------------------------- */
/* Status Badge                                                               */
/* -------------------------------------------------------------------------- */

function LessonStatusBadge({
  status,
}: {
  status: LessonStatus;
}) {
  const styles: Record<LessonStatus, string> = {
    قادمة: "bg-blue-50 text-blue-700",
    جارية: "bg-emerald-50 text-emerald-700",
    مكتملة: "bg-slate-100 text-slate-600",
    ملغاة: "bg-red-50 text-red-700",
  };

  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold ${styles[status]}`}
    >
      {status}
    </span>
  );
}

/* -------------------------------------------------------------------------- */
/* Modal                                                                      */
/* -------------------------------------------------------------------------- */

function LessonModal({
  open,
  lesson,
  onClose,
  onSubmit,
}: {
  open: boolean;
  lesson: Lesson | null;
  onClose: () => void;
  onSubmit: (data: LessonFormData) => void;
}) {
  const isEdit = Boolean(lesson);

  const [subject, setSubject] = useState(
    () => lesson?.subject ?? "",
  );

  const [teacher, setTeacher] = useState(
    () => lesson?.teacher ?? "",
  );

  const [group, setGroup] = useState(
    () => lesson?.group ?? "",
  );

  const [date, setDate] = useState(
    () => lesson?.date ?? getDateKey(new Date()),
  );

  const [time, setTime] = useState(
    () => lesson?.time ?? "16:00",
  );

  const [duration, setDuration] = useState(
    () => String(lesson?.duration ?? 90),
  );

  const [room, setRoom] = useState(
    () => lesson?.room ?? "قاعة 1",
  );

  const [students, setStudents] = useState(
    () => String(lesson?.students ?? 25),
  );

  const [status, setStatus] =
    useState<LessonStatus>(
      () => lesson?.status ?? "قادمة",
    );

  const [notes, setNotes] = useState(
    () => lesson?.notes ?? "",
  );

  const [error, setError] = useState("");

  /* ------------------------------------------------------------------------ */
  /* Escape + Body Scroll                                                     */
  /* ------------------------------------------------------------------------ */

  useEffect(() => {
    if (!open) {
      return;
    }

    const handleKeyDown = (
      event: KeyboardEvent,
    ) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    const previousOverflow =
      document.body.style.overflow;

    document.body.style.overflow = "hidden";

    window.addEventListener(
      "keydown",
      handleKeyDown,
    );

    return () => {
      document.body.style.overflow =
        previousOverflow;

      window.removeEventListener(
        "keydown",
        handleKeyDown,
      );
    };
  }, [open, onClose]);

  if (!open) {
    return null;
  }

  const handleSubmit = () => {
    if (
      !subject.trim() ||
      !teacher.trim() ||
      !group.trim() ||
      !date.trim() ||
      !time.trim() ||
      !room.trim()
    ) {
      setError(
        "يرجى إدخال جميع البيانات المطلوبة.",
      );
      return;
    }

    const numericDuration = Number(duration);
    const numericStudents = Number(students);

    if (
      !Number.isFinite(numericDuration) ||
      numericDuration <= 0
    ) {
      setError("مدة الحصة غير صحيحة.");
      return;
    }

    if (
      !Number.isFinite(numericStudents) ||
      numericStudents < 0
    ) {
      setError("عدد الطلاب غير صحيح.");
      return;
    }

    onSubmit({
      subject: subject.trim(),
      teacher: teacher.trim(),
      group: group.trim(),
      date: date.trim(),
      time: time.trim(),
      duration: numericDuration,
      room: room.trim(),
      students: numericStudents,
      status,
      notes: notes.trim(),
    });
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-[2px]"
      role="dialog"
      aria-modal="true"
      aria-labelledby="lesson-modal-title"
      onMouseDown={(event) => {
        if (
          event.target ===
          event.currentTarget
        ) {
          onClose();
        }
      }}
    >
      <div className="flex max-h-[92vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl">
        {/* Header */}

        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4 sm:px-6">
          <div>
            <h2
              id="lesson-modal-title"
              className="text-base font-bold text-slate-900"
            >
              {isEdit
                ? "تعديل الحصة"
                : "إضافة حصة جديدة"}
            </h2>

            <p className="mt-1 text-xs text-slate-400">
              أدخل بيانات الحصة والموعد والمجموعة.
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
              className="mb-4 rounded-lg border border-red-100 bg-red-50 px-3 py-2 text-xs font-medium text-red-600"
              role="alert"
            >
              {error}
            </div>
          )}

          <div className="grid gap-4 sm:grid-cols-2">
            <LessonField label="المادة">
              <input
                value={subject}
                onChange={(event) => {
                  setSubject(event.target.value);
                  setError("");
                }}
                placeholder="مثال: الرياضيات"
                className="field"
                autoComplete="off"
              />
            </LessonField>

            <LessonField label="المدرس">
              <input
                value={teacher}
                onChange={(event) => {
                  setTeacher(event.target.value);
                  setError("");
                }}
                placeholder="اسم المدرس"
                className="field"
                autoComplete="off"
              />
            </LessonField>

            <LessonField label="المجموعة">
              <input
                value={group}
                onChange={(event) => {
                  setGroup(event.target.value);
                  setError("");
                }}
                placeholder="مثال: ثالثة ثانوي - A"
                className="field"
                autoComplete="off"
              />
            </LessonField>

            <LessonField label="القاعة">
              <input
                value={room}
                onChange={(event) => {
                  setRoom(event.target.value);
                  setError("");
                }}
                placeholder="مثال: قاعة 1"
                className="field"
                autoComplete="off"
              />
            </LessonField>

            <LessonField label="التاريخ">
              <input
                type="date"
                value={date}
                onChange={(event) => {
                  setDate(event.target.value);
                  setError("");
                }}
                className="field"
              />
            </LessonField>

            <LessonField label="وقت الحصة">
              <input
                type="time"
                value={time}
                onChange={(event) => {
                  setTime(event.target.value);
                  setError("");
                }}
                className="field"
              />
            </LessonField>

            <LessonField label="مدة الحصة بالدقائق">
              <input
                type="number"
                min="1"
                step="5"
                value={duration}
                onChange={(event) => {
                  setDuration(event.target.value);
                  setError("");
                }}
                className="field"
                inputMode="numeric"
              />
            </LessonField>

            <LessonField label="عدد الطلاب">
              <input
                type="number"
                min="0"
                step="1"
                value={students}
                onChange={(event) => {
                  setStudents(event.target.value);
                  setError("");
                }}
                className="field"
                inputMode="numeric"
              />
            </LessonField>

            <LessonField label="حالة الحصة">
              <select
                value={status}
                onChange={(event) => {
                  setStatus(
                    event.target
                      .value as LessonStatus,
                  );
                  setError("");
                }}
                className="field"
              >
                <option value="قادمة">
                  قادمة
                </option>

                <option value="جارية">
                  جارية
                </option>

                <option value="مكتملة">
                  مكتملة
                </option>

                <option value="ملغاة">
                  ملغاة
                </option>
              </select>
            </LessonField>

            <div className="sm:col-span-2">
              <LessonField label="ملاحظات">
                <textarea
                  value={notes}
                  onChange={(event) =>
                    setNotes(event.target.value)
                  }
                  placeholder="ملاحظات إضافية..."
                  className="field min-h-24 resize-y"
                />
              </LessonField>
            </div>
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
            className="h-10 rounded-lg bg-teal-600 px-5 text-sm font-semibold text-white transition hover:bg-teal-700 active:scale-[0.98]"
          >
            {isEdit
              ? "حفظ التعديلات"
              : "إضافة الحصة"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Field                                                                      */
/* -------------------------------------------------------------------------- */

function LessonField({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
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
