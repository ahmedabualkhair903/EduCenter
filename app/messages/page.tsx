"use client";

import {
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  FiCheckCircle,
  FiClock,
  FiEdit2,
  FiMessageCircle,
  FiMoreVertical,
  FiPlus,
  FiSearch,
  FiSend,
  FiUsers,
  FiX,
} from "react-icons/fi";

import type {
  MessageStatus,
  MessageType,
  WhatsAppMessage,
} from "@/types/message";

type MessageRecord = WhatsAppMessage & {
  title: string;
  recipient: string;
  recipientsCount: number;
  scheduledDate?: string;
  scheduledTime?: string;
};

const initialMessages: MessageRecord[] = [
  {
    id: "1",
    studentId: "group-3-secondary",
    guardianPhone: "",
    type: "reminder",
    status: "sent",
    title: "تذكير بموعد الحصة",
    recipient: "أولياء أمور ثالثة ثانوي",
    content:
      "نذكركم بموعد حصة الفيزياء اليوم الساعة 07:00 مساءً.",
    createdAt: "2026-08-23T15:15:00",
    sentAt: "2026-08-23T15:15:00",
    recipientsCount: 32,
    scheduledDate: "23 أغسطس 2026",
    scheduledTime: "03:15 م",
  },
  {
    id: "2",
    studentId: "group-3-secondary-a",
    guardianPhone: "",
    type: "notification",
    status: "sent",
    title: "موعد الامتحان القادم",
    recipient: "ثالثة ثانوي - A",
    content:
      "نحيطكم علمًا بأن امتحان الفيزياء سيكون يوم الثلاثاء القادم.",
    createdAt: "2026-08-23T13:40:00",
    sentAt: "2026-08-23T13:40:00",
    recipientsCount: 32,
    scheduledDate: "23 أغسطس 2026",
    scheduledTime: "01:40 م",
  },
  {
    id: "3",
    studentId: "late-payments",
    guardianPhone: "",
    type: "reminder",
    status: "scheduled",
    title: "تذكير بالرسوم الدراسية",
    recipient: "الطلاب المتأخرون في الدفع",
    content:
      "يرجى التوجه إلى إدارة المركز لسداد المبلغ المتبقي.",
    createdAt: "2026-08-24T10:00:00",
    recipientsCount: 38,
    scheduledDate: "24 أغسطس 2026",
    scheduledTime: "10:00 ص",
  },
  {
    id: "4",
    studentId: "group-2-secondary-b",
    guardianPhone: "",
    type: "group",
    status: "sent",
    title: "إلغاء حصة الفيزياء",
    recipient: "ثانية ثانوي - B",
    content:
      "نحيطكم علمًا بإلغاء حصة الفيزياء اليوم لظرف طارئ.",
    createdAt: "2026-08-22T18:30:00",
    sentAt: "2026-08-22T18:30:00",
    recipientsCount: 28,
    scheduledDate: "22 أغسطس 2026",
    scheduledTime: "06:30 م",
  },
  {
    id: "5",
    studentId: "student-1",
    guardianPhone: "",
    type: "individual",
    status: "sent",
    title: "رسالة ترحيب",
    recipient: "أحمد محمد",
    content:
      "مرحبًا بكم في مركزنا التعليمي، نتمنى لكم التوفيق.",
    createdAt: "2026-08-21T11:20:00",
    sentAt: "2026-08-21T11:20:00",
    recipientsCount: 1,
    scheduledDate: "21 أغسطس 2026",
    scheduledTime: "11:20 ص",
  },
  {
    id: "6",
    studentId: "group-1-secondary-a",
    guardianPhone: "",
    type: "reminder",
    status: "draft",
    title: "تذكير حضور",
    recipient: "أولى ثانوي - A",
    content:
      "نرجو الالتزام بالحضور في الموعد المحدد للحصة.",
    createdAt: "2026-08-24T00:00:00",
    recipientsCount: 25,
  },
];

const statusOptions: Array<{
  value: "all" | MessageStatus;
  label: string;
}> = [
  { value: "all", label: "كل الحالات" },
  { value: "sent", label: "مرسلة" },
  { value: "scheduled", label: "مجدولة" },
  { value: "draft", label: "مسودة" },
  { value: "failed", label: "فشل" },
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
];

export default function MessagesPage() {
  const [messages, setMessages] =
    useState<MessageRecord[]>(initialMessages);

  const [search, setSearch] = useState("");

  const [statusFilter, setStatusFilter] =
    useState<"all" | MessageStatus>("all");

  const [typeFilter, setTypeFilter] =
    useState<"all" | MessageType>("all");

  const [modalOpen, setModalOpen] =
    useState(false);

  const [editingMessage, setEditingMessage] =
    useState<MessageRecord | null>(null);

  const filteredMessages = useMemo(() => {
    const query = search.trim().toLowerCase();

    return messages.filter((message) => {
      const searchableText = [
        message.title,
        message.recipient,
        message.content ?? "",
      ]
        .join(" ")
        .toLowerCase();

      const matchesSearch =
        !query || searchableText.includes(query);

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

  const scheduledCount = messages.filter(
    (message) => message.status === "scheduled",
  ).length;

  const draftCount = messages.filter(
    (message) => message.status === "draft",
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

  const handleSave = (
    data: Omit<
      MessageRecord,
      "id" | "createdAt" | "sentAt"
    >,
  ) => {
    if (editingMessage) {
      setMessages((current) =>
        current.map((message) =>
          message.id === editingMessage.id
            ? {
                ...message,
                ...data,
              }
            : message,
        ),
      );
    } else {
      const newMessage: MessageRecord = {
        id: crypto.randomUUID(),
        ...data,
        createdAt:
          new Date().toISOString(),
      };

      setMessages((current) => [
        newMessage,
        ...current,
      ]);
    }

    closeModal();
  };

  const handleDelete = (
    message: MessageRecord,
  ) => {
    const confirmed = window.confirm(
      `هل أنت متأكد من حذف "${message.title}"؟`,
    );

    if (!confirmed) {
      return;
    }

    setMessages((current) =>
      current.filter(
        (item) => item.id !== message.id,
      ),
    );
  };

  const handleSend = (
    message: MessageRecord,
  ) => {
    if (
      message.status === "sent"
    ) {
      return;
    }

    setMessages((current) =>
      current.map((item) =>
        item.id === message.id
          ? {
              ...item,
              status: "sent",
              sentAt:
                new Date().toISOString(),
              scheduledDate:
                item.scheduledDate ??
                "24 أغسطس 2026",
              scheduledTime:
                item.scheduledTime ??
                "الآن",
            }
          : item,
      ),
    );
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
                الرسائل
              </span>
            </div>

            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              الرسائل
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              إرسال ومتابعة رسائل WhatsApp
              لأولياء الأمور والطلاب.
            </p>
          </div>

          <button
            type="button"
            onClick={openCreateModal}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-teal-600 px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-teal-700 active:scale-[0.98]"
          >
            <FiPlus size={17} />
            رسالة جديدة
          </button>
        </div>

        {/* Stats */}

        <section className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <MessageStat
            label="الرسائل المرسلة"
            value={sentCount}
            icon={
              <FiCheckCircle size={19} />
            }
          />

          <MessageStat
            label="الرسائل المجدولة"
            value={scheduledCount}
            icon={<FiClock size={19} />}
          />

          <MessageStat
            label="المسودات"
            value={draftCount}
            icon={<FiEdit2 size={19} />}
          />

          <MessageStat
            label="إجمالي المستلمين"
            value={totalRecipients}
            icon={<FiUsers size={19} />}
          />
        </section>

        {/* WhatsApp Banner */}

        <section className="mb-6 overflow-hidden rounded-xl border border-teal-100 bg-gradient-to-l from-teal-50 to-white p-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-teal-100 text-teal-700">
                <FiMessageCircle size={21} />
              </div>

              <div>
                <h2 className="text-sm font-bold text-slate-800">
                  رسائل WhatsApp
                </h2>

                <p className="mt-1 text-xs text-slate-500">
                  تواصل سريع ومنظم مع أولياء
                  الأمور والطلاب.
                </p>
              </div>
            </div>

            <span className="inline-flex w-fit items-center gap-2 rounded-full bg-emerald-50 px-3 py-1.5 text-[11px] font-semibold text-emerald-700">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              النظام جاهز للإرسال
            </span>
          </div>
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
              className="h-10 min-w-32 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-600 outline-none transition hover:border-slate-300 focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10"
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
              className="h-10 min-w-32 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-600 outline-none transition hover:border-slate-300 focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10"
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

        {/* Table */}

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
              <table className="w-full min-w-[1050px] text-right">
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
                  {filteredMessages.map(
                    (message) => (
                      <tr
                        key={message.id}
                        className="border-b border-slate-100 transition last:border-0 hover:bg-slate-50/70"
                      >
                        <td className="max-w-[330px] px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-teal-50 text-teal-600">
                              <FiMessageCircle
                                size={16}
                              />
                            </div>

                            <div className="min-w-0">
                              <p className="truncate text-sm font-semibold text-slate-800">
                                {message.title}
                              </p>

                              <p className="mt-1 truncate text-[11px] text-slate-400">
                                {message.content}
                              </p>
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
                                {
                                  message.scheduledDate
                                }
                              </p>

                              <p className="mt-1 text-[10px] text-slate-400">
                                {
                                  message.scheduledTime
                                }
                              </p>
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
                              {
                                message.recipientsCount
                              }
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
                                openEditModal(
                                  message,
                                )
                              }
                              className="flex h-8 w-8 items-center justify-center rounded-md text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                              title="تعديل"
                              aria-label={`تعديل ${message.title}`}
                            >
                              <FiEdit2
                                size={15}
                              />
                            </button>

                            <button
                              type="button"
                              onClick={() =>
                                handleSend(
                                  message,
                                )
                              }
                              disabled={
                                message.status ===
                                "sent"
                              }
                              className="flex h-8 w-8 items-center justify-center rounded-md text-slate-400 transition hover:bg-teal-50 hover:text-teal-600 disabled:cursor-not-allowed disabled:opacity-40"
                              title={
                                message.status ===
                                "sent"
                                  ? "تم الإرسال"
                                  : "إرسال"
                              }
                              aria-label={`إرسال ${message.title}`}
                            >
                              <FiSend
                                size={15}
                              />
                            </button>

                            <button
                              type="button"
                              onClick={() =>
                                handleDelete(
                                  message,
                                )
                              }
                              className="flex h-8 w-8 items-center justify-center rounded-md text-slate-400 transition hover:bg-red-50 hover:text-red-600"
                              title="حذف"
                              aria-label={`حذف ${message.title}`}
                            >
                              <FiX size={16} />
                            </button>

                            <button
                              type="button"
                              className="flex h-8 w-8 items-center justify-center rounded-md text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                              title="المزيد"
                              aria-label="المزيد من الإجراءات"
                            >
                              <FiMoreVertical
                                size={16}
                              />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ),
                  )}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="flex min-h-64 flex-col items-center justify-center px-6 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-400">
                <FiMessageCircle
                  size={20}
                />
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
        open={modalOpen}
        message={editingMessage}
        onClose={closeModal}
        onSubmit={handleSave}
      />
    </main>
  );
}

/* -------------------------------------------------------------------------- */
/* Stat                                                                       */
/* -------------------------------------------------------------------------- */

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

/* -------------------------------------------------------------------------- */
/* Status Badge                                                               */
/* -------------------------------------------------------------------------- */

function MessageStatusBadge({
  status,
}: {
  status: MessageStatus;
}) {
  const styles: Record<
    MessageStatus,
    string
  > = {
    sent: "bg-emerald-50 text-emerald-700",
    scheduled: "bg-blue-50 text-blue-700",
    draft: "bg-slate-100 text-slate-600",
    failed: "bg-red-50 text-red-700",
  };

  const labels: Record<
    MessageStatus,
    string
  > = {
    sent: "مرسلة",
    scheduled: "مجدولة",
    draft: "مسودة",
    failed: "فشل",
  };

  return (
    <span
      className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${styles[status]}`}
    >
      {labels[status]}
    </span>
  );
}

/* -------------------------------------------------------------------------- */
/* Type Badge                                                                 */
/* -------------------------------------------------------------------------- */

function MessageTypeBadge({
  type,
}: {
  type: MessageType;
}) {
  const labels: Record<
    MessageType,
    string
  > = {
    individual: "فردية",
    group: "مجموعة",
    notification: "إشعار",
    reminder: "تذكير",
  };

  return (
    <span className="rounded-md bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-600">
      {labels[type]}
    </span>
  );
}

/* -------------------------------------------------------------------------- */
/* Modal                                                                      */
/* -------------------------------------------------------------------------- */

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

  const [title, setTitle] = useState("");
  const [recipient, setRecipient] =
    useState("");
  const [type, setType] =
    useState<MessageType>("individual");
  const [content, setContent] = useState("");
  const [date, setDate] = useState(
    "24 أغسطس 2026",
  );
  const [time, setTime] =
    useState("04:00 م");
  const [
    recipientsCount,
    setRecipientsCount,
  ] = useState("1");
  const [status, setStatus] =
    useState<MessageStatus>("draft");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open) {
      return;
    }

    setTitle(message?.title ?? "");
    setRecipient(message?.recipient ?? "");
    setType(
      message?.type ?? "individual",
    );
    setContent(message?.content ?? "");
    setDate(
      message?.scheduledDate ??
        "24 أغسطس 2026",
    );
    setTime(
      message?.scheduledTime ??
        "04:00 م",
    );
    setRecipientsCount(
      String(
        message?.recipientsCount ?? 1,
      ),
    );
    setStatus(
      message?.status ?? "draft",
    );
    setError("");
  }, [open, message]);

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

    const numericCount =
      Number(recipientsCount);

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
          : date.trim(),
      scheduledTime:
        status === "draft"
          ? undefined
          : time.trim(),
      studentId:
        message?.studentId ?? "",
      guardianPhone:
        message?.guardianPhone ?? "",
      error: undefined,
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
        {/* Header */}

        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4 sm:px-6">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              {isEdit
                ? "تعديل الرسالة"
                : "إنشاء رسالة جديدة"}
            </h2>

            <p className="mt-1 text-xs text-slate-400">
              أنشئ رسالة لإرسالها إلى الطلاب أو
              أولياء الأمور.
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
            <div className="mb-4 rounded-lg border border-red-100 bg-red-50 px-3 py-2 text-xs font-medium text-red-600">
              {error}
            </div>
          )}

          <div className="grid gap-4 sm:grid-cols-2">
            <MessageField label="عنوان الرسالة">
              <input
                value={title}
                onChange={(event) => {
                  setTitle(
                    event.target.value,
                  );
                  setError("");
                }}
                placeholder="مثال: تذكير بموعد الحصة"
                className="field"
              />
            </MessageField>

            <MessageField label="المستلمون">
              <input
                value={recipient}
                onChange={(event) => {
                  setRecipient(
                    event.target.value,
                  );
                  setError("");
                }}
                placeholder="مثال: ثالثة ثانوي - A"
                className="field"
              />
            </MessageField>

            <MessageField label="نوع الرسالة">
              <select
                value={type}
                onChange={(event) => {
                  setType(
                    event.target
                      .value as MessageType,
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
                    setContent(
                      event.target.value,
                    );
                    setError("");
                  }}
                  placeholder="اكتب محتوى الرسالة هنا..."
                  className="field min-h-32 resize-y"
                />
              </MessageField>

              <p className="mt-1.5 text-[10px] text-slate-400">
                اكتب الرسالة بشكل واضح ومختصر.
              </p>
            </div>

            <MessageField label="الحالة">
              <select
                value={status}
                onChange={(event) => {
                  setStatus(
                    event.target
                      .value as MessageStatus,
                  );
                  setError("");
                }}
                className="field"
              >
                <option value="draft">
                  مسودة
                </option>

                <option value="scheduled">
                  مجدولة
                </option>

                <option value="sent">
                  مرسلة
                </option>

                <option value="failed">
                  فشل
                </option>
              </select>
            </MessageField>

            <MessageField label="التاريخ">
              <input
                value={date}
                onChange={(event) =>
                  setDate(
                    event.target.value,
                  )
                }
                disabled={
                  status === "draft"
                }
                placeholder="24 أغسطس 2026"
                className="field disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400"
              />
            </MessageField>

            <MessageField label="الوقت">
              <input
                value={time}
                onChange={(event) =>
                  setTime(
                    event.target.value,
                  )
                }
                disabled={
                  status === "draft"
                }
                placeholder="04:00 م"
                className="field disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400"
              />
            </MessageField>
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
            className="inline-flex h-10 items-center gap-2 rounded-lg bg-teal-600 px-5 text-sm font-semibold text-white transition hover:bg-teal-700"
          >
            <FiSend size={15} />

            {isEdit
              ? "حفظ التعديلات"
              : "حفظ الرسالة"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Field                                                                      */
/* -------------------------------------------------------------------------- */

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