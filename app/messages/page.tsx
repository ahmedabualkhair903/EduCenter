
"use client";

import {
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import {
  FiAlertCircle,
  FiCheckCircle,
  FiClock,
  FiEdit2,
  FiFileText,
  FiMessageCircle,
  FiPlus,
  FiSearch,
  FiSend,
  FiUsers,
  FiX,
} from "react-icons/fi";

import { useAppSettings } from "@/components/providers";
import { messageService } from "@/services";

import type {
  MessageStatus,
  MessageType,
  WhatsAppMessage,
} from "@/types/message";

type MessageRecord = WhatsAppMessage & {
  title: string;
  recipient: string;
  recipientsCount: number;
};

function mapServiceMessage(
  message: WhatsAppMessage,
): MessageRecord {
  return {
    ...message,
    title: message.title ?? "رسالة",
    recipient:
      message.recipient ??
      message.guardianPhone ??
      message.studentId,
    recipientsCount:
      message.recipientsCount ?? 1,
  };
}

const statusOptions: Array<{
  value: "all" | MessageStatus;
  label: string;
}> = [
  { value: "all", label: "كل الحالات" },
  { value: "sent", label: "Sent" },
  { value: "pending", label: "Pending" },
  { value: "scheduled", label: "مجدولة" },
  { value: "draft", label: "مسودة" },
  { value: "failed", label: "Failed" },
];

const typeOptions: Array<{
  value: "all" | MessageType;
  label: string;
}> = [
  { value: "all", label: "كل الأنواع" },
  { value: "individual", label: "فردية" },
  { value: "group", label: "مجموعة" },
  { value: "notification", label: "إشعار" },
  { value: "reminder", label: "تذكير" },
  { value: "examResult", label: "نتائج" },
  { value: "attendance", label: "حضور" },
  { value: "checkOut", label: "انصراف" },
  { value: "absence", label: "غياب" },
];

export default function MessagesPage() {
  const { settings, isModuleEnabled } = useAppSettings();

  const [messages, setMessages] =
    useState<MessageRecord[]>([]);

  const [search, setSearch] = useState("");

  const [statusFilter, setStatusFilter] =
    useState<"all" | MessageStatus>("all");

  const [typeFilter, setTypeFilter] =
    useState<"all" | MessageType>("all");

  const [modalOpen, setModalOpen] = useState(false);

  const [editingMessage, setEditingMessage] =
    useState<MessageRecord | null>(null);

  useEffect(() => {
    let mounted = true;

    const loadMessages = async () => {
      try {
        const data = await messageService.list();

        if (mounted) {
          setMessages(data.map(mapServiceMessage));
        }
      } catch {
        // Keep the list empty; errors surface on next action.
      }
    };

    void loadMessages();

    return () => {
      mounted = false;
    };
  }, []);

  const whatsappEnabled =
    isModuleEnabled("whatsapp") &&
    settings.notifications.whatsappEnabled;

  const filteredMessages = useMemo(() => {
    const query = search.trim().toLowerCase();

    return messages.filter((message) => {
      const searchableText = [
        message.title,
        message.recipient,
        message.content ?? "",
        message.error ?? "",
      ]
        .join(" ")
        .toLowerCase();

      const matchesSearch =
        query.length === 0 ||
        searchableText.includes(query);

      const matchesStatus =
        statusFilter === "all" ||
        message.status === statusFilter;

      const matchesType =
        typeFilter === "all" ||
        message.type === typeFilter;

      return (
        matchesSearch &&
        matchesStatus &&
        matchesType
      );
    });
  }, [
    messages,
    search,
    statusFilter,
    typeFilter,
  ]);

  const sentCount = messages.filter(
    (message) => message.status === "sent",
  ).length;

  const pendingCount = messages.filter(
    (message) => message.status === "pending",
  ).length;

  const failedCount = messages.filter(
    (message) => message.status === "failed",
  ).length;

  const scheduledCount = messages.filter(
    (message) => message.status === "scheduled",
  ).length;

  const totalRecipients = messages.reduce(
    (total, message) =>
      total + message.recipientsCount,
    0,
  );

  const openCreateModal = () => {
    setEditingMessage(null);
    setModalOpen(true);
  };

  const openEditModal = (
    message: MessageRecord,
  ) => {
    setEditingMessage(message);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingMessage(null);
  };

  const handleSave = async (
    data: Omit<
      MessageRecord,
      "id" | "createdAt" | "sentAt"
    >,
  ) => {
    try {
      if (editingMessage) {
        const updated = await messageService.update(
          editingMessage.id,
          data,
        );

        if (updated) {
          setMessages((current) =>
            current.map((message) =>
              message.id === editingMessage.id
                ? { ...message, ...data }
                : message,
            ),
          );
        }
      } else {
        const created = await messageService.create(
          data,
        );

        setMessages((current) => [
          mapServiceMessage(created),
          ...current,
        ]);
      }
    } finally {
      closeModal();
    }
  };

  const handleDelete = async (
    message: MessageRecord,
  ) => {
    const confirmed = window.confirm(
      `هل أنت متأكد من حذف "${message.title}"؟`,
    );

    if (!confirmed) {
      return;
    }

    const success = await messageService.delete(
      message.id,
    );

    if (success) {
      setMessages((current) =>
        current.filter(
          (item) => item.id !== message.id,
        ),
      );
    }
  };

  const handleSend = async (
    message: MessageRecord,
  ) => {
    if (
      !whatsappEnabled ||
      message.status === "sent" ||
      message.status === "pending"
    ) {
      return;
    }

    const updated = await messageService.update(
      message.id,
      {
        status: "pending",
        error: undefined,
      },
    );

    if (updated) {
      setMessages((current) =>
        current.map((item) =>
          item.id === message.id
            ? {
                ...item,
                status: "pending",
                error: undefined,
              }
            : item,
        ),
      );
    }
  };

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="mb-2 flex items-center gap-2 text-xs font-medium text-slate-400">
              <span>الرئيسية</span>
              <span>/</span>
              <span className="text-teal-600">
                الرسائل
              </span>
            </div>

            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              WhatsApp والرسائل
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              تجهيز ومتابعة رسائل النتائج
              والحضور والانصراف والغياب.
            </p>
          </div>

          <button
            type="button"
            onClick={openCreateModal}
            disabled={!whatsappEnabled}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-teal-600 px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-teal-700 disabled:cursor-not-allowed disabled:bg-slate-300"
          >
            <FiPlus size={17} />
            رسالة جديدة
          </button>
        </div>

        {!whatsappEnabled && (
          <section className="mb-6 flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4">
            <FiAlertCircle
              size={18}
              className="mt-0.5 shrink-0 text-amber-600"
            />

            <div>
              <p className="text-sm font-bold text-amber-800">
                WhatsApp غير مفعّل
              </p>

              <p className="mt-1 text-xs leading-5 text-amber-700">
                فعّل Module الخاص بـWhatsApp
                من الإعدادات حتى تتمكن من
                تجهيز الرسائل.
              </p>
            </div>
          </section>
        )}

        <section className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <MessageStat
            label="Sent"
            value={sentCount}
            icon={<FiCheckCircle size={19} />}
          />

          <MessageStat
            label="Pending"
            value={pendingCount}
            icon={<FiClock size={19} />}
          />

          <MessageStat
            label="Failed"
            value={failedCount}
            icon={<FiAlertCircle size={19} />}
          />

          <MessageStat
            label="مجدولة"
            value={scheduledCount}
            icon={<FiClock size={19} />}
          />

          <MessageStat
            label="إجمالي المستلمين"
            value={totalRecipients}
            icon={<FiUsers size={19} />}
          />
        </section>

        <section className="mb-6 overflow-hidden rounded-xl border border-teal-100 bg-gradient-to-l from-teal-50 to-white p-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-teal-100 text-teal-700">
                <FiMessageCircle size={21} />
              </div>

              <div>
                <h2 className="text-sm font-bold text-slate-800">
                  WhatsApp
                </h2>

                <p className="mt-1 text-xs text-slate-500">
                  الواجهة مجهزة للربط مع Backend
                  وWhatsApp API لاحقًا.
                </p>
              </div>
            </div>

            <span
              className={[
                "inline-flex w-fit items-center gap-2 rounded-full px-3 py-1.5 text-[11px] font-semibold",
                whatsappEnabled
                  ? "bg-emerald-50 text-emerald-700"
                  : "bg-slate-100 text-slate-500",
              ].join(" ")}
            >
              <span
                className={[
                  "h-1.5 w-1.5 rounded-full",
                  whatsappEnabled
                    ? "bg-emerald-500"
                    : "bg-slate-400",
                ].join(" ")}
              />

              {whatsappEnabled
                ? "الوحدة مفعلة"
                : "الوحدة متوقفة"}
            </span>
          </div>
        </section>

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
                placeholder="ابحث في الرسائل أو المستلمين..."
                aria-label="البحث في الرسائل"
                className="h-10 w-full rounded-lg border border-slate-200 bg-slate-50 pr-9 pl-3 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-teal-500 focus:bg-white focus:ring-4 focus:ring-teal-500/10"
              />
            </div>

            <select
              value={typeFilter}
              onChange={(event) =>
                setTypeFilter(
                  event.target.value as
                    | "all"
                    | MessageType,
                )
              }
              aria-label="فلترة حسب النوع"
              className="h-10 min-w-40 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-600 outline-none transition hover:border-slate-300 focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10"
            >
              {typeOptions.map((option) => (
                <option
                  key={option.value}
                  value={option.value}
                >
                  {option.label}
                </option>
              ))}
            </select>

            <select
              value={statusFilter}
              onChange={(event) =>
                setStatusFilter(
                  event.target.value as
                    | "all"
                    | MessageStatus,
                )
              }
              aria-label="فلترة حسب الحالة"
              className="h-10 min-w-36 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-600 outline-none transition hover:border-slate-300 focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10"
            >
              {statusOptions.map((option) => (
                <option
                  key={option.value}
                  value={option.value}
                >
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </section>

        <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
            <div>
              <h2 className="text-sm font-bold text-slate-800">
                سجل الرسائل
              </h2>

              <p className="mt-1 text-xs text-slate-400">
                عرض {filteredMessages.length} رسالة
              </p>
            </div>

            <div className="hidden items-center gap-2 text-xs text-slate-400 sm:flex">
              <FiSend size={14} />
              WhatsApp
            </div>
          </div>

          {filteredMessages.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1150px] text-right">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/70">
                    <th className="px-5 py-3 text-xs font-semibold text-slate-500">
                      الرسالة
                    </th>

                    <th className="px-5 py-3 text-xs font-semibold text-slate-500">
                      المستلمون
                    </th>

                    <th className="px-5 py-3 text-xs font-semibold text-slate-500">
                      النوع
                    </th>

                    <th className="px-5 py-3 text-xs font-semibold text-slate-500">
                      التاريخ
                    </th>

                    <th className="px-5 py-3 text-xs font-semibold text-slate-500">
                      العدد
                    </th>

                    <th className="px-5 py-3 text-xs font-semibold text-slate-500">
                      الحالة
                    </th>

                    <th className="px-5 py-3 text-xs font-semibold text-slate-500">
                      الإجراءات
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {filteredMessages.map((message) => (
                    <tr
                      key={message.id}
                      className="border-b border-slate-100 transition last:border-0 hover:bg-slate-50/70"
                    >
                      <td className="max-w-[330px] px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-teal-50 text-teal-600">
                            <FiMessageCircle size={16} />
                          </div>

                          <div className="min-w-0">
                            <p className="truncate text-sm font-semibold text-slate-800">
                              {message.title}
                            </p>

                            <p className="mt-1 truncate text-[11px] text-slate-400">
                              {message.content}
                            </p>

                            {message.error && (
                              <p className="mt-1 truncate text-[10px] text-red-500">
                                {message.error}
                              </p>
                            )}
                          </div>
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        <span className="text-xs font-medium text-slate-600">
                          {message.recipient}
                        </span>
                      </td>

                      <td className="px-5 py-4">
                        <MessageTypeBadge
                          type={message.type}
                        />
                      </td>

                      <td className="px-5 py-4">
                        {message.scheduledDate ? (
                          <div>
                            <p className="text-xs font-semibold text-slate-600">
                              {message.scheduledDate}
                            </p>

                            {message.scheduledTime && (
                              <p className="mt-1 text-[10px] text-slate-400">
                                {message.scheduledTime}
                              </p>
                            )}
                          </div>
                        ) : (
                          <span className="text-xs text-slate-400">
                            —
                          </span>
                        )}
                      </td>

                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          <FiUsers
                            size={14}
                            className="text-slate-400"
                          />

                          <span className="text-sm font-semibold text-slate-700">
                            {message.recipientsCount}
                          </span>
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        <MessageStatusBadge
                          status={message.status}
                        />
                      </td>

                      <td className="px-5 py-4">
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() =>
                              openEditModal(message)
                            }
                            className="flex h-8 w-8 items-center justify-center rounded-md text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                            title="تعديل"
                            aria-label={`تعديل ${message.title}`}
                          >
                            <FiEdit2 size={15} />
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              handleSend(message)
                            }
                            disabled={
                              !whatsappEnabled ||
                              message.status === "sent" ||
                              message.status === "pending"
                            }
                            className="flex h-8 w-8 items-center justify-center rounded-md text-slate-400 transition hover:bg-teal-50 hover:text-teal-600 disabled:cursor-not-allowed disabled:opacity-40"
                            title={
                              message.status === "sent"
                                ? "تم الإرسال"
                                : message.status === "pending"
                                  ? "Pending"
                                  : "تجهيز للإرسال"
                            }
                            aria-label={`إرسال ${message.title}`}
                          >
                            <FiSend size={15} />
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              handleDelete(message)
                            }
                            className="flex h-8 w-8 items-center justify-center rounded-md text-slate-400 transition hover:bg-red-50 hover:text-red-600"
                            title="حذف"
                            aria-label={`حذف ${message.title}`}
                          >
                            <FiX size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="flex min-h-64 flex-col items-center justify-center px-6 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-400">
                <FiMessageCircle size={20} />
              </div>

              <h3 className="mt-4 text-sm font-bold text-slate-800">
                لا توجد رسائل
              </h3>

              <p className="mt-1 text-xs text-slate-400">
                جرّب تغيير البحث أو الفلاتر.
              </p>
            </div>
          )}
        </section>
      </div>

      <MessageModal
        key={`${modalOpen}-${editingMessage?.id ?? "new"}`}
        open={modalOpen}
        message={editingMessage}
        onClose={closeModal}
        onSubmit={handleSave}
      />
    </main>
  );
}

function MessageStat({
  label,
  value,
  icon,
}: {
  label: string;
  value: number;
  icon: ReactNode;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
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

function MessageStatusBadge({
  status,
}: {
  status: MessageStatus;
}) {
  const styles: Record<MessageStatus, string> = {
    sent: "bg-emerald-50 text-emerald-700",
    pending: "bg-amber-50 text-amber-700",
    scheduled: "bg-blue-50 text-blue-700",
    draft: "bg-slate-100 text-slate-600",
    failed: "bg-red-50 text-red-700",
  };

  const labels: Record<MessageStatus, string> = {
    sent: "Sent",
    pending: "Pending",
    scheduled: "مجدولة",
    draft: "مسودة",
    failed: "Failed",
  };

  return (
    <span
      className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${styles[status]}`}
    >
      {labels[status]}
    </span>
  );
}

function MessageTypeBadge({
  type,
}: {
  type: MessageType;
}) {
  const labels: Record<MessageType, string> = {
    individual: "فردية",
    group: "مجموعة",
    notification: "إشعار",
    reminder: "تذكير",
    examResult: "نتائج",
    attendance: "حضور",
    checkOut: "انصراف",
    absence: "غياب",
  };

  return (
    <span className="rounded-md bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-600">
      {labels[type]}
    </span>
  );
}

function MessageModal({
  open,
  message,
  onClose,
  onSubmit,
}: {
  open: boolean;
  message: MessageRecord | null;
  onClose: () => void;
  onSubmit: (
    data: Omit<
      MessageRecord,
      "id" | "createdAt" | "sentAt"
    >,
  ) => void;
}) {
  const isEdit = Boolean(message);

  const [title, setTitle] = useState(
    message?.title ?? "",
  );

  const [recipient, setRecipient] = useState(
    message?.recipient ?? "",
  );

  const [type, setType] = useState<MessageType>(
    message?.type ?? "individual",
  );

  const [content, setContent] = useState(
    message?.content ?? "",
  );

  const [date, setDate] = useState(
    message?.scheduledDate ?? "",
  );

  const [time, setTime] = useState(
    message?.scheduledTime ?? "",
  );

  const [recipientsCount, setRecipientsCount] =
    useState(
      String(message?.recipientsCount ?? 1),
    );

  const [status, setStatus] =
    useState<MessageStatus>(
      message?.status ?? "draft",
    );

  const [error, setError] = useState("");

  if (!open) {
    return null;
  }

  const handleSubmit = () => {
    if (
      !title.trim() ||
      !recipient.trim() ||
      !content.trim()
    ) {
      setError(
        "يرجى إدخال عنوان الرسالة والمستلمين ومحتوى الرسالة.",
      );
      return;
    }

    const numericCount = Number(
      recipientsCount,
    );

    if (
      !Number.isInteger(numericCount) ||
      numericCount <= 0
    ) {
      setError(
        "عدد المستلمين يجب أن يكون رقمًا صحيحًا أكبر من صفر.",
      );
      return;
    }

    if (
      status === "scheduled" &&
      (!date.trim() || !time.trim())
    ) {
      setError(
        "يرجى إدخال تاريخ ووقت الجدولة.",
      );
      return;
    }

    onSubmit({
      title: title.trim(),
      recipient: recipient.trim(),
      type,
      content: content.trim(),
      recipientsCount: numericCount,
      status,
      scheduledDate:
        status === "draft"
          ? undefined
          : date.trim() || undefined,
      scheduledTime:
        status === "draft"
          ? undefined
          : time.trim() || undefined,
      studentId: message?.studentId ?? "",
      guardianPhone:
        message?.guardianPhone ?? "",
      error:
        status === "failed"
          ? "تعذر تجهيز الرسالة."
          : undefined,
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
      <div className="flex max-h-[92vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4 sm:px-6">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              {isEdit
                ? "تعديل الرسالة"
                : "إنشاء رسالة جديدة"}
            </h2>

            <p className="mt-1 text-xs text-slate-400">
              تجهيز الرسالة فقط. الإرسال الحقيقي
              سيتم لاحقًا من خلال Backend.
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

        <div className="flex-1 overflow-y-auto px-5 py-5 sm:px-6">
          {error && (
            <div className="mb-4 rounded-lg border border-red-100 bg-red-50 px-3 py-2 text-xs font-medium text-red-600">
              {error}
            </div>
          )}

          <div className="grid gap-4 sm:grid-cols-2">
            <MessageField label="عنوان الرسالة">
              <input
                value={title}
                onChange={(event) => {
                  setTitle(event.target.value);
                  setError("");
                }}
                placeholder="مثال: نتيجة امتحان الفيزياء"
                className="field"
              />
            </MessageField>

            <MessageField label="المستلمون">
              <input
                value={recipient}
                onChange={(event) => {
                  setRecipient(event.target.value);
                  setError("");
                }}
                placeholder="اسم الطالب أو المجموعة"
                className="field"
              />
            </MessageField>

            <MessageField label="نوع الرسالة">
              <select
                value={type}
                onChange={(event) => {
                  setType(
                    event.target.value as MessageType,
                  );
                  setError("");
                }}
                className="field"
              >
                <option value="individual">
                  فردية
                </option>

                <option value="group">
                  مجموعة
                </option>

                <option value="examResult">
                  نتائج الامتحانات
                </option>

                <option value="attendance">
                  حضور
                </option>

                <option value="checkOut">
                  انصراف
                </option>

                <option value="absence">
                  غياب
                </option>

                <option value="notification">
                  إشعار
                </option>

                <option value="reminder">
                  تذكير
                </option>
              </select>
            </MessageField>

            <MessageField label="عدد المستلمين">
              <input
                type="number"
                min="1"
                step="1"
                value={recipientsCount}
                onChange={(event) => {
                  setRecipientsCount(
                    event.target.value,
                  );
                  setError("");
                }}
                className="field"
              />
            </MessageField>

            <div className="sm:col-span-2">
              <MessageField label="محتوى الرسالة">
                <textarea
                  value={content}
                  onChange={(event) => {
                    setContent(event.target.value);
                    setError("");
                  }}
                  placeholder="اكتب محتوى الرسالة هنا..."
                  className="field min-h-32 resize-y"
                />
              </MessageField>
            </div>

            <MessageField label="الحالة">
              <select
                value={status}
                onChange={(event) => {
                  const nextStatus =
                    event.target
                      .value as MessageStatus;

                  setStatus(nextStatus);

                  if (nextStatus === "draft") {
                    setDate("");
                    setTime("");
                  }

                  setError("");
                }}
                className="field"
              >
                <option value="draft">
                  مسودة
                </option>

                <option value="pending">
                  Pending
                </option>

                <option value="scheduled">
                  مجدولة
                </option>

                <option value="sent">
                  Sent
                </option>

                <option value="failed">
                  Failed
                </option>
              </select>
            </MessageField>

            <MessageField label="التاريخ">
              <input
                type="text"
                value={date}
                onChange={(event) =>
                  setDate(event.target.value)
                }
                disabled={status === "draft"}
                placeholder="24 أغسطس 2026"
                className="field disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400"
              />
            </MessageField>

            <MessageField label="الوقت">
              <input
                type="text"
                value={time}
                onChange={(event) =>
                  setTime(event.target.value)
                }
                disabled={status === "draft"}
                placeholder="04:00 م"
                className="field disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400"
              />
            </MessageField>
          </div>
        </div>

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
            className="inline-flex h-10 items-center gap-2 rounded-lg bg-teal-600 px-5 text-sm font-semibold text-white transition hover:bg-teal-700"
          >
            <FiFileText size={15} />

            {isEdit
              ? "حفظ التعديلات"
              : "حفظ الرسالة"}
          </button>
        </div>
      </div>
    </div>
  );
}

function MessageField({
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
