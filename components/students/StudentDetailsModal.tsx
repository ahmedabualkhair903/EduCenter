"use client";

import {
useEffect,
useMemo,
useState,
} from "react";

import {
FiCalendar,
FiCheckCircle,
FiClock,
FiEdit2,
FiMessageCircle,
FiPhone,
FiUser,
FiX,
} from "react-icons/fi";

import type {
Student,
StudentCustomFieldDefinition,
StudentCustomFieldValue,
} from "@/types";

import { studentService } from "@/services";

type StudentDetailsModalProps = {
open: boolean;
student: Student | null;
onClose: () => void;
onEdit: (student: Student) => void;
};

const groupNames: Record<string, string> = {
"group-001": "مجموعة أ",
"group-002": "مجموعة ب",
"group-003": "مجموعة ج",
};

const statusLabels: Record<Student["status"], string> = {
active: "نشط",
inactive: "غير نشط",
suspended: "متوقف",
};

export default function StudentDetailsModal({
open,
student,
onClose,
onEdit,
}: StudentDetailsModalProps) {
const [customFieldDefinitions, setCustomFieldDefinitions] =
useState<StudentCustomFieldDefinition[]>([]);

useEffect(() => {
if (!open || !student) {
return;
}


let mounted = true;

const loadCustomFieldDefinitions = async () => {
  try {
    const definitions = await studentService.customFields();

    if (!mounted) {
      return;
    }

    setCustomFieldDefinitions(
      [...definitions].sort(
        (a, b) => a.order - b.order,
      ),
    );
  } catch {
    if (mounted) {
      setCustomFieldDefinitions([]);
    }
  }
};

loadCustomFieldDefinitions();

return () => {
  mounted = false;
};


}, [open, student]);

const customFieldMap = useMemo(
() =>
new Map(
customFieldDefinitions.map(
(field) => [field.id, field],
),
),
[customFieldDefinitions],
);

if (!open || !student) {
return null;
}

const initials = student.name
.trim()
.split(/\s+/)
.slice(0, 2)
.map((word) => word.charAt(0))
.join("");

const groupName = student.groupId
? groupNames[student.groupId] ?? "غير محددة"
: "غير محددة";

const statusLabel =
statusLabels[student.status] ?? "غير محدد";

const paymentPercentage =
student.financial.totalRequired > 0
? Math.min(
100,
Math.round(
(student.financial.paid /
student.financial.totalRequired) *
100,
),
)
: 100;

const customFields: StudentCustomFieldValue[] =
student.customFields ?? [];

const handleWhatsApp = () => {
const phone = student.guardianPhone
.replace(/\D/g, "");


if (!phone) {
  return;
}

window.open(
  `https://wa.me/${phone}`,
  "_blank",
  "noopener,noreferrer",
);


};

return (
<div
className="fixed inset-0 z-[90] flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-[2px]"
onMouseDown={(event) => {
if (event.target === event.currentTarget) {
onClose();
}
}}
> <div
     role="dialog"
     aria-modal="true"
     aria-labelledby="student-details-title"
     className="flex max-h-[92vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl"
   > <div className="flex shrink-0 items-start justify-between border-b border-slate-100 px-5 py-5 sm:px-6"> <div className="flex min-w-0 items-center gap-3"> <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-teal-50 text-sm font-bold text-teal-700">
{initials || <FiUser size={19} />} </div>


        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h2
              id="student-details-title"
              className="truncate text-base font-bold text-slate-900"
            >
              {student.name}
            </h2>

            <span
              className={`rounded-full px-2.5 py-1 text-[10px] font-semibold ${
                student.status === "active"
                  ? "bg-emerald-50 text-emerald-700"
                  : student.status === "suspended"
                    ? "bg-amber-50 text-amber-700"
                    : "bg-slate-100 text-slate-600"
              }`}
            >
              {statusLabel}
            </span>
          </div>

          <p className="mt-1 text-xs text-slate-400">
            رقم الطالب: {student.studentId}
          </p>
        </div>
      </div>

      <button
        type="button"
        onClick={onClose}
        aria-label="إغلاق"
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
      >
        <FiX size={19} />
      </button>
    </div>

    <div className="flex-1 overflow-y-auto px-5 py-5 sm:px-6">
      <section className="grid gap-3 sm:grid-cols-3">
        <InfoCard
          icon={<FiCalendar size={16} />}
          label="المرحلة"
          value={student.grade || "غير محددة"}
        />

        <InfoCard
          icon={<FiClock size={16} />}
          label="المجموعة"
          value={groupName}
        />

        <InfoCard
          icon={<FiCheckCircle size={16} />}
          label="الحالة"
          value={statusLabel}
        />
      </section>

      <section className="mt-6">
        <SectionTitle
          title="بيانات الطالب"
          description="المعلومات الأساسية وبيانات التواصل"
        />

        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <DetailItem
            label="رقم الهاتف"
            value={student.phone || "غير مسجل"}
            icon={<FiPhone size={15} />}
            direction="ltr"
          />

          <DetailItem
            label="اسم ولي الأمر"
            value={
              student.guardianName ||
              "غير مسجل"
            }
            icon={<FiUser size={15} />}
          />

          <DetailItem
            label="هاتف ولي الأمر"
            value={
              student.guardianPhone ||
              "غير مسجل"
            }
            icon={<FiPhone size={15} />}
            direction="ltr"
          />

          <DetailItem
            label="العنوان"
            value={
              student.address ||
              "غير مسجل"
            }
            icon={<FiUser size={15} />}
          />
        </div>
      </section>

      <section className="mt-6 border-t border-slate-100 pt-6">
        <SectionTitle
          title="الحالة المالية"
          description="ملخص المستحقات والمدفوعات الحالية"
        />

        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          <FinancialItem
            label="إجمالي المطلوب"
            value={
              student.financial.totalRequired
            }
          />

          <FinancialItem
            label="المدفوع"
            value={student.financial.paid}
            positive
          />

          <FinancialItem
            label="المتبقي"
            value={
              student.financial.remaining
            }
            warning={
              student.financial.remaining > 0
            }
          />
        </div>

        <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-4">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-400">
              نسبة السداد
            </span>

            <span className="font-semibold text-slate-600">
              {paymentPercentage}%
            </span>
          </div>

          <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-200">
            <div
              className="h-full rounded-full bg-teal-500 transition-all"
              style={{
                width: `${paymentPercentage}%`,
              }}
            />
          </div>
        </div>
      </section>

      {customFields.length > 0 && (
        <section className="mt-6 border-t border-slate-100 pt-6">
          <SectionTitle
            title="بيانات إضافية"
            description="الحقول المخصصة المسجلة للطالب"
          />

          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {customFields.map((field) => {
              const definition =
                customFieldMap.get(
                  field.fieldId,
                );

              return (
                <DetailItem
                  key={field.fieldId}
                  label={
                    definition?.label ??
                    field.fieldId
                  }
                  value={formatCustomFieldValue(
                    field.value,
                    definition,
                  )}
                />
              );
            })}
          </div>
        </section>
      )}

      <section className="mt-6 border-t border-slate-100 pt-6">
        <SectionTitle
          title="الملاحظات"
          description="ملاحظات إضافية عن الطالب"
        />

        <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-4">
          {student.notes ? (
            <p className="whitespace-pre-wrap text-sm leading-6 text-slate-600">
              {student.notes}
            </p>
          ) : (
            <p className="text-sm text-slate-400">
              لا توجد ملاحظات مسجلة لهذا الطالب.
            </p>
          )}
        </div>
      </section>

      <section className="mt-6 border-t border-slate-100 pt-6">
        <SectionTitle
          title="النشاط الأخير"
          description="ملخص سريع لآخر أنشطة الطالب"
        />

        <div className="mt-4 space-y-3">
          <ActivityItem
            icon={
              <FiCheckCircle size={15} />
            }
            title="تم تسجيل حضور الطالب"
            date="اليوم"
          />

          <ActivityItem
            icon={
              <FiCalendar size={15} />
            }
            title="تم تسجيل الطالب في المجموعة"
            date="منذ 3 أيام"
          />

          <ActivityItem
            icon={<FiUser size={15} />}
            title="تم إنشاء ملف الطالب"
            date="منذ أسبوع"
          />
        </div>
      </section>
    </div>

    <div className="flex shrink-0 flex-col gap-2 border-t border-slate-100 bg-slate-50/70 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
      <button
        type="button"
        onClick={handleWhatsApp}
        disabled={!student.guardianPhone}
        className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 text-sm font-medium text-slate-600 transition hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700 disabled:cursor-not-allowed disabled:opacity-40"
      >
        <FiMessageCircle size={16} />
        مراسلة ولي الأمر
      </button>

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onClose}
          className="h-10 rounded-lg border border-slate-200 bg-white px-4 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
        >
          إغلاق
        </button>

        <button
          type="button"
          onClick={() => onEdit(student)}
          className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-teal-600 px-5 text-sm font-semibold text-white transition hover:bg-teal-700 active:scale-[0.98]"
        >
          <FiEdit2 size={15} />
          تعديل البيانات
        </button>
      </div>
    </div>
  </div>
</div>


);
}

function formatCustomFieldValue(
value: StudentCustomFieldValue["value"],
definition?: StudentCustomFieldDefinition,
): string {
if (
value === null ||
value === undefined ||
value === ""
) {
return "غير مسجل";
}

if (
definition?.type === "boolean" ||
typeof value === "boolean"
) {
return value ? "نعم" : "لا";
}

if (
definition?.type === "select" &&
definition.options
) {
return (
definition.options.find(
(option) =>
option === String(value),
) ?? String(value)
);
}

if (definition?.type === "date") {
const date = new Date(String(value));


if (!Number.isNaN(date.getTime())) {
  return new Intl.DateTimeFormat(
    "ar-EG",
    {
      year: "numeric",
      month: "short",
      day: "numeric",
    },
  ).format(date);
}


}

return String(value);
}

function SectionTitle({
title,
description,
}: {
title: string;
description: string;
}) {
return ( <div> <h3 className="text-sm font-bold text-slate-800">
{title} </h3>


  <p className="mt-1 text-xs text-slate-400">
    {description}
  </p>
</div>


);
}

function InfoCard({
icon,
label,
value,
}: {
icon: React.ReactNode;
label: string;
value: string;
}) {
return ( <div className="rounded-xl border border-slate-200 bg-slate-50 p-4"> <div className="flex items-center gap-2 text-slate-400">
{icon}


    <span className="text-[11px] font-medium">
      {label}
    </span>
  </div>

  <p className="mt-2 text-sm font-semibold text-slate-700">
    {value}
  </p>
</div>


);
}

function DetailItem({
icon,
label,
value,
direction = "rtl",
}: {
icon?: React.ReactNode;
label: string;
value: string;
direction?: "rtl" | "ltr";
}) {
return ( <div className="rounded-xl border border-slate-200 bg-white p-4"> <div className="flex items-center gap-2 text-slate-400">
{icon}


    <span className="text-[11px] font-medium">
      {label}
    </span>
  </div>

  <p
    dir={direction}
    className={`mt-2 text-sm font-semibold text-slate-700 ${
      direction === "ltr"
        ? "text-right"
        : ""
    }`}
  >
    {value}
  </p>
</div>


);
}

function FinancialItem({
label,
value,
positive = false,
warning = false,
}: {
label: string;
value: number;
positive?: boolean;
warning?: boolean;
}) {
return ( <div className="rounded-xl border border-slate-200 bg-white p-4"> <p className="text-xs text-slate-400">
{label} </p>


  <p
    className={`mt-2 text-lg font-bold ${
      warning
        ? "text-amber-600"
        : positive
          ? "text-emerald-600"
          : "text-slate-800"
    }`}
  >
    {value.toLocaleString("ar-EG")} ج.م
  </p>
</div>


);
}

function ActivityItem({
icon,
title,
date,
}: {
icon: React.ReactNode;
title: string;
date: string;
}) {
return ( <div className="flex items-center gap-3 rounded-xl border border-slate-100 bg-slate-50/70 p-3"> <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white text-teal-600 shadow-sm">
{icon} </div>


  <div className="min-w-0 flex-1">
    <p className="truncate text-xs font-semibold text-slate-700">
      {title}
    </p>

    <p className="mt-0.5 text-[11px] text-slate-400">
      {date}
    </p>
  </div>
</div>


);
}
