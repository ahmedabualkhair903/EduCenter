"use client";

import {
  FiArrowDown,
  FiArrowUp,
  FiBookOpen,
  FiCalendar,
  FiCheckCircle,
  FiClock,
  FiDollarSign,
  FiMessageCircle,
  FiMoreHorizontal,
  FiTrendingUp,
  FiUsers,
} from "react-icons/fi";

type Stat = {
  title: string;
  value: string;
  description: string;
  icon: React.ComponentType<{ size?: number | string }>;
  trend?: "up" | "down";
};

type ClassItem = {
  subject: string;
  group: string;
  time: string;
  status: "جارية" | "قادمة";
};

const stats: Stat[] = [
  {
    title: "إجمالي الطلاب",
    value: "1,248",
    description: "+8.2% هذا الشهر",
    icon: FiUsers,
    trend: "up",
  },
  {
    title: "الحضور اليوم",
    value: "1,086",
    description: "87% من إجمالي الطلاب",
    icon: FiCheckCircle,
    trend: "up",
  },
  {
    title: "الغياب اليوم",
    value: "162",
    description: "13% من إجمالي الطلاب",
    icon: FiClock,
    trend: "down",
  },
  {
    title: "حصص اليوم",
    value: "24",
    description: "6 حصص جارية الآن",
    icon: FiBookOpen,
  },
  {
    title: "المحصل اليوم",
    value: "18,450 ج.م",
    description: "+12.5% مقارنة بالأمس",
    icon: FiDollarSign,
    trend: "up",
  },
  {
    title: "إجمالي الديون",
    value: "42,800 ج.م",
    description: "38 طالبًا لديهم مستحقات",
    icon: FiTrendingUp,
  },
  {
    title: "الامتحانات القادمة",
    value: "7",
    description: "خلال هذا الأسبوع",
    icon: FiCalendar,
  },
  {
    title: "رسائل WhatsApp",
    value: "326",
    description: "تم إرسالها هذا الشهر",
    icon: FiMessageCircle,
  },
];

const attendanceData = [
  { day: "السبت", present: 88, absent: 12 },
  { day: "الأحد", present: 91, absent: 9 },
  { day: "الإثنين", present: 86, absent: 14 },
  { day: "الثلاثاء", present: 89, absent: 11 },
  { day: "الأربعاء", present: 93, absent: 7 },
  { day: "الخميس", present: 87, absent: 13 },
  { day: "الجمعة", present: 95, absent: 5 },
];

const todayClasses: ClassItem[] = [
  {
    subject: "الرياضيات",
    group: "أولى ثانوي",
    time: "04:00 م",
    status: "جارية",
  },
  {
    subject: "اللغة الإنجليزية",
    group: "ثانية ثانوي",
    time: "05:30 م",
    status: "قادمة",
  },
  {
    subject: "الفيزياء",
    group: "ثالثة ثانوي",
    time: "07:00 م",
    status: "قادمة",
  },
  {
    subject: "الكيمياء",
    group: "ثالثة ثانوي",
    time: "08:30 م",
    status: "قادمة",
  },
];

const quickActions = [
  {
    label: "إضافة طالب",
    description: "تسجيل طالب جديد",
    icon: FiUsers,
  },
  {
    label: "تسجيل حضور",
    description: "تسجيل حضور الطلاب",
    icon: FiCheckCircle,
  },
  {
    label: "تسجيل دفعة",
    description: "إضافة دفعة مالية",
    icon: FiDollarSign,
  },
  {
    label: "إرسال رسالة",
    description: "التواصل مع أولياء الأمور",
    icon: FiMessageCircle,
  },
];

export default function DashboardPage() {
  return (
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-[1600px] p-4 sm:p-6 lg:p-8">
        {/* Page Header */}

        <section className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="mb-1 text-xs font-semibold text-teal-600">
              الأحد، 23 أغسطس 2026
            </p>

            <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
              لوحة التحكم
            </h1>

            <p className="mt-1.5 text-sm text-slate-500">
              نظرة عامة على أداء المركز وحالة العمل اليوم.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              className="flex h-9 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-600 shadow-sm transition hover:border-slate-300 hover:bg-slate-50"
            >
              <FiCalendar size={15} />
              اليوم
            </button>
          </div>
        </section>

        {/* Statistics */}

        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {stats.map((stat) => {
            const Icon = stat.icon;

            return (
              <div
                key={stat.title}
                className="group rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md"
              >
                <div className="mb-4 flex items-start justify-between">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-teal-50 text-teal-600 transition group-hover:bg-teal-100">
                    <Icon size={19} />
                  </div>

                  {stat.trend && (
                    <span
                      className={[
                        "flex items-center gap-1 rounded-full px-2 py-1 text-[10px] font-semibold",
                        stat.trend === "up"
                          ? "bg-emerald-50 text-emerald-600"
                          : "bg-amber-50 text-amber-600",
                      ].join(" ")}
                    >
                      {stat.trend === "up" ? (
                        <FiArrowUp size={11} />
                      ) : (
                        <FiArrowDown size={11} />
                      )}

                      {stat.trend === "up"
                        ? "تحسن"
                        : "متابعة"}
                    </span>
                  )}
                </div>

                <p className="text-xs font-medium text-slate-500">
                  {stat.title}
                </p>

                <p className="mt-1 text-xl font-bold tracking-tight text-slate-900">
                  {stat.value}
                </p>

                <p className="mt-2 text-[10px] font-medium text-slate-400">
                  {stat.description}
                </p>
              </div>
            );
          })}
        </section>

        {/* Main Dashboard Grid */}

        <section className="mt-6 grid gap-6 xl:grid-cols-3">
          {/* Attendance Chart */}

          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm xl:col-span-2 sm:p-6">
            <div className="mb-6 flex items-start justify-between">
              <div>
                <h2 className="text-sm font-bold text-slate-900">
                  الحضور والغياب
                </h2>

                <p className="mt-1 text-xs text-slate-500">
                  نسبة الحضور والغياب خلال الأسبوع الحالي
                </p>
              </div>

              <button
                type="button"
                className="flex h-8 items-center gap-1.5 rounded-lg border border-slate-200 px-2.5 text-[10px] font-semibold text-slate-500 transition hover:border-teal-200 hover:bg-teal-50 hover:text-teal-700"
              >
                هذا الأسبوع
                <FiMoreHorizontal size={14} />
              </button>
            </div>

            <div className="mb-5 flex items-center gap-5">
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-teal-500" />
                <span className="text-[10px] font-medium text-slate-500">
                  حضور
                </span>
              </div>

              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-slate-200" />
                <span className="text-[10px] font-medium text-slate-500">
                  غياب
                </span>
              </div>
            </div>

            <div className="relative h-64">
              <div className="absolute inset-0 flex flex-col justify-between">
                {[100, 75, 50, 25, 0].map((value) => (
                  <div
                    key={value}
                    className="flex items-center gap-3"
                  >
                    <span className="w-7 text-[9px] text-slate-400">
                      {value}%
                    </span>

                    <div className="h-px flex-1 bg-slate-100" />
                  </div>
                ))}
              </div>

              <div className="absolute inset-x-10 bottom-0 top-0 flex items-end justify-between gap-2">
                {attendanceData.map((item) => (
                  <div
                    key={item.day}
                    className="flex h-full flex-1 flex-col items-center justify-end gap-2"
                  >
                    <div className="flex h-[calc(100%-24px)] w-full max-w-10 items-end overflow-hidden rounded-t-md bg-slate-100">
                      <div
                        className="w-full rounded-t-md bg-teal-500 transition-all duration-500 hover:bg-teal-600"
                        style={{
                          height: `${item.present}%`,
                        }}
                        title={`حضور ${item.present}%`}
                      />
                    </div>

                    <span className="text-[9px] font-medium text-slate-400">
                      {item.day}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Today's Classes */}

          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <div className="mb-5 flex items-start justify-between">
              <div>
                <h2 className="text-sm font-bold text-slate-900">
                  حصص اليوم
                </h2>

                <p className="mt-1 text-xs text-slate-500">
                  جدول الحصص القادمة
                </p>
              </div>

              <span className="rounded-full bg-teal-50 px-2 py-1 text-[10px] font-semibold text-teal-600">
                24 حصة
              </span>
            </div>

            <div className="space-y-3">
              {todayClasses.map((item) => (
                <div
                  key={`${item.subject}-${item.time}`}
                  className="group flex items-center gap-3 rounded-xl border border-slate-100 p-3 transition hover:border-teal-100 hover:bg-teal-50/40"
                >
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-500 transition group-hover:bg-teal-100 group-hover:text-teal-600">
                    <FiBookOpen size={16} />
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs font-bold text-slate-800">
                      {item.subject}
                    </p>

                    <p className="mt-0.5 truncate text-[10px] text-slate-400">
                      {item.group}
                    </p>
                  </div>

                  <div className="shrink-0 text-left">
                    <p className="text-[10px] font-semibold text-slate-600">
                      {item.time}
                    </p>

                    <span
                      className={[
                        "mt-1 inline-flex rounded-full px-1.5 py-0.5 text-[8px] font-semibold",
                        item.status === "جارية"
                          ? "bg-emerald-50 text-emerald-600"
                          : "bg-slate-100 text-slate-400",
                      ].join(" ")}
                    >
                      {item.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <button
              type="button"
              className="mt-4 flex w-full items-center justify-center rounded-lg border border-slate-200 py-2.5 text-xs font-semibold text-slate-500 transition hover:border-teal-200 hover:bg-teal-50 hover:text-teal-700"
            >
              عرض جدول الحصص
            </button>
          </div>
        </section>

        {/* Quick Actions */}

        <section className="mt-6 rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="mb-5">
            <h2 className="text-sm font-bold text-slate-900">
              إجراءات سريعة
            </h2>

            <p className="mt-1 text-xs text-slate-500">
              الوصول السريع إلى العمليات الأكثر استخدامًا
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {quickActions.map((action) => {
              const Icon = action.icon;

              return (
                <button
                  key={action.label}
                  type="button"
                  className="group flex items-center gap-3 rounded-xl border border-slate-200 p-4 text-right transition duration-200 hover:-translate-y-0.5 hover:border-teal-200 hover:bg-teal-50/50 hover:shadow-sm"
                >
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-500 transition group-hover:bg-teal-100 group-hover:text-teal-600">
                    <Icon size={17} />
                  </span>

                  <span className="min-w-0">
                    <span className="block text-xs font-bold text-slate-700">
                      {action.label}
                    </span>

                    <span className="mt-1 block truncate text-[10px] text-slate-400">
                      {action.description}
                    </span>
                  </span>
                </button>
              );
            })}
          </div>
        </section>
      </div>
    </main>
  );
}