
"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type PointerEvent,
} from "react";

import {
  FiAlignCenter,
  FiAlignLeft,
  FiAlignRight,
  FiBold,
  FiCheck,
  FiChevronLeft,
  FiEye,
  FiEyeOff,
  FiItalic,
  FiMove,
  FiRefreshCw,
  FiSave,
  FiTrash2,
  FiUnderline,
  FiX,
} from "react-icons/fi";

import { generateQRCode } from "@/lib/qr";

import { studentCardDesignerService } from "@/services/studentCardDesignerService";
import { studentCardService } from "@/services/studentCardService";
import { studentCardTemplateService } from "@/services/studentCardTemplateService";

import type { Student } from "@/types";
import type { StudentCard } from "@/types/studentCard";
import type {
  StudentCardDesign,
  StudentCardElement,
  StudentCardElementType,
  StudentCardFontWeight,
  StudentCardTextAlign,
} from "@/types/studentCardDesigner";
import type { StudentCardTemplate } from "@/types/studentCardTemplate";

type StudentCardDesignerProps = {
  student: Student;
  groupName: string;
  teacherName: string;
  studentCard: StudentCard;
  initialDesign: StudentCardDesign;
  parentQrCodeUrl: string | null;
};

type InteractionMode =
  | "drag"
  | "resize";

type InteractionState = {
  elementId: string;
  mode: InteractionMode;
  startPointerX: number;
  startPointerY: number;
  startX: number;
  startY: number;
  startWidth: number;
  startHeight: number;
};

const MIN_ELEMENT_WIDTH = 50;
const MIN_ELEMENT_HEIGHT = 36;

const elementLabels: Record<
  StudentCardElementType,
  string
> = {
  logo: "الشعار",
  student: "الطالب",
  teacher: "المدرس",
  group: "المجموعة",
  grade: "المرحلة",
  qr: "Parent QR",
  attendance_code: "Attendance Code",
};

const elementDescriptions: Record<
  StudentCardElementType,
  string
> = {
  logo: "شعار المركز",
  student: "اسم الطالب ورقم الطالب",
  teacher: "اسم المدرس",
  group: "اسم المجموعة",
  grade: "المرحلة الدراسية",
  qr: "QR القادم من خدمة الكارت",
  attendance_code:
    "كود الحضور القادم من الخدمة",
};

const initialFallbackDesign = (
  studentId: string,
): StudentCardDesign => ({
  studentId,
  width: 860,
  height: 540,
  background: "#ffffff",
  elements: [],
  updatedAt: new Date().toISOString(),
});

const templatePreviewStyles: Record<
  string,
  {
    background: string;
    accent: string;
  }
> = {
  simple: {
    background: "#ffffff",
    accent: "#0f172a",
  },
  modern: {
    background: "#f8fafc",
    accent: "#0f766e",
  },
  minimal: {
    background: "#ffffff",
    accent: "#334155",
  },
  teacher: {
    background: "#f8fafc",
    accent: "#1e293b",
  },
  center_branding: {
    background: "#ffffff",
    accent: "#0f766e",
  },
};

export default function StudentCardDesigner({
  student,
  groupName,
  teacherName,
  studentCard: initialStudentCard,
  initialDesign,
  parentQrCodeUrl,
}: StudentCardDesignerProps) {
  const [design, setDesign] =
    useState<StudentCardDesign | null>(
      null,
    );

  const [studentCard, setStudentCard] =
    useState<StudentCard | null>(
      initialStudentCard,
    );

  const [qrCodeUrl, setQrCodeUrl] =
    useState<string | null>(
      parentQrCodeUrl,
    );

  const [
    selectedElementId,
    setSelectedElementId,
  ] = useState<string | null>(null);

  const [templates, setTemplates] =
    useState<StudentCardTemplate[]>(
      [],
    );

  const [
    selectedTemplateId,
    setSelectedTemplateId,
  ] = useState<string | null>(null);

  const [
    isTemplatesLoading,
    setIsTemplatesLoading,
  ] = useState(true);

  const [
    isApplyingTemplate,
    setIsApplyingTemplate,
  ] = useState(false);

  const [
    showTemplatePreview,
    setShowTemplatePreview,
  ] = useState(false);

  const [
    previewTemplate,
    setPreviewTemplate,
  ] = useState<StudentCardTemplate | null>(
    null,
  );

  const [
    showSaveTemplate,
    setShowSaveTemplate,
  ] = useState(false);

  const [
    newTemplateName,
    setNewTemplateName,
  ] = useState("");

  const [isSavingTemplate, setIsSavingTemplate] =
    useState(false);

  const [isLoading, setIsLoading] =
    useState(true);

  const [isSaving, setIsSaving] =
    useState(false);

  const [isResetting, setIsResetting] =
    useState(false);

  const [message, setMessage] =
    useState<string | null>(null);

  const [error, setError] =
    useState<string | null>(null);

  const canvasRef =
    useRef<HTMLDivElement | null>(null);

  const interactionRef =
    useRef<InteractionState | null>(
      null,
    );

  const selectedElement = useMemo(
    () =>
      design?.elements.find(
        (element) =>
          element.id ===
          selectedElementId,
      ) ?? null,
    [design, selectedElementId],
  );

  const loadTemplates =
    useCallback(async () => {
      setIsTemplatesLoading(true);

      try {
        const loadedTemplates =
          await studentCardTemplateService.list();

        setTemplates(loadedTemplates);

        if (
          loadedTemplates.length > 0
        ) {
          setSelectedTemplateId(
            loadedTemplates[0].id,
          );
        }
      } catch (templateError) {
        console.error(
          "Failed to load student card templates:",
          templateError,
        );

        setError(
          templateError instanceof Error
            ? templateError.message
            : "تعذر تحميل قوالب الكارت.",
        );
      } finally {
        setIsTemplatesLoading(false);
      }
    }, []);

  const loadDesignerData =
    useCallback(async () => {
      setIsLoading(true);
      setError(null);

      try {
        const [
          loadedDesign,
          loadedCard,
        ] = await Promise.all([
          studentCardDesignerService.getDesign(
            student.id,
          ),
          studentCardService.getStudentCard(
            student.id,
          ),
        ]);

        setDesign(
          loadedDesign ?? initialDesign,
        );

        setStudentCard(
          loadedCard ?? initialStudentCard,
        );

        setSelectedElementId(
          (
            loadedDesign ??
            initialDesign
          ).elements[0]?.id ??
            null,
        );
      } catch (loadError) {
        console.error(
          "Failed to load student card designer:",
          loadError,
        );

        setError(
          loadError instanceof Error
            ? loadError.message
            : "تعذر تحميل تصميم الكارت.",
        );

        setDesign(
          initialDesign ??
            initialFallbackDesign(
              student.id,
            ),
        );
      } finally {
        setIsLoading(false);
      }
    }, [
      initialDesign,
      initialStudentCard,
      student.id,
    ]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void loadDesignerData();
    }, 0);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [loadDesignerData]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void loadTemplates();
    }, 0);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [loadTemplates]);

  useEffect(() => {
    let cancelled = false;

    const generateQr = async () => {
      if (
        !studentCard?.parentQrValue
      ) {
        setQrCodeUrl(
          parentQrCodeUrl,
        );
        return;
      }

      try {
        const url =
          await generateQRCode(
            studentCard.parentQrValue,
            {
              width: 220,
              margin: 2,
              color: {
                dark: "#0f172a",
                light: "#ffffff",
              },
            },
          );

        if (!cancelled) {
          setQrCodeUrl(url);
        }
      } catch (qrError) {
        console.error(
          "Failed to generate designer QR:",
          qrError,
        );

        if (!cancelled) {
          setQrCodeUrl(
            parentQrCodeUrl,
          );
        }
      }
    };

    void generateQr();

    return () => {
      cancelled = true;
    };
  }, [
    parentQrCodeUrl,
    studentCard?.parentQrValue,
  ]);

  const updateElement = (
    elementId: string,
    updates: Partial<StudentCardElement>,
  ) => {
    setDesign((current) => {
      if (!current) {
        return current;
      }

      return {
        ...current,
        elements:
          current.elements.map(
            (element) =>
              element.id === elementId
                ? {
                    ...element,
                    ...updates,
                  }
                : element,
          ),
      };
    });
  };

  const handlePointerMove = (
    event: PointerEvent<HTMLDivElement>,
  ) => {
    const interaction =
      interactionRef.current;

    const canvas =
      canvasRef.current;

    if (
      !interaction ||
      !canvas
    ) {
      return;
    }

    const rect =
      canvas.getBoundingClientRect();

    const scaleX =
      design && design.width > 0
        ? rect.width /
          design.width
        : 1;

    const scaleY =
      design && design.height > 0
        ? rect.height /
          design.height
        : 1;

    const deltaX =
      (event.clientX -
        interaction.startPointerX) /
      scaleX;

    const deltaY =
      (event.clientY -
        interaction.startPointerY) /
      scaleY;

    if (
      interaction.mode ===
      "drag"
    ) {
      const nextX = Math.max(
        0,
        Math.min(
          (design?.width ?? 860) -
            interaction.startWidth,
          interaction.startX +
            deltaX,
        ),
      );

      const nextY = Math.max(
        0,
        Math.min(
          (design?.height ?? 540) -
            interaction.startHeight,
          interaction.startY +
            deltaY,
        ),
      );

      updateElement(
        interaction.elementId,
        {
          x: nextX,
          y: nextY,
        },
      );

      return;
    }

    const nextWidth = Math.max(
      MIN_ELEMENT_WIDTH,
      Math.min(
        (design?.width ?? 860) -
          interaction.startX,
        interaction.startWidth +
          deltaX,
      ),
    );

    const nextHeight = Math.max(
      MIN_ELEMENT_HEIGHT,
      Math.min(
        (design?.height ?? 540) -
          interaction.startY,
        interaction.startHeight +
          deltaY,
      ),
    );

    updateElement(
      interaction.elementId,
      {
        width: nextWidth,
        height: nextHeight,
      },
    );
  };

  const handlePointerUp = () => {
    interactionRef.current =
      null;
  };

  const startInteraction = (
    event: PointerEvent<HTMLDivElement>,
    element: StudentCardElement,
    mode: InteractionMode,
  ) => {
    event.preventDefault();
    event.stopPropagation();

    setSelectedElementId(
      element.id,
    );

    interactionRef.current = {
      elementId: element.id,
      mode,
      startPointerX:
        event.clientX,
      startPointerY:
        event.clientY,
      startX: element.x,
      startY: element.y,
      startWidth: element.width,
      startHeight:
        element.height,
    };

    event.currentTarget.setPointerCapture(
      event.pointerId,
    );
  };

  const handleSave = async () => {
    if (!design) {
      return;
    }

    setIsSaving(true);
    setError(null);
    setMessage(null);

    try {
      const savedDesign =
        await studentCardDesignerService.saveDesign(
          design,
        );

      setDesign(savedDesign);

      setMessage(
        "تم حفظ تصميم الكارت بنجاح.",
      );
    } catch (saveError) {
      console.error(
        "Failed to save student card design:",
        saveError,
      );

      setError(
        saveError instanceof Error
          ? saveError.message
          : "تعذر حفظ تصميم الكارت.",
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = async () => {
    const confirmed =
      window.confirm(
        "هل تريد استعادة التصميم الافتراضي؟ سيتم فقدان التعديلات الحالية غير المحفوظة.",
      );

    if (!confirmed) {
      return;
    }

    setIsResetting(true);
    setError(null);
    setMessage(null);

    try {
      const resetDesign =
        await studentCardDesignerService.resetDesign(
          student.id,
        );

      setDesign(resetDesign);

      setSelectedElementId(
        resetDesign.elements[0]?.id ??
          null,
      );

      setSelectedTemplateId(
        "simple",
      );

      setMessage(
        "تمت استعادة التصميم الافتراضي.",
      );
    } catch (resetError) {
      console.error(
        "Failed to reset student card design:",
        resetError,
      );

      setError(
        resetError instanceof Error
          ? resetError.message
          : "تعذر استعادة التصميم.",
      );
    } finally {
      setIsResetting(false);
    }
  };

  const handleElementVisibility = (
    element: StudentCardElement,
  ) => {
    updateElement(
      element.id,
      {
        visible:
          !element.visible,
      },
    );
  };

  const handleDeleteElement = (
    element: StudentCardElement,
  ) => {
    setDesign((current) => {
      if (!current) {
        return current;
      }

      return {
        ...current,
        elements:
          current.elements.filter(
            (item) =>
              item.id !== element.id,
          ),
      };
    });

    setSelectedElementId(
      null,
    );
  };

  const handleStyleChange = (
    key:
      | "fontSize"
      | "fontWeight"
      | "textAlign"
      | "italic"
      | "underline",
    value:
      | number
      | StudentCardFontWeight
      | StudentCardTextAlign
      | boolean,
  ) => {
    if (!selectedElement) {
      return;
    }

    updateElement(
      selectedElement.id,
      {
        [key]: value,
      },
    );
  };

  const applyTemplate = async (
    template: StudentCardTemplate,
  ) => {
    if (!design) {
      return;
    }

    setIsApplyingTemplate(
      true,
    );
    setError(null);
    setMessage(null);

    try {
      const nextDesign: StudentCardDesign =
        {
          studentId: student.id,
          width: template.width,
          height: template.height,
          background:
            template.background,
          elements:
            template.elements.map(
              (element) => ({
                ...element,
              }),
            ),
          updatedAt:
            new Date().toISOString(),
        };

      setDesign(nextDesign);

      setSelectedElementId(
        nextDesign.elements[0]
          ?.id ?? null,
      );

      setSelectedTemplateId(
        template.id,
      );

      setMessage(
        `تم تطبيق قالب "${template.name}" على التصميم.`,
      );
    } catch (templateError) {
      console.error(
        "Failed to apply student card template:",
        templateError,
      );

      setError(
        templateError instanceof Error
          ? templateError.message
          : "تعذر تطبيق القالب.",
      );
    } finally {
      setIsApplyingTemplate(
        false,
      );
    }
  };

  const handlePreviewTemplate = (
    template: StudentCardTemplate,
  ) => {
    setPreviewTemplate(
      template,
    );
    setShowTemplatePreview(
      true,
    );
  };

  const handleEditTemplate = async (
    template: StudentCardTemplate,
  ) => {
    await applyTemplate(
      template,
    );

    window.setTimeout(() => {
      canvasRef.current?.scrollIntoView(
        {
          behavior: "smooth",
          block: "center",
        },
      );
    }, 50);
  };

  const handleSaveAsNewTemplate =
    async () => {
      if (
        !design ||
        !newTemplateName.trim()
      ) {
        return;
      }

      setIsSavingTemplate(
        true,
      );
      setError(null);
      setMessage(null);

      try {
        const savedTemplate =
          await studentCardTemplateService.saveAsNew(
            newTemplateName,
            {
              width: design.width,
              height: design.height,
              background:
                design.background,
              elements:
                design.elements,
            },
          );

        setTemplates(
          (current) => [
            ...current,
            savedTemplate,
          ],
        );

        setSelectedTemplateId(
          savedTemplate.id,
        );

        setNewTemplateName(
          "",
        );
        setShowSaveTemplate(
          false,
        );

        setMessage(
          `تم حفظ "${savedTemplate.name}" كقالب جديد.`,
        );
      } catch (templateError) {
        console.error(
          "Failed to save custom student card template:",
          templateError,
        );

        setError(
          templateError instanceof Error
            ? templateError.message
            : "تعذر حفظ القالب الجديد.",
        );
      } finally {
        setIsSavingTemplate(
          false,
        );
      }
    };

  if (
    isLoading ||
    !design
  ) {
    return (
      <div
        dir="rtl"
        className="min-h-screen bg-slate-50"
      >
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="animate-pulse space-y-5">
            <div className="h-8 w-56 rounded-lg bg-slate-200" />
            <div className="h-[540px] rounded-2xl bg-slate-200" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <main
      dir="rtl"
      className="min-h-screen bg-slate-50"
    >
      <div className="mx-auto max-w-[1500px] px-4 py-6 sm:px-6 lg:px-8">
        <header className="mb-5 flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm lg:flex-row lg:items-center lg:justify-between">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <a
                href={`/students/${student.id}`}
                className="inline-flex items-center gap-1 text-xs font-semibold text-slate-400 transition hover:text-teal-700"
              >
                <FiChevronLeft
                  size={14}
                />
                ملف الطالب
              </a>

              <span className="text-slate-300">
                /
              </span>

              <span className="text-xs font-semibold text-slate-600">
                مصمم كارت الطالب
              </span>
            </div>

            <div className="mt-3">
              <h1 className="text-xl font-black text-slate-900 sm:text-2xl">
                مصمم كارت الطالب
              </h1>

              <p className="mt-1 text-xs leading-6 text-slate-400">
                حرّك العناصر، غيّر أحجامها وتنسيقها، أو اختر قالبًا جاهزًا ثم احفظ التصميم.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={handleReset}
              disabled={isResetting}
              className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 text-xs font-semibold text-slate-600 transition hover:border-amber-200 hover:bg-amber-50 hover:text-amber-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <FiRefreshCw
                size={15}
                className={
                  isResetting
                    ? "animate-spin"
                    : ""
                }
              />
              إعادة الافتراضي
            </button>

            <button
              type="button"
              onClick={() =>
                setShowSaveTemplate(
                  true,
                )
              }
              className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 text-xs font-semibold text-slate-600 transition hover:border-teal-200 hover:bg-teal-50 hover:text-teal-700"
            >
              <FiSave size={15} />
              حفظ كقالب جديد
            </button>

            <button
              type="button"
              onClick={handleSave}
              disabled={isSaving}
              className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-teal-600 px-4 text-xs font-bold text-white transition hover:bg-teal-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <FiSave size={15} />
              {isSaving
                ? "جارٍ الحفظ..."
                : "حفظ التصميم"}
            </button>
          </div>
        </header>

        {(error || message) && (
          <div className="mb-5">
            {error && (
              <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-xs leading-6 text-red-700">
                {error}
              </div>
            )}

            {!error &&
              message && (
                <div className="flex items-center gap-2 rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-xs font-semibold text-emerald-700">
                  <FiCheck size={15} />
                  {message}
                </div>
              )}
          </div>
        )}

        <div className="mb-5">
          <DesignerPanel title="قوالب كارت الطالب">
            {isTemplatesLoading ? (
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
                {Array.from(
                  { length: 5 },
                  (_, index) => (
                    <div
                      key={index}
                      className="animate-pulse rounded-xl border border-slate-200 bg-slate-50 p-3"
                    >
                      <div className="h-28 rounded-lg bg-slate-200" />
                      <div className="mt-3 h-3 w-20 rounded bg-slate-200" />
                      <div className="mt-2 h-8 rounded-lg bg-slate-200" />
                    </div>
                  ),
                )}
              </div>
            ) : templates.length === 0 ? (
              <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-8 text-center">
                <p className="text-xs font-semibold text-slate-500">
                  لا توجد قوالب متاحة حاليًا.
                </p>
              </div>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
                {templates.map(
                  (template) => {
                    const previewStyle =
                      templatePreviewStyles[
                        template.id
                      ] ??
                      templatePreviewStyles.simple;

                    const isSelected =
                      selectedTemplateId ===
                      template.id;

                    return (
                      <div
                        key={
                          template.id
                        }
                        className={`rounded-xl border p-3 transition ${
                          isSelected
                            ? "border-teal-300 bg-teal-50/50 shadow-sm"
                            : "border-slate-200 bg-white hover:border-slate-300"
                        }`}
                      >
                        <button
                          type="button"
                          onClick={() =>
                            setSelectedTemplateId(
                              template.id,
                            )
                          }
                          className="block w-full text-right"
                        >
                          <TemplateThumbnail
                            template={
                              template
                            }
                            background={
                              previewStyle.background
                            }
                            accent={
                              previewStyle.accent
                            }
                            studentName={
                              student.name
                            }
                          />

                          <div className="mt-3 flex items-center justify-between gap-2">
                            <span className="truncate text-xs font-black text-slate-800">
                              {
                                template.name
                              }
                            </span>

                            {template.isSystem && (
                              <span className="rounded-full bg-slate-100 px-2 py-1 text-[9px] font-bold text-slate-500">
                                جاهز
                              </span>
                            )}
                          </div>

                          <p className="mt-1 min-h-8 text-[10px] leading-4 text-slate-400">
                            {
                              template.description
                            }
                          </p>
                        </button>

                        <div className="mt-3 grid grid-cols-3 gap-1.5">
                          <button
                            type="button"
                            onClick={() =>
                              handlePreviewTemplate(
                                template,
                              )
                            }
                            className="rounded-lg border border-slate-200 bg-white px-2 py-2 text-[10px] font-bold text-slate-600 transition hover:bg-slate-50"
                          >
                            Preview
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              void applyTemplate(
                                template,
                              )
                            }
                            disabled={
                              isApplyingTemplate
                            }
                            className="rounded-lg bg-teal-600 px-2 py-2 text-[10px] font-bold text-white transition hover:bg-teal-700 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            Apply
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              void handleEditTemplate(
                                template,
                              )
                            }
                            disabled={
                              isApplyingTemplate
                            }
                            className="rounded-lg border border-slate-200 bg-white px-2 py-2 text-[10px] font-bold text-slate-600 transition hover:border-teal-200 hover:bg-teal-50 hover:text-teal-700 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            Edit
                          </button>
                        </div>
                      </div>
                    );
                  },
                )}
              </div>
            )}
          </DesignerPanel>
        </div>

        <div className="grid gap-5 xl:grid-cols-[280px_minmax(0,1fr)_320px]">
          <aside className="space-y-5">
            <DesignerPanel title="العناصر">
              <div className="space-y-2">
                {design.elements
                  .slice()
                  .sort(
                    (a, b) =>
                      a.zIndex -
                      b.zIndex,
                  )
                  .map(
                    (
                      element,
                    ) => (
                      <button
                        key={
                          element.id
                        }
                        type="button"
                        onClick={() =>
                          setSelectedElementId(
                            element.id,
                          )
                        }
                        className={`flex w-full items-center justify-between rounded-xl border px-3 py-3 text-right transition ${
                          selectedElementId ===
                          element.id
                            ? "border-teal-200 bg-teal-50"
                            : "border-slate-100 bg-slate-50/60 hover:border-slate-200 hover:bg-white"
                        }`}
                      >
                        <span className="flex min-w-0 items-center gap-2">
                          <FiMove
                            size={
                              14
                            }
                            className="shrink-0 text-slate-400"
                          />

                          <span className="min-w-0">
                            <span className="block truncate text-xs font-bold text-slate-700">
                              {
                                elementLabels[
                                  element.type
                                ]
                              }
                            </span>

                            <span className="mt-0.5 block truncate text-[10px] text-slate-400">
                              {
                                elementDescriptions[
                                  element.type
                                ]
                              }
                            </span>
                          </span>
                        </span>

                        {element.visible ? (
                          <FiEye
                            size={
                              15
                            }
                            className="shrink-0 text-emerald-600"
                          />
                        ) : (
                          <FiEyeOff
                            size={
                              15
                            }
                            className="shrink-0 text-slate-300"
                          />
                        )}
                      </button>
                    ),
                  )}
              </div>
            </DesignerPanel>

            <DesignerPanel title="بيانات الطالب">
              <div className="space-y-3">
                <DesignerValue
                  label="الطالب"
                  value={
                    student.name
                  }
                />

                <DesignerValue
                  label="رقم الطالب"
                  value={
                    student.studentId
                  }
                  direction="ltr"
                />

                <DesignerValue
                  label="المجموعة"
                  value={
                    groupName
                  }
                />

                <DesignerValue
                  label="المرحلة"
                  value={
                    student.grade
                  }
                />

                <DesignerValue
                  label="المدرس"
                  value={
                    teacherName
                  }
                />

                <DesignerValue
                  label="Attendance Code"
                  value={
                    studentCard?.attendanceCode ||
                    "غير صادر"
                  }
                  direction="ltr"
                />
              </div>
            </DesignerPanel>
          </aside>

          <section className="min-w-0 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
            <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-sm font-bold text-slate-800">
                  مساحة التصميم
                </h2>

                <p className="mt-1 text-[11px] text-slate-400">
                  اسحب العنصر لتغيير موضعه، واسحب المقبض لتغيير حجمه.
                </p>
              </div>

              <span className="w-fit rounded-full bg-slate-100 px-3 py-1 text-[10px] font-semibold text-slate-500">
                {design.width} ×{" "}
                {design.height}px
              </span>
            </div>

            <div className="overflow-auto rounded-2xl border border-slate-200 bg-slate-100 p-4 sm:p-6">
              <div className="mx-auto w-full min-w-[860px]">
                <div
                  ref={
                    canvasRef
                  }
                  className="relative mx-auto overflow-hidden rounded-[22px] border border-slate-200 shadow-xl"
                  style={{
                    width:
                      design.width,
                    height:
                      design.height,
                    background:
                      design.background,
                  }}
                  onPointerMove={
                    handlePointerMove
                  }
                  onPointerUp={
                    handlePointerUp
                  }
                  onPointerCancel={
                    handlePointerUp
                  }
                  onPointerDown={() =>
                    setSelectedElementId(
                      null,
                    )
                  }
                >
                  <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-slate-900" />

                  {design.elements
                    .filter(
                      (
                        element,
                      ) =>
                        element.visible,
                    )
                    .sort(
                      (a, b) =>
                        a.zIndex -
                        b.zIndex,
                    )
                    .map(
                      (
                        element,
                      ) => (
                        <DesignerCanvasElement
                          key={
                            element.id
                          }
                          element={
                            element
                          }
                          student={
                            student
                          }
                          groupName={
                            groupName
                          }
                          teacherName={
                            teacherName
                          }
                          studentCard={
                            studentCard
                          }
                          qrCodeUrl={
                            qrCodeUrl
                          }
                          selected={
                            selectedElementId ===
                            element.id
                          }
                          onSelect={() =>
                            setSelectedElementId(
                              element.id,
                            )
                          }
                          onStartDrag={(
                            event,
                          ) =>
                            startInteraction(
                              event,
                              element,
                              "drag",
                            )
                          }
                          onStartResize={(
                            event,
                          ) =>
                            startInteraction(
                              event,
                              element,
                              "resize",
                            )
                          }
                        />
                      ),
                    )}
                </div>
              </div>
            </div>
          </section>

          <aside className="space-y-5">
            <DesignerPanel title="خصائص العنصر">
              {selectedElement ? (
                <div className="space-y-5">
                  <div>
                    <p className="text-xs font-bold text-slate-700">
                      {
                        elementLabels[
                          selectedElement.type
                        ]
                      }
                    </p>

                    <p className="mt-1 text-[11px] leading-5 text-slate-400">
                      {
                        elementDescriptions[
                          selectedElement.type
                        ]
                      }
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <PropertyNumber
                      label="X"
                      value={Math.round(
                        selectedElement.x,
                      )}
                      onChange={(
                        value,
                      ) =>
                        updateElement(
                          selectedElement.id,
                          {
                            x: clamp(
                              value,
                              0,
                              design.width -
                                selectedElement.width,
                            ),
                          },
                        )
                      }
                    />

                    <PropertyNumber
                      label="Y"
                      value={Math.round(
                        selectedElement.y,
                      )}
                      onChange={(
                        value,
                      ) =>
                        updateElement(
                          selectedElement.id,
                          {
                            y: clamp(
                              value,
                              0,
                              design.height -
                                selectedElement.height,
                            ),
                          },
                        )
                      }
                    />

                    <PropertyNumber
                      label="العرض"
                      value={Math.round(
                        selectedElement.width,
                      )}
                      min={
                        MIN_ELEMENT_WIDTH
                      }
                      onChange={(
                        value,
                      ) =>
                        updateElement(
                          selectedElement.id,
                          {
                            width: clamp(
                              value,
                              MIN_ELEMENT_WIDTH,
                              design.width -
                                selectedElement.x,
                            ),
                          },
                        )
                      }
                    />

                    <PropertyNumber
                      label="الارتفاع"
                      value={Math.round(
                        selectedElement.height,
                      )}
                      min={
                        MIN_ELEMENT_HEIGHT
                      }
                      onChange={(
                        value,
                      ) =>
                        updateElement(
                          selectedElement.id,
                          {
                            height: clamp(
                              value,
                              MIN_ELEMENT_HEIGHT,
                              design.height -
                                selectedElement.y,
                            ),
                          },
                        )
                      }
                    />
                  </div>

                  <div>
                    <p className="mb-2 text-[11px] font-semibold text-slate-500">
                      الظهور
                    </p>

                    <button
                      type="button"
                      onClick={() =>
                        handleElementVisibility(
                          selectedElement,
                        )
                      }
                      className={`flex h-10 w-full items-center justify-center gap-2 rounded-lg border text-xs font-semibold transition ${
                        selectedElement.visible
                          ? "border-emerald-100 bg-emerald-50 text-emerald-700"
                          : "border-slate-200 bg-slate-50 text-slate-500"
                      }`}
                    >
                      {selectedElement.visible ? (
                        <FiEye
                          size={
                            15
                          }
                        />
                      ) : (
                        <FiEyeOff
                          size={
                            15
                          }
                        />
                      )}

                      {selectedElement.visible
                        ? "العنصر ظاهر"
                        : "العنصر مخفي"}
                    </button>
                  </div>

                  <div>
                    <p className="mb-2 text-[11px] font-semibold text-slate-500">
                      حجم الخط
                    </p>

                    <input
                      type="range"
                      min="10"
                      max="52"
                      value={
                        selectedElement.fontSize
                      }
                      onChange={(
                        event,
                      ) =>
                        handleStyleChange(
                          "fontSize",
                          Number(
                            event
                              .target
                              .value,
                          ),
                        )
                      }
                      className="w-full accent-teal-600"
                    />

                    <div className="mt-1 text-center text-[11px] text-slate-400">
                      {
                        selectedElement.fontSize
                      }
                      px
                    </div>
                  </div>

                  <div>
                    <p className="mb-2 text-[11px] font-semibold text-slate-500">
                      وزن الخط
                    </p>

                    <div className="grid grid-cols-2 gap-2">
                      {(
                        [
                          [
                            "normal",
                            "عادي",
                          ],
                          [
                            "medium",
                            "متوسط",
                          ],
                          [
                            "semibold",
                            "شبه عريض",
                          ],
                          [
                            "bold",
                            "عريض",
                          ],
                        ] as [
                          StudentCardFontWeight,
                          string,
                        ][]
                      ).map(
                        ([
                          value,
                          label,
                        ]) => (
                          <button
                            key={
                              value
                            }
                            type="button"
                            onClick={() =>
                              handleStyleChange(
                                "fontWeight",
                                value,
                              )
                            }
                            className={`rounded-lg border px-2 py-2 text-[11px] font-semibold transition ${
                              selectedElement.fontWeight ===
                              value
                                ? "border-teal-200 bg-teal-50 text-teal-700"
                                : "border-slate-200 bg-white text-slate-500 hover:bg-slate-50"
                            }`}
                          >
                            {
                              label
                            }
                          </button>
                        ),
                      )}
                    </div>
                  </div>

                  <div>
                    <p className="mb-2 text-[11px] font-semibold text-slate-500">
                      المحاذاة
                    </p>

                    <div className="grid grid-cols-3 gap-2">
                      <AlignmentButton
                        active={
                          selectedElement.textAlign ===
                          "right"
                        }
                        onClick={() =>
                          handleStyleChange(
                            "textAlign",
                            "right",
                          )
                        }
                        label="يمين"
                      >
                        <FiAlignRight
                          size={
                            15
                          }
                        />
                      </AlignmentButton>

                      <AlignmentButton
                        active={
                          selectedElement.textAlign ===
                          "center"
                        }
                        onClick={() =>
                          handleStyleChange(
                            "textAlign",
                            "center",
                          )
                        }
                        label="وسط"
                      >
                        <FiAlignCenter
                          size={
                            15
                          }
                        />
                      </AlignmentButton>

                      <AlignmentButton
                        active={
                          selectedElement.textAlign ===
                          "left"
                        }
                        onClick={() =>
                          handleStyleChange(
                            "textAlign",
                            "left",
                          )
                        }
                        label="يسار"
                      >
                        <FiAlignLeft
                          size={
                            15
                          }
                        />
                      </AlignmentButton>
                    </div>
                  </div>

                  <div>
                    <p className="mb-2 text-[11px] font-semibold text-slate-500">
                      تنسيق النص
                    </p>

                    <div className="grid grid-cols-3 gap-2">
                      <FormatButton
                        active={
                          selectedElement.fontWeight ===
                          "bold"
                        }
                        onClick={() =>
                          handleStyleChange(
                            "fontWeight",
                            selectedElement.fontWeight ===
                              "bold"
                              ? "normal"
                              : "bold",
                          )
                        }
                        label="عريض"
                      >
                        <FiBold
                          size={
                            15
                          }
                        />
                      </FormatButton>

                      <FormatButton
                        active={
                          selectedElement.italic
                        }
                        onClick={() =>
                          handleStyleChange(
                            "italic",
                            !selectedElement.italic,
                          )
                        }
                        label="مائل"
                      >
                        <FiItalic
                          size={
                            15
                          }
                        />
                      </FormatButton>

                      <FormatButton
                        active={
                          selectedElement.underline
                        }
                        onClick={() =>
                          handleStyleChange(
                            "underline",
                            !selectedElement.underline,
                          )
                        }
                        label="تحته خط"
                      >
                        <FiUnderline
                          size={
                            15
                          }
                        />
                      </FormatButton>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      handleDeleteElement(
                        selectedElement,
                      )
                    }
                    className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-lg border border-red-100 bg-red-50 text-xs font-semibold text-red-600 transition hover:bg-red-100"
                  >
                    <FiTrash2
                      size={15}
                    />
                    إخفاء العنصر من التصميم
                  </button>
                </div>
              ) : (
                <div className="flex min-h-40 items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50 px-5 text-center">
                  <div>
                    <FiMove
                      size={22}
                      className="mx-auto text-slate-300"
                    />

                    <p className="mt-3 text-xs font-semibold text-slate-500">
                      اختر عنصرًا من الكارت
                    </p>

                    <p className="mt-1 text-[11px] leading-5 text-slate-400">
                      يمكنك بعدها تغيير موضعه وحجمه وتنسيقه.
                    </p>
                  </div>
                </div>
              )}
            </DesignerPanel>

            <DesignerPanel title="القالب الحالي">
              <div className="space-y-3">
                {selectedTemplateId ? (
                  <DesignerValue
                    label="القالب"
                    value={
                      templates.find(
                        (
                          template,
                        ) =>
                          template.id ===
                          selectedTemplateId,
                      )?.name ??
                      "قالب مخصص"
                    }
                  />
                ) : (
                  <p className="rounded-xl bg-slate-50 px-3 py-3 text-[11px] text-slate-400">
                    لم يتم اختيار قالب.
                  </p>
                )}

                <button
                  type="button"
                  onClick={() =>
                    setShowSaveTemplate(
                      true,
                    )
                  }
                  className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-lg border border-teal-100 bg-teal-50 text-xs font-bold text-teal-700 transition hover:bg-teal-100"
                >
                  <FiSave
                    size={15}
                  />
                  حفظ التصميم كقالب
                </button>
              </div>
            </DesignerPanel>

            <DesignerPanel title="حالة البيانات">
              <div className="space-y-3">
                <StatusRow
                  label="كارت الطالب"
                  value={
                    studentCard?.status ===
                    "active"
                      ? "نشط"
                      : "غير مُصدر"
                  }
                  positive={
                    studentCard?.status ===
                    "active"
                  }
                />

                <StatusRow
                  label="Attendance Code"
                  value={
                    studentCard?.attendanceCode
                      ? "متاح"
                      : "غير متاح"
                  }
                  positive={Boolean(
                    studentCard?.attendanceCode,
                  )}
                />

                <StatusRow
                  label="Parent QR"
                  value={
                    studentCard?.parentQrValue
                      ? "متاح"
                      : "بانتظار Backend"
                  }
                  positive={Boolean(
                    studentCard?.parentQrValue,
                  )}
                />
              </div>
            </DesignerPanel>

            <div className="rounded-2xl border border-slate-200 bg-slate-900 p-4 text-white">
              <p className="text-xs font-bold">
                Backend Ready
              </p>

              <p className="mt-2 text-[11px] leading-6 text-slate-300">
                التصميم والقوالب يحفظان إعدادات المواضع والتنسيق فقط. لا يتم إنشاء أي Security Token أو Attendance Code أو Parent QR Value من الواجهة الأمامية.
              </p>
            </div>
          </aside>
        </div>
      </div>

      {showTemplatePreview &&
        previewTemplate && (
          <TemplatePreviewModal
            template={
              previewTemplate
            }
            student={
              student
            }
            groupName={
              groupName
            }
            teacherName={
              teacherName
            }
            studentCard={
              studentCard
            }
            qrCodeUrl={
              qrCodeUrl
            }
            onClose={() => {
              setShowTemplatePreview(
                false,
              );
              setPreviewTemplate(
                null,
              );
            }}
            onApply={() => {
              void applyTemplate(
                previewTemplate,
              );
              setShowTemplatePreview(
                false,
              );
              setPreviewTemplate(
                null,
              );
            }}
          />
        )}

      {showSaveTemplate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 p-4 backdrop-blur-sm">
          <div
            dir="rtl"
            className="w-full max-w-md rounded-2xl border border-slate-200 bg-white shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
              <div>
                <h2 className="text-sm font-black text-slate-900">
                  حفظ كقالب جديد
                </h2>

                <p className="mt-1 text-[11px] text-slate-400">
                  سيتم حفظ شكل التصميم الحالي كقالب قابل لإعادة الاستخدام.
                </p>
              </div>

              <button
                type="button"
                onClick={() =>
                  setShowSaveTemplate(
                    false,
                  )
                }
                className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                aria-label="إغلاق"
              >
                <FiX size={17} />
              </button>
            </div>

            <div className="p-5">
              <label className="block">
                <span className="mb-2 block text-xs font-bold text-slate-700">
                  اسم القالب
                </span>

                <input
                  type="text"
                  value={
                    newTemplateName
                  }
                  onChange={(
                    event,
                  ) =>
                    setNewTemplateName(
                      event.target.value,
                    )
                  }
                  placeholder="مثال: قالب الطلاب المميز"
                  autoFocus
                  className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700 outline-none transition placeholder:text-slate-300 focus:border-teal-400 focus:ring-2 focus:ring-teal-100"
                  onKeyDown={(
                    event,
                  ) => {
                    if (
                      event.key ===
                        "Enter" &&
                      newTemplateName.trim()
                    ) {
                      void handleSaveAsNewTemplate();
                    }
                  }}
                />
              </label>

              <div className="mt-5 flex gap-2">
                <button
                  type="button"
                  onClick={() =>
                    setShowSaveTemplate(
                      false,
                    )
                  }
                  className="h-10 flex-1 rounded-lg border border-slate-200 bg-white text-xs font-bold text-slate-600 transition hover:bg-slate-50"
                >
                  إلغاء
                </button>

                <button
                  type="button"
                  onClick={() =>
                    void handleSaveAsNewTemplate()
                  }
                  disabled={
                    isSavingTemplate ||
                    !newTemplateName.trim()
                  }
                  className="h-10 flex-1 rounded-lg bg-teal-600 text-xs font-bold text-white transition hover:bg-teal-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isSavingTemplate
                    ? "جارٍ الحفظ..."
                    : "حفظ القالب"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

function DesignerCanvasElement({
  element,
  student,
  groupName,
  teacherName,
  studentCard,
  qrCodeUrl,
  selected,
  onSelect,
  onStartDrag,
  onStartResize,
}: {
  element: StudentCardElement;
  student: Student;
  groupName: string;
  teacherName: string;
  studentCard: StudentCard | null;
  qrCodeUrl: string | null;
  selected: boolean;
  onSelect: () => void;
  onStartDrag: (
    event: PointerEvent<HTMLDivElement>,
  ) => void;
  onStartResize: (
    event: PointerEvent<HTMLDivElement>,
  ) => void;
}) {
  const style = {
    left: element.x,
    top: element.y,
    width: element.width,
    height: element.height,
    zIndex: element.zIndex,
  };

  return (
    <div
      className={`absolute cursor-move select-none rounded-xl border transition ${
        selected
          ? "border-teal-500 ring-2 ring-teal-500/20"
          : "border-transparent hover:border-slate-300"
      }`}
      style={style}
      onPointerDown={
        onStartDrag
      }
      onClick={(event) => {
        event.stopPropagation();
        onSelect();
      }}
    >
      <div
        className="h-full w-full overflow-hidden p-2"
        style={{
          fontSize:
            element.fontSize,
          fontWeight:
            element.fontWeight,
          textAlign:
            element.textAlign,
          fontStyle:
            element.italic
              ? "italic"
              : "normal",
          textDecoration:
            element.underline
              ? "underline"
              : "none",
        }}
      >
        {renderElementContent(
          element.type,
          student,
          groupName,
          teacherName,
          studentCard,
          qrCodeUrl,
        )}
      </div>

      {selected && (
        <div
          className="absolute bottom-[-5px] left-[-5px] flex h-3 w-3 cursor-nwse items-center justify-center rounded-sm border border-white bg-teal-600 shadow-sm"
          onPointerDown={
            onStartResize
          }
        />
      )}
    </div>
  );
}

function renderElementContent(
  type: StudentCardElementType,
  student: Student,
  groupName: string,
  teacherName: string,
  studentCard: StudentCard | null,
  qrCodeUrl: string | null,
) {
  switch (type) {
    case "logo":
      return (
        <div className="flex h-full items-center justify-center rounded-xl bg-slate-900 text-white">
          <div className="text-center">
            <p className="text-[11px] font-medium text-slate-300">
              EduCenter
            </p>

            <p className="mt-1 font-black">
              EC
            </p>
          </div>
        </div>
      );

    case "student":
      return (
        <div className="flex h-full flex-col justify-center rounded-xl bg-white/95 px-4">
          <p className="truncate text-[10px] font-medium text-slate-400">
            اسم الطالب
          </p>

          <p className="mt-1 truncate font-black text-slate-900">
            {student.name}
          </p>

          <p
            dir="ltr"
            className="mt-1 truncate text-[10px] font-semibold text-slate-400"
          >
            {student.studentId}
          </p>
        </div>
      );

    case "teacher":
      return (
        <div className="flex h-full items-center rounded-xl bg-slate-50 px-4">
          <span className="font-semibold text-slate-700">
            المدرس:{" "}
            {teacherName ||
              "غير محدد"}
          </span>
        </div>
      );

    case "group":
      return (
        <div className="flex h-full flex-col justify-center rounded-xl bg-slate-50 px-4">
          <span className="text-[10px] text-slate-400">
            المجموعة
          </span>

          <span className="mt-1 font-bold text-slate-800">
            {groupName}
          </span>
        </div>
      );

    case "grade":
      return (
        <div className="flex h-full flex-col justify-center rounded-xl bg-slate-50 px-4">
          <span className="text-[10px] text-slate-400">
            المرحلة
          </span>

          <span className="mt-1 font-bold text-slate-800">
            {student.grade}
          </span>
        </div>
      );

    case "qr":
      return qrCodeUrl ? (
        <div className="flex h-full items-center justify-center rounded-xl bg-white">
          <img
            src={qrCodeUrl}
            alt="Parent QR"
            className="h-full max-h-full w-auto max-w-full object-contain"
            draggable={false}
          />
        </div>
      ) : (
        <div className="flex h-full items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50 text-center">
          <span className="px-3 text-xs leading-5 text-slate-400">
            Parent QR
            <br />
            غير متاح
          </span>
        </div>
      );

    case "attendance_code":
      return (
        <div className="flex h-full flex-col justify-center rounded-xl bg-slate-900 px-5 text-white">
          <span className="text-[10px] font-medium text-slate-400">
            Attendance Code
          </span>

          <span
            dir="ltr"
            className="mt-2 truncate text-center font-black tracking-[0.2em]"
          >
            {studentCard?.attendanceCode ||
              "غير صادر"}
          </span>
        </div>
      );

    default:
      return null;
  }
}

function TemplateThumbnail({
  template,
  background,
  accent,
  studentName,
}: {
  template: StudentCardTemplate;
  background: string;
  accent: string;
  studentName: string;
}) {
  const visibleElements =
    template.elements
      .filter(
        (element) =>
          element.visible,
      )
      .sort(
        (a, b) =>
          a.zIndex -
          b.zIndex,
      );

  return (
    <div
      className="relative aspect-[1.59] overflow-hidden rounded-lg border border-slate-200"
      style={{
        background,
      }}
    >
      <div
        className="absolute inset-x-0 top-0 h-[20%]"
        style={{
          background: accent,
        }}
      />

      {visibleElements.map(
        (element) => {
          const left =
            (element.x /
              template.width) *
            100;

          const top =
            (element.y /
              template.height) *
            100;

          const width =
            (element.width /
              template.width) *
            100;

          const height =
            (element.height /
              template.height) *
            100;

          return (
            <div
              key={
                element.id
              }
              className="absolute overflow-hidden rounded-sm"
              style={{
                left: `${left}%`,
                top: `${top}%`,
                width: `${width}%`,
                height: `${height}%`,
              }}
            >
              <TemplateThumbnailElement
                type={
                  element.type
                }
                accent={
                  accent
                }
                studentName={
                  studentName
                }
              />
            </div>
          );
        },
      )}
    </div>
  );
}

function TemplateThumbnailElement({
  type,
  accent,
  studentName,
}: {
  type: StudentCardElementType;
  accent: string;
  studentName: string;
}) {
  switch (type) {
    case "logo":
      return (
        <div
          className="flex h-full items-center justify-center rounded bg-slate-900 text-[5px] font-black text-white"
        >
          EC
        </div>
      );

    case "student":
      return (
        <div className="flex h-full flex-col justify-center bg-white px-1">
          <span className="truncate text-[4px] text-slate-400">
            اسم الطالب
          </span>

          <span className="truncate text-[6px] font-black text-slate-900">
            {studentName}
          </span>
        </div>
      );

    case "teacher":
      return (
        <div className="flex h-full items-center bg-slate-50 px-1">
          <span className="truncate text-[5px] font-semibold text-slate-600">
            المدرس
          </span>
        </div>
      );

    case "group":
      return (
        <div className="flex h-full items-center bg-slate-50 px-1">
          <span className="truncate text-[5px] font-bold text-slate-700">
            المجموعة
          </span>
        </div>
      );

    case "grade":
      return (
        <div className="flex h-full items-center bg-slate-50 px-1">
          <span className="truncate text-[5px] font-bold text-slate-700">
            المرحلة
          </span>
        </div>
      );

    case "qr":
      return (
        <div
          className="m-auto aspect-square h-[70%] border-2 border-dashed"
          style={{
            borderColor:
              accent,
          }}
        />
      );

    case "attendance_code":
      return (
        <div
          className="flex h-full items-center justify-center rounded bg-slate-900 text-[5px] font-black tracking-widest text-white"
        >
          CODE
        </div>
      );

    default:
      return null;
  }
}

function TemplatePreviewModal({
  template,
  student,
  groupName,
  teacherName,
  studentCard,
  qrCodeUrl,
  onClose,
  onApply,
}: {
  template: StudentCardTemplate;
  student: Student;
  groupName: string;
  teacherName: string;
  studentCard: StudentCard | null;
  qrCodeUrl: string | null;
  onClose: () => void;
  onApply: () => void;
}) {
  const scale = 0.75;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-auto bg-slate-950/55 p-4 backdrop-blur-sm">
      <div
        dir="rtl"
        className="w-full max-w-5xl rounded-2xl border border-slate-200 bg-white shadow-2xl"
      >
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
          <div>
            <h2 className="text-sm font-black text-slate-900">
              معاينة القالب
            </h2>

            <p className="mt-1 text-[11px] text-slate-400">
              {template.name}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
            aria-label="إغلاق"
          >
            <FiX size={17} />
          </button>
        </div>

        <div className="overflow-auto bg-slate-100 p-5 sm:p-8">
          <div
            className="mx-auto overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl"
            style={{
              width:
                template.width *
                scale,
              height:
                template.height *
                scale,
            }}
          >
            <div
              className="relative origin-top-left"
              style={{
                width:
                  template.width,
                height:
                  template.height,
                transform: `scale(${scale})`,
                background:
                  template.background,
              }}
            >
              <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-slate-900" />

              {template.elements
                .filter(
                  (element) =>
                    element.visible,
                )
                .sort(
                  (a, b) =>
                    a.zIndex -
                    b.zIndex,
                )
                .map(
                  (element) => (
                    <PreviewCanvasElement
                      key={
                        element.id
                      }
                      element={
                        element
                      }
                      student={
                        student
                      }
                      groupName={
                        groupName
                      }
                      teacherName={
                        teacherName
                      }
                      studentCard={
                        studentCard
                      }
                      qrCodeUrl={
                        qrCodeUrl
                      }
                    />
                  ),
                )}
            </div>
          </div>
        </div>

        <div className="flex flex-col-reverse gap-2 border-t border-slate-100 p-5 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onClose}
            className="h-10 rounded-lg border border-slate-200 bg-white px-5 text-xs font-bold text-slate-600 transition hover:bg-slate-50"
          >
            إغلاق
          </button>

          <button
            type="button"
            onClick={onApply}
            className="h-10 rounded-lg bg-teal-600 px-5 text-xs font-bold text-white transition hover:bg-teal-700"
          >
            تطبيق القالب
          </button>
        </div>
      </div>
    </div>
  );
}

function PreviewCanvasElement({
  element,
  student,
  groupName,
  teacherName,
  studentCard,
  qrCodeUrl,
}: {
  element: StudentCardElement;
  student: Student;
  groupName: string;
  teacherName: string;
  studentCard: StudentCard | null;
  qrCodeUrl: string | null;
}) {
  return (
    <div
      className="absolute overflow-hidden rounded-xl"
      style={{
        left: element.x,
        top: element.y,
        width: element.width,
        height: element.height,
        zIndex: element.zIndex,
      }}
    >
      <div
        className="h-full w-full overflow-hidden p-2"
        style={{
          fontSize:
            element.fontSize,
          fontWeight:
            element.fontWeight,
          textAlign:
            element.textAlign,
          fontStyle:
            element.italic
              ? "italic"
              : "normal",
          textDecoration:
            element.underline
              ? "underline"
              : "none",
        }}
      >
        {renderElementContent(
          element.type,
          student,
          groupName,
          teacherName,
          studentCard,
          qrCodeUrl,
        )}
      </div>
    </div>
  );
}

function DesignerPanel({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-100 px-4 py-3">
        <h2 className="text-xs font-bold text-slate-800">
          {title}
        </h2>
      </div>

      <div className="p-4">
        {children}
      </div>
    </section>
  );
}

function DesignerValue({
  label,
  value,
  direction = "rtl",
}: {
  label: string;
  value: string;
  direction?: "rtl" | "ltr";
}) {
  return (
    <div className="rounded-xl border border-slate-100 bg-slate-50/60 p-3">
      <p className="text-[10px] text-slate-400">
        {label}
      </p>

      <p
        dir={direction}
        className="mt-1 truncate text-xs font-bold text-slate-700"
      >
        {value}
      </p>
    </div>
  );
}

function PropertyNumber({
  label,
  value,
  min = 0,
  onChange,
}: {
  label: string;
  value: number;
  min?: number;
  onChange: (
    value: number,
  ) => void;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-[10px] font-semibold text-slate-400">
        {label}
      </span>

      <input
        type="number"
        min={min}
        value={value}
        onChange={(event) =>
          onChange(
            Number(
              event.target.value,
            ),
          )
        }
        className="h-9 w-full rounded-lg border border-slate-200 bg-white px-2 text-center text-xs font-semibold text-slate-700 outline-none transition focus:border-teal-400 focus:ring-2 focus:ring-teal-100"
      />
    </label>
  );
}

function AlignmentButton({
  active,
  onClick,
  label,
  children,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={label}
      className={`flex h-10 items-center justify-center rounded-lg border transition ${
        active
          ? "border-teal-200 bg-teal-50 text-teal-700"
          : "border-slate-200 bg-white text-slate-500 hover:bg-slate-50"
      }`}
    >
      {children}
    </button>
  );
}

function FormatButton({
  active,
  onClick,
  label,
  children,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={label}
      className={`flex h-10 items-center justify-center rounded-lg border transition ${
        active
          ? "border-teal-200 bg-teal-50 text-teal-700"
          : "border-slate-200 bg-white text-slate-500 hover:bg-slate-50"
      }`}
    >
      {children}
    </button>
  );
}

function StatusRow({
  label,
  value,
  positive,
}: {
  label: string;
  value: string;
  positive: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-xs text-slate-500">
        {label}
      </span>

      <span
        className={`rounded-full px-2.5 py-1 text-[10px] font-semibold ${
          positive
            ? "bg-emerald-50 text-emerald-700"
            : "bg-slate-100 text-slate-500"
        }`}
      >
        {value}
      </span>
    </div>
  );
}

function clamp(
  value: number,
  min: number,
  max: number,
) {
  if (!Number.isFinite(value)) {
    return min;
  }

  return Math.min(
    Math.max(value, min),
    Math.max(min, max),
  );
}
