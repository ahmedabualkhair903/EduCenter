"use client";

import { useState } from "react";
import {
  FiBell,
  FiBookOpen,
  FiCheck,
  FiChevronLeft,
  FiClock,
  FiDollarSign,
  FiFileText,
  FiMapPin,
  FiMessageCircle,
  FiSave,
  FiSettings,
  FiShield,
  FiUsers,
} from "react-icons/fi";

import { useAppSettings } from "@/components/providers";
import type { ModuleKey } from "@/types";

const featureIcons: Partial<Record<ModuleKey, React.ReactNode>> = {
  students: <FiUsers size={18} />,
  groups: <FiBookOpen size={18} />,
  lessons: <FiBookOpen size={18} />,
  attendance: <FiCheck size={18} />,
  checkOut: <FiClock size={18} />,
  location: <FiMapPin size={18} />,
  attendancePassword: <FiShield size={18} />,
  exams: <FiFileText size={18} />,
  payments: <FiDollarSign size={18} />,
  whatsapp: <FiMessageCircle size={18} />,
  resultMessages: <FiMessageCircle size={18} />,
  attendanceMessages: <FiMessageCircle size={18} />,
  checkOutMessages: <FiMessageCircle size={18} />,
  absenceMessages: <FiMessageCircle size={18} />,
  excel: <FiFileText size={18} />,
  reports: <FiFileText size={18} />,
};

const featureDefinitions: Array<{
  key: ModuleKey;
  title: string;
  description: string;
}> = [
  {
    key: "students",
    title: "إدارة الطلاب",
    description: "إضافة وتعديل ومتابعة بيانات الطلاب.",
  },
  {
    key: "groups",
    title: "المجموعات",
    description: "إدارة المجموعات والمواد والمدرسين.",
  },
  {
    key: "lessons",
    title: "الحصص",
    description: "إدارة جدول الحصص والجلسات.",
  },
  {
    key: "attendance",
    title: "الحضور والغياب",
    description: "تسجيل ومتابعة حضور الطلاب.",
  },
  {
    key: "checkOut",
    title: "الحضور والانصراف",
    description: "تسجيل دخول وانصراف الطلاب.",
  },
  {
    key: "location",
    title: "Location",
    description: "إظهار وإدارة إعدادات نطاق الحضور.",
  },
  {
    key: "attendancePassword",
    title: "Password للحضور",
    description: "تفعيل كلمة مرور خاصة بفتح الحضور.",
  },
  {
    key: "exams",
    title: "الامتحانات والدرجات",
    description: "إدارة الامتحانات ودرجات الطلاب.",
  },
  {
    key: "payments",
    title: "المدفوعات",
    description: "متابعة الرسوم والدفعات والديون.",
  },
  {
    key: "whatsapp",
    title: "WhatsApp",
    description:
      "تجهيز رسائل أولياء الأمور للإرسال لاحقًا عبر Backend.",
  },
  {
    key: "resultMessages",
    title: "رسائل النتائج",
    description: "تفعيل رسائل نتائج الامتحانات.",
  },
  {
    key: "attendanceMessages",
    title: "رسائل الحضور",
    description: "تفعيل رسائل الحضور.",
  },
  {
    key: "checkOutMessages",
    title: "رسائل الانصراف",
    description: "تفعيل رسائل الانصراف.",
  },
  {
    key: "absenceMessages",
    title: "رسائل الغياب",
    description: "تفعيل رسائل الغياب.",
  },
  {
    key: "excel",
    title: "Excel",
    description: "استيراد وتصدير بيانات النظام.",
  },
  {
    key: "reports",
    title: "التقارير",
    description: "تجهيز وحدة التقارير للمركز.",
  },
];

export default function SettingsPage() {
  const { settings, setModuleEnabled, updateSettings } =
    useAppSettings();

  const [centerName, setCenterName] = useState(
    settings.center.centerName,
  );

  const [phone, setPhone] = useState(
    settings.center.phone ?? "",
  );

  const [address, setAddress] = useState(
    settings.center.address ?? "",
  );

  const [academicYear, setAcademicYear] = useState(
    settings.center.academicYear ?? "",
  );

  /*
   * الإشعارات هنا Local UI settings.
   *
   * لا نعتمد على:
   * settings.notifications.general
   * settings.notifications.paymentReminders
   * settings.notifications.attendance
   *
   * لأن هذه المفاتيح غير موجودة في Type AppSettings الحالي.
   */
  const [notifications, setNotifications] = useState(true);

  const [paymentReminders, setPaymentReminders] =
    useState(true);

  const [attendanceNotifications, setAttendanceNotifications] =
    useState(true);

  const [saved, setSaved] = useState(false);

  const enabledCount = Object.values(settings.modules).filter(
    Boolean,
  ).length;

  const totalModules = Object.keys(settings.modules).length;

  const toggleModule = (key: ModuleKey) => {
    setModuleEnabled(key, !settings.modules[key]);
    setSaved(false);
  };

  const handleSave = () => {
    /*
     * نحفظ بيانات المركز فقط لأنها متوافقة
     * مع AppSettings الحالية.
     *
     * إعدادات الإشعارات الحالية UI state فقط،
     * ولما نعدل types/settings لاحقًا نقدر نربطها
     * بالـAppSettings بشكل صحيح.
     */
    updateSettings({
      center: {
        ...settings.center,
        centerName,
        phone,
        address,
        academicYear,
      },
    });

    setSaved(true);

    window.setTimeout(() => {
      setSaved(false);
    }, 2500);
  };

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="mb-2 flex items-center gap-2 text-xs font-medium text-slate-400">
              <span>الرئيسية</span>
              <span>/</span>
              <span className="text-teal-600">
                الإعدادات
              </span>
            </div>

            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              الإعدادات
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              تخصيص النظام والتحكم في الخصائص والإشعارات.
            </p>
          </div>

          <button
            type="button"
            onClick={handleSave}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-teal-600 px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-teal-700 active:scale-[0.98]"
          >
            <FiSave size={16} />
            حفظ التغييرات
          </button>
        </div>

        {/* Saved Message */}
        {saved && (
          <div className="mb-5 flex items-center gap-2 rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-xs font-semibold text-emerald-700">
            <FiCheck size={16} />
            تم حفظ الإعدادات.
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main Content */}
          <div className="space-y-6 lg:col-span-2">
            {/* Center Settings */}
            <section
              id="center-settings"
              className="rounded-xl border border-slate-200 bg-white shadow-sm"
            >
              <SettingsHeader
                icon={<FiSettings size={18} />}
                title="بيانات المركز"
                description="المعلومات الأساسية الخاصة بالمركز التعليمي."
              />

              <div className="grid gap-4 p-5 sm:grid-cols-2 sm:p-6">
                <Field
                  label="اسم المركز"
                  value={centerName}
                  onChange={setCenterName}
                />

                <Field
                  label="رقم الهاتف"
                  value={phone}
                  onChange={setPhone}
                  direction="ltr"
                />

                <Field
                  label="العنوان"
                  value={address}
                  onChange={setAddress}
                />

                <Field
                  label="العام الدراسي"
                  value={academicYear}
                  onChange={setAcademicYear}
                />
              </div>
            </section>

            {/* Modules */}
            <section
              id="features-settings"
              className="rounded-xl border border-slate-200 bg-white shadow-sm"
            >
              <SettingsHeader
                icon={<FiSettings size={18} />}
                title="Modules"
                description="أي Module مغلقة هنا تختفي تلقائيًا من Sidebar."
              />

              <div className="divide-y divide-slate-100">
                {featureDefinitions.map((feature) => (
                  <FeatureRow
                    key={feature.key}
                    title={feature.title}
                    description={feature.description}
                    icon={
                      featureIcons[feature.key] ?? (
                        <FiSettings size={18} />
                      )
                    }
                    enabled={Boolean(
                      settings.modules[feature.key],
                    )}
                    onToggle={() =>
                      toggleModule(feature.key)
                    }
                  />
                ))}
              </div>
            </section>

            {/* Notifications */}
            <section
              id="notifications-settings"
              className="rounded-xl border border-slate-200 bg-white shadow-sm"
            >
              <SettingsHeader
                icon={<FiBell size={18} />}
                title="الإشعارات"
                description="تحكم في التنبيهات الداخلية."
              />

              <div className="divide-y divide-slate-100">
                <SettingToggle
                  title="الإشعارات العامة"
                  description="عرض التنبيهات المهمة داخل لوحة التحكم."
                  enabled={notifications}
                  onToggle={() =>
                    setNotifications(
                      (value) => !value,
                    )
                  }
                />

                <SettingToggle
                  title="تذكير بالمدفوعات"
                  description="إظهار تنبيهات للطلاب الذين لديهم مبالغ مستحقة."
                  enabled={paymentReminders}
                  onToggle={() =>
                    setPaymentReminders(
                      (value) => !value,
                    )
                  }
                />

                <SettingToggle
                  title="تنبيهات الحضور"
                  description="إظهار تنبيهات مرتبطة بالحضور والغياب."
                  enabled={attendanceNotifications}
                  onToggle={() =>
                    setAttendanceNotifications(
                      (value) => !value,
                    )
                  }
                />
              </div>
            </section>
          </div>

          {/* Sidebar */}
          <aside className="space-y-6">
            {/* System Status */}
            <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="mb-5 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-teal-50 text-teal-600">
                  <FiShield size={18} />
                </div>

                <div>
                  <h2 className="text-sm font-bold text-slate-800">
                    حالة النظام
                  </h2>

                  <p className="mt-1 text-[11px] text-slate-400">
                    معلومات النظام الحالية
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <StatusRow
                  label="النظام"
                  value="يعمل"
                  positive
                />

                <StatusRow
                  label="وضع التشغيل"
                  value="Offline"
                />

                <StatusRow
                  label="الخصائص المفعلة"
                  value={`${enabledCount} / ${totalModules}`}
                />

                <StatusRow
                  label="الإصدار"
                  value="1.0.0"
                />
              </div>
            </section>

            {/* Quick Settings */}
            <section className="rounded-xl border border-slate-200 bg-white shadow-sm">
              <div className="border-b border-slate-100 px-5 py-4">
                <h2 className="text-sm font-bold text-slate-800">
                  إعدادات سريعة
                </h2>

                <p className="mt-1 text-[11px] text-slate-400">
                  اختصارات لأكثر الإعدادات استخدامًا.
                </p>
              </div>

              <div className="p-2">
                <QuickSetting
                  label="بيانات المركز"
                  onClick={() =>
                    document
                      .getElementById(
                        "center-settings",
                      )
                      ?.scrollIntoView({
                        behavior: "smooth",
                      })
                  }
                />

                <QuickSetting
                  label="Modules"
                  onClick={() =>
                    document
                      .getElementById(
                        "features-settings",
                      )
                      ?.scrollIntoView({
                        behavior: "smooth",
                      })
                  }
                />

                <QuickSetting
                  label="الإشعارات"
                  onClick={() =>
                    document
                      .getElementById(
                        "notifications-settings",
                      )
                      ?.scrollIntoView({
                        behavior: "smooth",
                      })
                  }
                />
              </div>
            </section>

            {/* API Ready */}
            <section className="rounded-xl border border-slate-200 bg-slate-900 p-5 text-white">
              <div className="flex items-start gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/10">
                  <FiShield size={17} />
                </div>

                <div>
                  <h2 className="text-sm font-bold">
                    جاهز للـAPI
                  </h2>

                  <p className="mt-1 text-[11px] leading-5 text-slate-300">
                    الإعدادات الحالية تعمل محليًا،
                    والـService Layer جاهزة لاستبدال
                    Mock Data بـ REST API لاحقًا.
                  </p>
                </div>
              </div>
            </section>
          </aside>
        </div>
      </div>
    </main>
  );
}

/* -------------------------------------------------------------------------- */
/* Components                                                                 */
/* -------------------------------------------------------------------------- */

function SettingsHeader({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="flex items-center gap-3 border-b border-slate-100 px-5 py-4 sm:px-6">
      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-teal-50 text-teal-600">
        {icon}
      </div>

      <div>
        <h2 className="text-sm font-bold text-slate-800">
          {title}
        </h2>

        <p className="mt-1 text-[11px] text-slate-400">
          {description}
        </p>
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  direction,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  direction?: "ltr";
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-semibold text-slate-600">
        {label}
      </span>

      <input
        value={value}
        onChange={(event) =>
          onChange(event.target.value)
        }
        dir={direction}
        className="field"
      />
    </label>
  );
}

function FeatureRow({
  title,
  description,
  icon,
  enabled,
  onToggle,
}: {
  title: string;
  description: string;
  icon: React.ReactNode;
  enabled: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="flex items-center gap-4 px-5 py-4 sm:px-6">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-50 text-slate-500">
        {icon}
      </div>

      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-slate-700">
          {title}
        </p>

        <p className="mt-1 text-[11px] leading-5 text-slate-400">
          {description}
        </p>
      </div>

      <button
        type="button"
        onClick={onToggle}
        aria-pressed={enabled}
        aria-label={`تفعيل أو تعطيل ${title}`}
        className={[
          "relative h-6 w-11 shrink-0 rounded-full transition",
          enabled
            ? "bg-teal-600"
            : "bg-slate-200",
        ].join(" ")}
      >
        <span
          className={[
            "absolute top-1 h-4 w-4 rounded-full bg-white shadow-sm transition",
            enabled
              ? "right-1"
              : "right-6",
          ].join(" ")}
        />
      </button>
    </div>
  );
}

function SettingToggle({
  title,
  description,
  enabled,
  onToggle,
}: {
  title: string;
  description: string;
  enabled: boolean;
  onToggle: () => void;
}) {
  return (
    <FeatureRow
      title={title}
      description={description}
      icon={<FiBell size={18} />}
      enabled={enabled}
      onToggle={onToggle}
    />
  );
}

function StatusRow({
  label,
  value,
  positive = false,
}: {
  label: string;
  value: string;
  positive?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="text-xs text-slate-500">
        {label}
      </span>

      <span
        className={
          positive
            ? "inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-600"
            : "text-xs font-semibold text-slate-700"
        }
      >
        {positive && (
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
        )}

        {value}
      </span>
    </div>
  );
}

function QuickSetting({
  label,
  onClick,
}: {
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-right text-xs font-medium text-slate-600 transition hover:bg-slate-50 hover:text-slate-800"
    >
      <span className="flex-1">
        {label}
      </span>

      <FiChevronLeft
        size={15}
        className="text-slate-400"
      />
    </button>
  );
}