"use client";

import {
  FormEvent,
  useEffect,
  useState,
} from "react";

import {
  FiChevronDown,
  FiPlus,
  FiSave,
  FiTrash2,
  FiUserPlus,
  FiX,
} from "react-icons/fi";

import type {
  Student,
  StudentCustomFieldDefinition,
  StudentCustomFieldValue,
  StudentStatus,
} from "@/types";

import { studentService } from "@/services";

export type StudentFormData = {
  studentId: string;
  name: string;
  phone: string;
  guardianName: string;
  guardianPhone: string;
  grade: string;
  groupId: string;
  address: string;
  status: StudentStatus;
  notes: string;
  customFields: StudentCustomFieldValue[];
};

type StudentModalProps = {
  open: boolean;
  onClose: () => void;
  onSubmit: (student: StudentFormData) => void;
  initialData?: Student | null;
  mode?: "add" | "edit";
};

const emptyForm: StudentFormData = {
  studentId: "",
  name: "",
  phone: "",
  guardianName: "",
  guardianPhone: "",
  grade: "",
  groupId: "",
  address: "",
  status: "active",
  notes: "",
  customFields: [],
};

const groups = [
  {
    id: "group-001",
    name: "مجموعة أ",
  },
  {
    id: "group-002",
    name: "مجموعة ب",
  },
  {
    id: "group-003",
    name: "مجموعة ج",
  },
];

const grades = [
  "أولى إعدادي",
  "ثانية إعدادي",
  "ثالثة إعدادي",
  "أولى ثانوي",
  "ثانية ثانوي",
  "ثالثة ثانوي",
];

export default function StudentModal({
  open,
  onClose,
  onSubmit,
  initialData = null,
  mode = "add",
}: StudentModalProps) {
  const [form, setForm] =
    useState<StudentFormData>(emptyForm);

  const [errors, setErrors] =
    useState<
      Partial<
        Record<keyof StudentFormData, string>
      >
    >({});

  const [customFieldDefinitions, setCustomFieldDefinitions] =
    useState<StudentCustomFieldDefinition[]>([]);

  const [customFieldsLoading, setCustomFieldsLoading] =
    useState(false);

  const [showAddCustomField, setShowAddCustomField] =
    useState(false);

  const [newCustomField, setNewCustomField] =
    useState<{
      label: string;
      type: StudentCustomFieldDefinition["type"];
      required: boolean;
      options: string;
    }>({
      label: "",
      type: "text",
      required: false,
      options: "",
    });

  useEffect(() => {
    if (!open) {
      return;
    }

    let mounted = true;

    const loadCustomFields = async () => {
      try {
        setCustomFieldsLoading(true);

        const definitions =
          await studentService.customFields();

        if (mounted) {
          setCustomFieldDefinitions(
            [...definitions].sort(
              (a, b) => a.order - b.order,
            ),
          );
        }
      } finally {
        if (mounted) {
          setCustomFieldsLoading(false);
        }
      }
    };

    loadCustomFields();

    return () => {
      mounted = false;
    };
  }, [open]);

  useEffect(() => {
    if (!open) {
      return;
    }

    if (initialData) {
      setForm({
        studentId: initialData.studentId,
        name: initialData.name,
        phone: initialData.phone ?? "",
        guardianName: initialData.guardianName,
        guardianPhone: initialData.guardianPhone,
        grade: initialData.grade,
        groupId: initialData.groupId ?? "",
        address: initialData.address ?? "",
        status: initialData.status,
        notes: initialData.notes ?? "",
        customFields:
          initialData.customFields ?? [],
      });
    } else {
      setForm(emptyForm);
    }

    setErrors({});
    setShowAddCustomField(false);

    setNewCustomField({
      label: "",
      type: "text",
      required: false,
      options: "",
    });
  }, [open, initialData]);

  if (!open) {
    return null;
  }

  const isEdit = mode === "edit";

  const updateField = <
    K extends keyof StudentFormData,
  >(
    field: K,
    value: StudentFormData[K],
  ) => {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));

    setErrors((current) => ({
      ...current,
      [field]: undefined,
    }));
  };

  const getCustomFieldValue = (
    fieldId: string,
  ) => {
    return (
      form.customFields.find(
        (field) => field.fieldId === fieldId,
      )?.value ?? null
    );
  };

  const updateCustomFieldValue = (
    fieldId: string,
    value: string | number | boolean | null,
  ) => {
    setForm((current) => {
      const existingIndex =
        current.customFields.findIndex(
          (field) =>
            field.fieldId === fieldId,
        );

      if (existingIndex === -1) {
        return {
          ...current,
          customFields: [
            ...current.customFields,
            {
              fieldId,
              value,
            },
          ],
        };
      }

      const nextCustomFields = [
        ...current.customFields,
      ];

      nextCustomFields[existingIndex] = {
        ...nextCustomFields[existingIndex],
        value,
      };

      return {
        ...current,
        customFields: nextCustomFields,
      };
    });
  };

  const addCustomFieldDefinition = () => {
    const label =
      newCustomField.label.trim();

    if (!label) {
      return;
    }

    const id = `custom-${Date.now()}`;

    const options =
      newCustomField.type === "select"
        ? newCustomField.options
            .split(",")
            .map((option) => option.trim())
            .filter(Boolean)
        : undefined;

    const definition: StudentCustomFieldDefinition = {
      id,
      label,
      type: newCustomField.type,
      required: newCustomField.required,
      options,
      active: true,
      order:
        customFieldDefinitions.length + 1,
    };

    setCustomFieldDefinitions(
      (current) => [
        ...current,
        definition,
      ],
    );

    setForm((current) => ({
      ...current,
      customFields: [
        ...current.customFields,
        {
          fieldId: id,
          value:
            definition.type === "boolean"
              ? false
              : null,
        },
      ],
    }));

    setNewCustomField({
      label: "",
      type: "text",
      required: false,
      options: "",
    });

    setShowAddCustomField(false);
  };

  const removeCustomFieldDefinition = (
    fieldId: string,
  ) => {
    setCustomFieldDefinitions(
      (current) =>
        current.filter(
          (field) =>
            field.id !== fieldId,
        ),
    );

    setForm((current) => ({
      ...current,
      customFields:
        current.customFields.filter(
          (field) =>
            field.fieldId !== fieldId,
        ),
    }));
  };

  const validate = () => {
    const nextErrors: typeof errors = {};

    if (!form.studentId.trim()) {
      nextErrors.studentId =
        "رقم الطالب مطلوب";
    }

    if (!form.name.trim()) {
      nextErrors.name =
        "اسم الطالب مطلوب";
    }

    if (!form.phone.trim()) {
      nextErrors.phone =
        "رقم الهاتف مطلوب";
    } else if (
      !/^[0-9+\s-]{8,15}$/.test(
        form.phone.trim(),
      )
    ) {
      nextErrors.phone =
        "رقم الهاتف غير صحيح";
    }

    if (!form.guardianName.trim()) {
      nextErrors.guardianName =
        "اسم ولي الأمر مطلوب";
    }

    if (!form.guardianPhone.trim()) {
      nextErrors.guardianPhone =
        "رقم ولي الأمر مطلوب";
    }

    if (!form.grade) {
      nextErrors.grade =
        "اختر المرحلة الدراسية";
    }

    if (!form.groupId) {
      nextErrors.groupId =
        "اختر المجموعة";
    }

    customFieldDefinitions
      .filter(
        (field) =>
          field.active &&
          field.required,
      )
      .forEach((field) => {
        const value =
          getCustomFieldValue(field.id);

        const isEmpty =
          value === null ||
          value === undefined ||
          value === "" ||
          (typeof value === "string" &&
            !value.trim());

        if (isEmpty) {
          nextErrors.customFields =
            "يرجى إدخال جميع الحقول المطلوبة";
        }
      });

    setErrors(nextErrors);

    return (
      Object.keys(nextErrors).length === 0
    );
  };

  const handleSubmit = (
    event: FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    if (!validate()) {
      return;
    }

    onSubmit({
      ...form,
      studentId:
        form.studentId.trim(),
      name: form.name.trim(),
      phone: form.phone.trim(),
      guardianName:
        form.guardianName.trim(),
      guardianPhone:
        form.guardianPhone.trim(),
      address:
        form.address.trim(),
      notes: form.notes.trim(),
      customFields:
        form.customFields,
    });
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-[2px]"
      onMouseDown={(event) => {
        if (
          event.target ===
          event.currentTarget
        ) {
          onClose();
        }
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="student-modal-title"
        className="flex max-h-[92vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl"
      >
        <div className="flex shrink-0 items-center justify-between border-b border-slate-100 px-5 py-4 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-50 text-teal-600">
              {isEdit ? (
                <FiSave size={18} />
              ) : (
                <FiUserPlus size={18} />
              )}
            </div>

            <div>
              <h2
                id="student-modal-title"
                className="text-base font-bold text-slate-900"
              >
                {isEdit
                  ? "تعديل بيانات الطالب"
                  : "إضافة طالب جديد"}
              </h2>

              <p className="mt-0.5 text-xs text-slate-400">
                {isEdit
                  ? "قم بتحديث بيانات الطالب ثم احفظ التغييرات."
                  : "أدخل البيانات الأساسية للطالب وولي الأمر."}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="إغلاق"
            className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
          >
            <FiX size={19} />
          </button>
        </div>

        <form
          onSubmit={handleSubmit}
          className="flex min-h-0 flex-1 flex-col"
        >
          <div className="flex-1 overflow-y-auto px-5 py-5 sm:px-6">
            <section>
              <div className="mb-4">
                <h3 className="text-sm font-bold text-slate-800">
                  بيانات الطالب
                </h3>

                <p className="mt-1 text-xs text-slate-400">
                  المعلومات الأساسية للطالب
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <Field
                  label="رقم الطالب"
                  required
                  error={errors.studentId}
                >
                  <input
                    dir="ltr"
                    value={form.studentId}
                    onChange={(event) =>
                      updateField(
                        "studentId",
                        event.target.value,
                      )
                    }
                    placeholder="مثال: ST-1007"
                    className={`${inputClass(
                      Boolean(
                        errors.studentId,
                      ),
                    )} text-left`}
                  />
                </Field>

                <Field
                  label="اسم الطالب"
                  required
                  error={errors.name}
                >
                  <input
                    value={form.name}
                    onChange={(event) =>
                      updateField(
                        "name",
                        event.target.value,
                      )
                    }
                    placeholder="مثال: أحمد محمد علي"
                    className={inputClass(
                      Boolean(errors.name),
                    )}
                  />
                </Field>

                <Field
                  label="رقم الهاتف"
                  required
                  error={errors.phone}
                >
                  <input
                    dir="ltr"
                    value={form.phone}
                    onChange={(event) =>
                      updateField(
                        "phone",
                        event.target.value,
                      )
                    }
                    placeholder="01012345678"
                    className={`${inputClass(
                      Boolean(errors.phone),
                    )} text-left`}
                  />
                </Field>

                <Field
                  label="المرحلة الدراسية"
                  required
                  error={errors.grade}
                >
                  <SelectField
                    value={form.grade}
                    onChange={(value) =>
                      updateField(
                        "grade",
                        value,
                      )
                    }
                    placeholder="اختر المرحلة"
                    error={Boolean(
                      errors.grade,
                    )}
                    options={grades}
                  />
                </Field>

                <Field
                  label="المجموعة"
                  required
                  error={errors.groupId}
                >
                  <SelectField
                    value={form.groupId}
                    onChange={(value) =>
                      updateField(
                        "groupId",
                        value,
                      )
                    }
                    placeholder="اختر المجموعة"
                    error={Boolean(
                      errors.groupId,
                    )}
                    options={groups.map(
                      (group) =>
                        `${group.id}|||${group.name}`,
                    )}
                    renderOption={(option) => {
                      const [, name] =
                        option.split(
                          "|||",
                        );

                      return name;
                    }}
                  />
                </Field>

                <Field label="الحالة">
                  <SelectField
                    value={form.status}
                    onChange={(value) =>
                      updateField(
                        "status",
                        value as StudentStatus,
                      )
                    }
                    options={[
                      "active",
                      "inactive",
                      "suspended",
                    ]}
                    renderOption={(option) => {
                      if (
                        option ===
                        "active"
                      ) {
                        return "نشط";
                      }

                      if (
                        option ===
                        "inactive"
                      ) {
                        return "غير نشط";
                      }

                      return "متوقف";
                    }}
                  />
                </Field>

                <Field label="العنوان">
                  <input
                    value={form.address}
                    onChange={(event) =>
                      updateField(
                        "address",
                        event.target.value,
                      )
                    }
                    placeholder="مثال: طنطا"
                    className={inputClass(
                      false,
                    )}
                  />
                </Field>
              </div>
            </section>

            <section className="mt-7 border-t border-slate-100 pt-6">
              <div className="mb-4">
                <h3 className="text-sm font-bold text-slate-800">
                  بيانات ولي الأمر
                </h3>

                <p className="mt-1 text-xs text-slate-400">
                  بيانات التواصل مع ولي الأمر
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <Field
                  label="اسم ولي الأمر"
                  required
                  error={
                    errors.guardianName
                  }
                >
                  <input
                    value={
                      form.guardianName
                    }
                    onChange={(event) =>
                      updateField(
                        "guardianName",
                        event.target.value,
                      )
                    }
                    placeholder="مثال: محمد علي"
                    className={inputClass(
                      Boolean(
                        errors.guardianName,
                      ),
                    )}
                  />
                </Field>

                <Field
                  label="رقم هاتف ولي الأمر"
                  required
                  error={
                    errors.guardianPhone
                  }
                >
                  <input
                    dir="ltr"
                    value={
                      form.guardianPhone
                    }
                    onChange={(event) =>
                      updateField(
                        "guardianPhone",
                        event.target.value,
                      )
                    }
                    placeholder="01011112222"
                    className={`${inputClass(
                      Boolean(
                        errors.guardianPhone,
                      ),
                    )} text-left`}
                  />
                </Field>
              </div>
            </section>

            <section className="mt-7 border-t border-slate-100 pt-6">
              <div className="mb-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-sm font-bold text-slate-800">
                      بيانات إضافية
                    </h3>

                    <p className="mt-1 text-xs text-slate-400">
                      حقول مخصصة يمكن إضافتها حسب احتياج السنتر.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      setShowAddCustomField(
                        (current) =>
                          !current,
                      )
                    }
                    className="inline-flex h-9 shrink-0 items-center gap-1.5 rounded-lg border border-teal-200 bg-teal-50 px-3 text-xs font-semibold text-teal-700 transition hover:border-teal-300 hover:bg-teal-100"
                  >
                    <FiPlus size={14} />
                    إضافة خانة جديدة
                  </button>
                </div>
              </div>

              {showAddCustomField && (
                <div className="mb-5 rounded-xl border border-teal-100 bg-teal-50/40 p-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Field label="اسم الخانة" required>
                      <input
                        value={
                          newCustomField.label
                        }
                        onChange={(event) =>
                          setNewCustomField(
                            (current) => ({
                              ...current,
                              label:
                                event.target
                                  .value,
                            }),
                          )
                        }
                        placeholder="مثال: المدرسة"
                        className={inputClass(
                          false,
                        )}
                      />
                    </Field>

                    <Field label="نوع الخانة">
                      <SelectField
                        value={
                          newCustomField.type
                        }
                        onChange={(value) =>
                          setNewCustomField(
                            (current) => ({
                              ...current,
                              type: value as StudentCustomFieldDefinition["type"],
                            }),
                          )
                        }
                        options={[
                          "text",
                          "number",
                          "date",
                          "select",
                          "textarea",
                          "boolean",
                        ]}
                        renderOption={(
                          option,
                        ) => {
                          const labels: Record<
                            string,
                            string
                          > = {
                            text: "نص",
                            number:
                              "رقم",
                            date: "تاريخ",
                            select:
                              "اختيار",
                            textarea:
                              "نص طويل",
                            boolean:
                              "نعم / لا",
                          };

                          return (
                            labels[
                              option
                            ] ??
                            option
                          );
                        }}
                      />
                    </Field>
                  </div>

                  {newCustomField.type ===
                    "select" && (
                    <div className="mt-4">
                      <Field label="الاختيارات">
                        <input
                          value={
                            newCustomField.options
                          }
                          onChange={(event) =>
                            setNewCustomField(
                              (current) => ({
                                ...current,
                                options:
                                  event
                                    .target
                                    .value,
                              }),
                            )
                          }
                          placeholder="مثال: ممتاز, جيد جدًا, جيد"
                          className={inputClass(
                            false,
                          )}
                        />

                        <p className="mt-1.5 text-[11px] text-slate-400">
                          افصل بين كل اختيار والآخر بفاصلة.
                        </p>
                      </Field>
                    </div>
                  )}

                  <div className="mt-4 flex items-center justify-end gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        setShowAddCustomField(
                          false,
                        )
                      }
                      className="h-9 rounded-lg border border-slate-200 bg-white px-3 text-xs font-medium text-slate-600 transition hover:bg-slate-50"
                    >
                      إلغاء
                    </button>

                    <button
                      type="button"
                      onClick={
                        addCustomFieldDefinition
                      }
                      disabled={
                        !newCustomField.label.trim()
                      }
                      className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-teal-600 px-3 text-xs font-semibold text-white transition hover:bg-teal-700 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <FiPlus size={13} />
                      إضافة الخانة
                    </button>
                  </div>
                </div>
              )}

              {errors.customFields && (
                <p className="mb-4 rounded-lg border border-red-100 bg-red-50 px-3 py-2 text-xs font-medium text-red-600">
                  {errors.customFields}
                </p>
              )}

              {customFieldsLoading ? (
                <div className="rounded-xl border border-slate-100 bg-slate-50 px-4 py-5 text-center text-xs text-slate-400">
                  جاري تحميل الحقول الإضافية...
                </div>
              ) : customFieldDefinitions.filter(
                  (field) => field.active,
                ).length === 0 ? (
                <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-5 text-center text-xs text-slate-400">
                  لا توجد حقول إضافية حاليًا.
                  يمكنك إضافة خانة جديدة.
                </div>
              ) : (
                <div className="grid gap-4 sm:grid-cols-2">
                  {customFieldDefinitions
                    .filter(
                      (field) =>
                        field.active,
                    )
                    .sort(
                      (a, b) =>
                        a.order -
                        b.order,
                    )
                    .map((field) => (
                      <CustomFieldInput
                        key={field.id}
                        field={field}
                        value={getCustomFieldValue(
                          field.id,
                        )}
                        onChange={(value) =>
                          updateCustomFieldValue(
                            field.id,
                            value,
                          )
                        }
                        onRemove={() =>
                          removeCustomFieldDefinition(
                            field.id,
                          )
                        }
                      />
                    ))}
                </div>
              )}
            </section>

            <section className="mt-7 border-t border-slate-100 pt-6">
              <div className="mb-4">
                <h3 className="text-sm font-bold text-slate-800">
                  ملاحظات
                </h3>

                <p className="mt-1 text-xs text-slate-400">
                  معلومات إضافية اختيارية
                </p>
              </div>

              <textarea
                value={form.notes}
                onChange={(event) =>
                  updateField(
                    "notes",
                    event.target.value,
                  )
                }
                placeholder="اكتب أي ملاحظات مهمة عن الطالب..."
                rows={4}
                className="w-full resize-none rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-teal-500 focus:bg-white focus:ring-4 focus:ring-teal-500/10"
              />
            </section>
          </div>

          <div className="flex shrink-0 items-center justify-end gap-2 border-t border-slate-100 bg-slate-50/70 px-5 py-4 sm:px-6">
            <button
              type="button"
              onClick={onClose}
              className="h-10 rounded-lg border border-slate-200 bg-white px-4 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
            >
              إلغاء
            </button>

            <button
              type="submit"
              className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-teal-600 px-5 text-sm font-semibold text-white transition hover:bg-teal-700 active:scale-[0.98]"
            >
              {isEdit ? (
                <FiSave size={15} />
              ) : (
                <FiUserPlus size={15} />
              )}

              {isEdit
                ? "حفظ التعديلات"
                : "إضافة الطالب"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function CustomFieldInput({
  field,
  value,
  onChange,
  onRemove,
}: {
  field: StudentCustomFieldDefinition;
  value: string | number | boolean | null;
  onChange: (
    value:
      | string
      | number
      | boolean
      | null,
  ) => void;
  onRemove: () => void;
}) {
  const error = false;

  if (field.type === "boolean") {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-3">
        <div className="flex items-center justify-between gap-3">
          <label className="flex items-center gap-2 text-xs font-semibold text-slate-600">
            <input
              type="checkbox"
              checked={value === true}
              onChange={(event) =>
                onChange(
                  event.target.checked,
                )
              }
              className="h-4 w-4 rounded border-slate-300 text-teal-600 focus:ring-teal-500"
            />

            {field.label}

            {field.required && (
              <span className="text-red-500">
                *
              </span>
            )}
          </label>

          <button
            type="button"
            onClick={onRemove}
            aria-label={`حذف ${field.label}`}
            className="flex h-7 w-7 items-center justify-center rounded-md text-slate-300 transition hover:bg-red-50 hover:text-red-500"
          >
            <FiTrash2 size={13} />
          </button>
        </div>
      </div>
    );
  }

  return (
    <Field
      label={field.label}
      required={field.required}
    >
      <div className="relative">
        {field.type === "select" ? (
          <SelectField
            value={
              value === null ||
              value === undefined
                ? ""
                : String(value)
            }
            onChange={(nextValue) =>
              onChange(
                nextValue || null,
              )
            }
            placeholder="اختر..."
            options={
              field.options ?? []
            }
            error={error}
          />
        ) : field.type ===
          "textarea" ? (
          <textarea
            value={
              value === null ||
              value === undefined
                ? ""
                : String(value)
            }
            onChange={(event) =>
              onChange(
                event.target.value,
              )
            }
            rows={3}
            className="w-full resize-none rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-teal-500 focus:bg-white focus:ring-4 focus:ring-teal-500/10"
          />
        ) : (
          <input
            type={
              field.type ===
              "number"
                ? "number"
                : field.type ===
                    "date"
                  ? "date"
                  : "text"
            }
            value={
              value === null ||
              value === undefined
                ? ""
                : String(value)
            }
            onChange={(event) => {
              if (
                field.type ===
                "number"
              ) {
                const raw =
                  event.target.value;

                onChange(
                  raw === ""
                    ? null
                    : Number(raw),
                );

                return;
              }

              onChange(
                event.target.value,
              );
            }}
            className={inputClass(
              error,
            )}
          />
        )}

        <button
          type="button"
          onClick={onRemove}
          aria-label={`حذف ${field.label}`}
          className="absolute left-2 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-md text-slate-300 transition hover:bg-red-50 hover:text-red-500"
        >
          <FiTrash2 size={13} />
        </button>
      </div>
    </Field>
  );
}

function Field({
  label,
  required = false,
  error,
  children,
}: {
  label: string;
  required?: boolean;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-semibold text-slate-600">
        {label}

        {required && (
          <span className="mr-1 text-red-500">
            *
          </span>
        )}
      </label>

      {children}

      {error && (
        <p className="mt-1.5 text-[11px] font-medium text-red-500">
          {error}
        </p>
      )}
    </div>
  );
}

function SelectField({
  value,
  onChange,
  options,
  placeholder,
  error = false,
  renderOption,
}: {
  value: string;
  onChange: (value: string) => void;
  options: string[];
  placeholder?: string;
  error?: boolean;
  renderOption?: (
    option: string,
  ) => string;
}) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(event) =>
          onChange(event.target.value)
        }
        className={`${inputClass(
          error,
        )} appearance-none pl-9`}
      >
        {placeholder && (
          <option
            value=""
            disabled
          >
            {placeholder}
          </option>
        )}

        {options.map((option) => {
          const optionValue =
            option.includes("|||")
              ? option.split(
                  "|||",
                )[0]
              : option;

          const optionLabel =
            renderOption?.(option) ??
            option;

          return (
            <option
              key={option}
              value={optionValue}
            >
              {optionLabel}
            </option>
          );
        })}
      </select>

      <FiChevronDown
        size={15}
        className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
      />
    </div>
  );
}

function inputClass(error: boolean) {
  return `h-10 w-full rounded-lg border bg-slate-50 px-3 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 ${
    error
      ? "border-red-300 focus:border-red-400 focus:ring-4 focus:ring-red-500/10"
      : "border-slate-200 hover:border-slate-300 focus:border-teal-500 focus:bg-white focus:ring-4 focus:ring-teal-500/10"
  }`;
}