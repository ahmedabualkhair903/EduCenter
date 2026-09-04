
"use client";

import { useState } from "react";
import {
  FiAlertCircle,
  FiBell,
  FiBookOpen,
  FiCheck,
  FiChevronLeft,
  FiClock,
  FiDollarSign,
  FiFileText,
  FiMapPin,
  FiMessageCircle,
  FiRefreshCw,
  FiSave,
  FiSettings,
  FiShield,
  FiUsers,
} from "react-icons/fi";

import { useAppSettings } from "@/components/providers";
import { settingsService } from "@/services/settingsService";
import type { ModuleKey } from "@/types";

const featureIcons: Partial<
  Record<ModuleKey, React.ReactNode>
> = {
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
    description:
      "إضافة وتعديل ومتابعة بيانات الطلاب.",
  },
  {
    key: "groups",
    title: "المجموعات",
    description:
      "إدارة المجموعات والمواد والمدرسين.",
  },
  {
    key: "lessons",
    title: "الحصص",
    description:
      "إدارة جدول الحصص والجلسات.",
  },
  {
    key: "attendance",
    title: "الحضور والغياب",
    description:
      "تسجيل ومتابعة حضور وغياب الطلاب.",
  },
  {
    key: "checkOut",
    title: "الحضور والانصراف",
    description:
      "تسجيل دخول وانصراف الطلاب.",
  },
  {
    key: "location",
    title: "Location",
    description:
      "تفعيل واستخدام إعدادات الموقع للحضور.",
  },
  {
    key: "attendancePassword",
    title: "Password للحضور",
    description:
      "تفعيل كلمة مرور خاصة بجلسة الحضور.",
  },
  {
    key: "exams",
    title: "الامتحانات والدرجات",
    description:
      "إدارة الامتحانات وإدخال نتائج الطلاب.",
  },
  {
    key: "payments",
    title: "المصروفات والمدفوعات",
    description:
      "متابعة الرسوم والدفعات والديون.",
  },
  {
    key: "whatsapp",
    title: "WhatsApp",
    description:
      "تجهيز ومتابعة رسائل أولياء الأمور.",
  },
  {
    key: "resultMessages",
    title: "رسائل النتائج",
    description:
      "إرسال نتائج الامتحانات لأولياء الأمور لاحقًا.",
  },
  {
    key: "attendanceMessages",
    title: "رسائل الحضور",
    description:
      "تجهيز إشعارات حضور الطلاب.",
  },
  {
    key: "checkOutMessages",
    title: "رسائل الانصراف",
    description:
      "تجهيز إشعارات انصراف الطلاب.",
  },
  {
    key: "absenceMessages",
    title: "رسائل الغياب",
    description:
      "تجهيز إشعارات غياب الطلاب.",
  },
  {
    key: "excel",
    title: "Excel",
    description:
      "استيراد وتصدير بيانات النظام.",
  },
  {
    key: "reports",
    title: "التقارير",
    description:
      "عرض وتجهيز تقارير المركز.",
  },
];

export default function SettingsPage() {
  const {
    settings,
    setModuleEnabled,
    updateSettings,
  } = useAppSettings();

  const [centerName, setCenterName] =
    useState(
      settings.center.centerName,
    );

  const [logoUrl, setLogoUrl] =
    useState(
      settings.center.logoUrl ?? "",
    );

  const [phone, setPhone] =
    useState(
      settings.center.phone ?? "",
    );

  const [secondaryPhone, setSecondaryPhone] =
    useState(
      settings.center.secondaryPhone ?? "",
    );

  const [address, setAddress] =
    useState(
      settings.center.address ?? "",
    );

  const [academicYear, setAcademicYear] =
    useState(
      settings.center.academicYear ?? "",
    );

  const [saved, setSaved] =
    useState(false);

  const [syncLoading, setSyncLoading] =
    useState(false);

  const [syncError, setSyncError] =
    useState<string | null>(null);

  const [syncSuccess, setSyncSuccess] =
    useState(false);

  const enabledCount =
    Object.values(
      settings.modules,
    ).filter(Boolean).length;

  const totalModules =
    Object.keys(
      settings.modules,
    ).length;

  const toggleModule = (
    key: ModuleKey,
  ) => {
    setModuleEnabled(
      key,
      !settings.modules[key],
    );

    setSaved(false);
  };

  const updateAttendance = (
    patch: Partial<
      typeof settings.attendance
    >,
  ) => {
    updateSettings({
      attendance: {
        ...settings.attendance,
        ...patch,
      },
    });

    setSaved(false);
  };

  const updateNotifications = (
    patch: Partial<
      typeof settings.notifications
    >,
  ) => {
    updateSettings({
      notifications: {
        ...settings.notifications,
        ...patch,
      },
    });

    setSaved(false);
  };

  const updateParentPortal = (
    patch: Partial<
      typeof settings.parentPortal
    >,
  ) => {
    updateSettings({
      parentPortal: {
        ...settings.parentPortal,
        ...patch,
      },
    });

    setSaved(false);
    setSyncError(null);
    setSyncSuccess(false);
  };

  const handleParentPortalSync =
    async () => {
      if (
        !settings.parentPortal.enabled ||
        syncLoading
      ) {
        return;
      }

      setSyncLoading(true);
      setSyncError(null);
      setSyncSuccess(false);

      const syncingParentPortal = {
        ...settings.parentPortal,
        syncStatus: "syncing" as const,
      };

      updateSettings({
        parentPortal:
          syncingParentPortal,
      });

      try {
        const result =
          await settingsService.syncParentPortal(
            {
              ...settings,
              parentPortal:
                syncingParentPortal,
            },
          );

        if (!result.success) {
          updateSettings({
            parentPortal: {
              ...result.settings.parentPortal,
              syncStatus: "error",
            },
          });

          setSyncError(
            result.message ||
              "تعذر تحديث بيانات أولياء الأمور.",
          );

          return;
        }

        updateSettings({
          parentPortal:
            result.settings.parentPortal,
        });

        setSyncSuccess(true);

        window.setTimeout(() => {
          setSyncSuccess(false);
        }, 3000);
      } catch {
        updateSettings({
          parentPortal: {
            ...settings.parentPortal,
            syncStatus: "error",
          },
        });

        setSyncError(
          "حدث خطأ أثناء تحديث بيانات أولياء الأمور.",
        );
      } finally {
        setSyncLoading(false);
      }
    };

  const handleSave = () => {
    updateSettings({
      center: {
        ...settings.center,
        centerName:
          centerName.trim(),
        logoUrl:
          logoUrl.trim() || undefined,
        phone:
          phone.trim() || undefined,
        secondaryPhone:
          secondaryPhone.trim() ||
          undefined,
        address:
          address.trim() || undefined,
        academicYear:
          academicYear.trim() ||
          undefined,
      },
    });

    setSaved(true);

    window.setTimeout(() => {
      setSaved(false);
    }, 2500);
  };

  const parentPortalStatus =
    settings.parentPortal.syncStatus;

  const parentPortalStatusLabel =
    parentPortalStatus === "syncing"
      ? "جاري التحديث"
      : parentPortalStatus === "success"
        ? "تمت المزامنة"
        : parentPortalStatus === "error"
          ? "فشل التحديث"
          : "لم تتم المزامنة";

  const lastSyncLabel =
    settings.parentPortal.lastSync
      ? new Date(
          settings.parentPortal.lastSync,
        ).toLocaleString("ar-EG", {
          dateStyle: "medium",
          timeStyle: "short",
        })
      : "لم تتم المزامنة بعد";

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
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
              تخصيص بيانات المركز والتحكم في
              الخصائص والخدمات.
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

        {saved && (
          <div className="mb-5 flex items-center gap-2 rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-xs font-semibold text-emerald-700">
            <FiCheck size={16} />
            تم حفظ الإعدادات بنجاح.
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            {/* Center */}
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
                  placeholder="اسم المركز"
                />

                <Field
                  label="رابط اللوجو"
                  value={logoUrl}
                  onChange={setLogoUrl}
                  placeholder="https://..."
                  direction="ltr"
                />

                <Field
                  label="رقم الهاتف"
                  value={phone}
                  onChange={setPhone}
                  direction="ltr"
                  placeholder="01xxxxxxxxx"
                />

                <Field
                  label="رقم تواصل إضافي"
                  value={secondaryPhone}
                  onChange={setSecondaryPhone}
                  direction="ltr"
                  placeholder="01xxxxxxxxx"
                />

                <Field
                  label="العنوان"
                  value={address}
                  onChange={setAddress}
                  placeholder="عنوان المركز"
                />

                <Field
                  label="العام الدراسي"
                  value={academicYear}
                  onChange={setAcademicYear}
                  placeholder="2026 / 2027"
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
                description="أي Module مغلقة هنا يجب ألا تظهر في واجهة النظام."
              />

              <div className="divide-y divide-slate-100">
                {featureDefinitions.map(
                  (feature) => (
                    <FeatureRow
                      key={feature.key}
                      title={feature.title}
                      description={
                        feature.description
                      }
                      icon={
                        featureIcons[
                          feature.key
                        ] ?? (
                          <FiSettings
                            size={18}
                          />
                        )
                      }
                      enabled={Boolean(
                        settings.modules[
                          feature.key
                        ],
                      )}
                      onToggle={() =>
                        toggleModule(
                          feature.key,
                        )
                      }
                    />
                  ),
                )}
              </div>
            </section>

            {/* Attendance */}
            <section
              id="attendance-settings"
              className="rounded-xl border border-slate-200 bg-white shadow-sm"
            >
              <SettingsHeader
                icon={<FiMapPin size={18} />}
                title="إعدادات الحضور"
                description="إعدادات الواجهة الخاصة بالحضور والموقع وكلمة المرور."
              />

              <div className="divide-y divide-slate-100">
                <SettingToggle
                  title="تفعيل الحضور"
                  description="السماح باستخدام وحدة الحضور والغياب."
                  enabled={
                    settings.attendance
                      .enabled
                  }
                  onToggle={() =>
                    updateAttendance({
                      enabled:
                        !settings.attendance
                          .enabled,
                    })
                  }
                />

                <SettingToggle
                  title="تفعيل الانصراف"
                  description="إظهار واستخدام تسجيل انصراف الطلاب."
                  enabled={
                    settings.attendance
                      .checkOutEnabled
                  }
                  onToggle={() =>
                    updateAttendance({
                      checkOutEnabled:
                        !settings.attendance
                          .checkOutEnabled,
                    })
                  }
                />

                <SettingToggle
                  title="تفعيل Location"
                  description="عرض إعدادات الموقع للحضور. التحقق الحقيقي يتم لاحقًا من Backend."
                  enabled={
                    settings.attendance
                      .locationEnabled
                  }
                  onToggle={() =>
                    updateAttendance({
                      locationEnabled:
                        !settings.attendance
                          .locationEnabled,
                    })
                  }
                />

                <SettingToggle
                  title="تفعيل Password للحضور"
                  description="استخدام كلمة مرور للجلسة. التحقق الحقيقي يتم لاحقًا من Backend."
                  enabled={
                    settings.attendance
                      .passwordEnabled
                  }
                  onToggle={() =>
                    updateAttendance({
                      passwordEnabled:
                        !settings.attendance
                          .passwordEnabled,
                    })
                  }
                />

                <div className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:px-6">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-50 text-slate-500">
                    <FiMapPin size={18} />
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-slate-700">
                      نطاق السماح بالحضور
                    </p>

                    <p className="mt-1 text-[11px] leading-5 text-slate-400">
                      المسافة المسموح بها من موقع
                      المركز بالمتر.
                    </p>
                  </div>

                  <input
                    type="number"
                    min="0"
                    step="1"
                    value={
                      settings.attendance
                        .allowedRadiusMeters
                    }
                    onChange={(event) => {
                      const value =
                        Number(
                          event.target.value,
                        );

                      updateAttendance({
                        allowedRadiusMeters:
                          Number.isFinite(
                            value,
                          ) && value >= 0
                            ? value
                            : 0,
                      });
                    }}
                    className="h-10 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm text-slate-700 outline-none transition focus:border-teal-500 focus:bg-white focus:ring-4 focus:ring-teal-500/10 sm:w-32"
                    aria-label="نطاق السماح بالحضور بالمتر"
                  />
                </div>
              </div>
            </section>

            {/* Notifications */}
            <section
              id="notifications-settings"
              className="rounded-xl border border-slate-200 bg-white shadow-sm"
            >
              <SettingsHeader
                icon={<FiBell size={18} />}
                title="إعدادات WhatsApp"
                description="تفعيل أنواع الرسائل التي سيتم تجهيزها وإرسالها لاحقًا من خلال Backend."
              />

              <div className="divide-y divide-slate-100">
                <SettingToggle
                  title="WhatsApp"
                  description="تفعيل وحدة رسائل WhatsApp."
                  enabled={
                    settings.notifications
                      .whatsappEnabled
                  }
                  onToggle={() =>
                    updateNotifications({
                      whatsappEnabled:
                        !settings.notifications
                          .whatsappEnabled,
                    })
                  }
                />

                <SettingToggle
                  title="رسائل النتائج"
                  description="إرسال نتائج الامتحانات لأولياء الأمور."
                  enabled={
                    settings.notifications
                      .resultMessagesEnabled
                  }
                  onToggle={() =>
                    updateNotifications({
                      resultMessagesEnabled:
                        !settings.notifications
                          .resultMessagesEnabled,
                    })
                  }
                />

                <SettingToggle
                  title="رسائل الحضور"
                  description="إرسال إشعار عند تسجيل حضور الطالب."
                  enabled={
                    settings.notifications
                      .attendanceMessagesEnabled
                  }
                  onToggle={() =>
                    updateNotifications({
                      attendanceMessagesEnabled:
                        !settings.notifications
                          .attendanceMessagesEnabled,
                    })
                  }
                />

                <SettingToggle
                  title="رسائل الانصراف"
                  description="إرسال إشعار عند تسجيل انصراف الطالب."
                  enabled={
                    settings.notifications
                      .checkOutMessagesEnabled
                  }
                  onToggle={() =>
                    updateNotifications({
                      checkOutMessagesEnabled:
                        !settings.notifications
                          .checkOutMessagesEnabled,
                    })
                  }
                />

                <SettingToggle
                  title="رسائل الغياب"
                  description="إرسال إشعار غياب الطالب."
                  enabled={
                    settings.notifications
                      .absenceMessagesEnabled
                  }
                  onToggle={() =>
                    updateNotifications({
                      absenceMessagesEnabled:
                        !settings.notifications
                          .absenceMessagesEnabled,
                    })
                  }
                />
              </div>
            </section>

            {/* Parent Portal */}
            <section
              id="parent-portal-settings"
              className="rounded-xl border border-slate-200 bg-white shadow-sm"
            >
              <SettingsHeader
                icon={<FiUsers size={18} />}
                title="بوابة ولي الأمر"
                description="إدارة تفعيل بوابة ولي الأمر وطريقة مزامنة بيانات أولياء الأمور."
              />

              <div className="divide-y divide-slate-100">
                <FeatureRow
                  title="تفعيل Parent Portal"
                  description="السماح باستخدام بوابة ولي الأمر ومزامنة بيانات أولياء الأمور."
                  icon={<FiUsers size={18} />}
                  enabled={
                    settings.parentPortal
                      .enabled
                  }
                  onToggle={() =>
                    updateParentPortal({
                      enabled:
                        !settings.parentPortal
                          .enabled,
                    })
                  }
                />

                <div className="flex flex-col gap-4 px-5 py-4 sm:px-6">
                  <div className="flex items-start gap-4">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-50 text-slate-500">
                      <FiRefreshCw
                        size={18}
                      />
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-slate-700">
                        طريقة المزامنة
                      </p>

                      <p className="mt-1 text-[11px] leading-5 text-slate-400">
                        اختر هل تتم المزامنة يدويًا
                        أو تلقائيًا عند توفر Backend.
                      </p>
                    </div>
                  </div>

                  <div className="grid gap-2 sm:grid-cols-2">
                    <button
                      type="button"
                      disabled={
                        !settings.parentPortal
                          .enabled
                      }
                      onClick={() =>
                        updateParentPortal({
                          syncMode: "manual",
                        })
                      }
                      className={[
                        "rounded-lg border px-4 py-3 text-right transition",
                        settings.parentPortal
                          .syncMode ===
                        "manual"
                          ? "border-teal-500 bg-teal-50 text-teal-700"
                          : "border-slate-200 bg-slate-50 text-slate-600 hover:border-slate-300",
                        !settings.parentPortal
                          .enabled
                          ? "cursor-not-allowed opacity-50"
                          : "",
                      ].join(" ")}
                    >
                      <span className="block text-xs font-semibold">
                        Manual Sync
                      </span>

                      <span className="mt-1 block text-[11px] text-slate-400">
                        التحديث يدويًا من خلال الزر.
                      </span>
                    </button>

                    <button
                      type="button"
                      disabled={
                        !settings.parentPortal
                          .enabled
                      }
                      onClick={() =>
                        updateParentPortal({
                          syncMode: "auto",
                        })
                      }
                      className={[
                        "rounded-lg border px-4 py-3 text-right transition",
                        settings.parentPortal
                          .syncMode ===
                        "auto"
                          ? "border-teal-500 bg-teal-50 text-teal-700"
                          : "border-slate-200 bg-slate-50 text-slate-600 hover:border-slate-300",
                        !settings.parentPortal
                          .enabled
                          ? "cursor-not-allowed opacity-50"
                          : "",
                      ].join(" ")}
                    >
                      <span className="block text-xs font-semibold">
                        Auto Sync
                      </span>

                      <span className="mt-1 block text-[11px] text-slate-400">
                        جاهز للربط مع المزامنة
                        التلقائية من Backend.
                      </span>
                    </button>
                  </div>
                </div>

                <div className="grid gap-4 px-5 py-4 sm:grid-cols-3 sm:px-6">
                  <ParentPortalInfo
                    label="آخر مزامنة"
                    value={lastSyncLabel}
                  />

                  <ParentPortalInfo
                    label="حالة المزامنة"
                    value={
                      parentPortalStatusLabel
                    }
                    positive={
                      parentPortalStatus ===
                      "success"
                    }
                  />

                  <ParentPortalInfo
                    label="Pending Sync"
                    value={String(
                      settings.parentPortal
                        .pendingSync,
                    )}
                    positive={
                      settings.parentPortal
                        .pendingSync === 0
                    }
                  />
                </div>

                {syncSuccess && (
                  <div className="mx-5 my-4 flex items-start gap-3 rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-xs font-semibold text-emerald-700 sm:mx-6">
                    <FiCheck
                      size={17}
                      className="mt-0.5 shrink-0"
                    />

                    <div>
                      <p>
                        تم تحديث بيانات أولياء
                        الأمور بنجاح.
                      </p>

                      <p className="mt-1 text-[11px] font-normal text-emerald-600">
                        تمت مزامنة البيانات
                        المعلقة وتحديث وقت آخر
                        مزامنة.
                      </p>
                    </div>
                  </div>
                )}

                {syncError && (
                  <div className="mx-5 my-4 flex items-start gap-3 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-xs font-semibold text-red-700 sm:mx-6">
                    <FiAlertCircle
                      size={17}
                      className="mt-0.5 shrink-0"
                    />

                    <div>
                      <p>
                        تعذر تحديث بيانات أولياء
                        الأمور.
                      </p>

                      <p className="mt-1 text-[11px] font-normal text-red-600">
                        {syncError}
                      </p>
                    </div>
                  </div>
                )}

                <div className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-slate-700">
                      تحديث بيانات أولياء الأمور
                    </p>

                    <p className="mt-1 text-[11px] leading-5 text-slate-400">
                      تحديث البيانات المعلقة من خلال
                      خدمة المزامنة. الربط الفعلي
                      مع النظام Online يتم لاحقًا
                      من خلال Backend API.
                    </p>
                  </div>

                  <button
                    type="button"
                    disabled={
                      !settings.parentPortal
                        .enabled ||
                      syncLoading
                    }
                    onClick={
                      handleParentPortalSync
                    }
                    className={[
                      "inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-lg px-4 text-xs font-semibold shadow-sm transition",
                      settings.parentPortal
                        .enabled &&
                      !syncLoading
                        ? "bg-teal-600 text-white hover:bg-teal-700 active:scale-[0.98]"
                        : "cursor-not-allowed bg-slate-100 text-slate-400",
                    ].join(" ")}
                  >
                    <FiRefreshCw
                      size={15}
                      className={
                        syncLoading
                          ? "animate-spin"
                          : ""
                      }
                    />

                    {syncLoading
                      ? "جاري التحديث..."
                      : "تحديث البيانات"}
                  </button>
                </div>
              </div>
            </section>
          </div>

          {/* Sidebar */}
          <aside className="space-y-6">
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
                  label="Location"
                  value={
                    settings.attendance
                      .locationEnabled
                      ? "مفعّل"
                      : "متوقف"
                  }
                  positive={
                    settings.attendance
                      .locationEnabled
                  }
                />

                <StatusRow
                  label="WhatsApp"
                  value={
                    settings.notifications
                      .whatsappEnabled
                      ? "مفعّل"
                      : "متوقف"
                  }
                  positive={
                    settings.notifications
                      .whatsappEnabled
                  }
                />

                <StatusRow
                  label="Parent Portal"
                  value={
                    settings.parentPortal
                      .enabled
                      ? "مفعّل"
                      : "متوقف"
                  }
                  positive={
                    settings.parentPortal
                      .enabled
                  }
                />

                <StatusRow
                  label="Sync Status"
                  value={
                    parentPortalStatusLabel
                  }
                  positive={
                    parentPortalStatus ===
                    "success"
                  }
                />

                <StatusRow
                  label="الإصدار"
                  value="1.0.0"
                />
              </div>
            </section>

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
                    scrollToSection(
                      "center-settings",
                    )
                  }
                />

                <QuickSetting
                  label="Modules"
                  onClick={() =>
                    scrollToSection(
                      "features-settings",
                    )
                  }
                />

                <QuickSetting
                  label="إعدادات الحضور"
                  onClick={() =>
                    scrollToSection(
                      "attendance-settings",
                    )
                  }
                />

                <QuickSetting
                  label="WhatsApp"
                  onClick={() =>
                    scrollToSection(
                      "notifications-settings",
                    )
                  }
                />

                <QuickSetting
                  label="بوابة ولي الأمر"
                  onClick={() =>
                    scrollToSection(
                      "parent-portal-settings",
                    )
                  }
                />
              </div>
            </section>

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
                    إعدادات Parent Portal
                    والمزامنة محفوظة محليًا حاليًا،
                    وطبقة الخدمة جاهزة لاستبدال
                    Mock Sync بطلبات Backend API
                    لاحقًا دون إعادة بناء الواجهة.
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
/* Helpers                                                                    */
/* -------------------------------------------------------------------------- */

function scrollToSection(
  id: string,
) {
  document
    .getElementById(id)
    ?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
}

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
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  direction?: "ltr";
  placeholder?: string;
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
        placeholder={placeholder}
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

function ParentPortalInfo({
  label,
  value,
  positive = false,
}: {
  label: string;
  value: string;
  positive?: boolean;
}) {
  return (
    <div className="rounded-lg bg-slate-50 px-4 py-3">
      <p className="text-[11px] font-medium text-slate-400">
        {label}
      </p>

      <p
        className={[
          "mt-1 text-xs font-semibold",
          positive
            ? "text-emerald-600"
            : "text-slate-700",
        ].join(" ")}
      >
        {value}
      </p>
    </div>
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
