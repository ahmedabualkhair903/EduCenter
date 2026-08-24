import { FiInbox } from "react-icons/fi";

type EmptyStateProps = {
  title?: string;
  description?: string;
};

export default function EmptyState({
  title = "لا توجد بيانات",
  description = "لا توجد بيانات لعرضها حاليًا.",
}: EmptyStateProps) {
  return (
    <div
      role="status"
      aria-live="polite"
      className="flex min-h-48 w-full flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 bg-white px-6 py-8 text-center"
    >
      <div
        aria-hidden="true"
        className="mb-3 flex h-11 w-11 items-center justify-center rounded-full bg-slate-50 text-slate-400"
      >
        <FiInbox size={19} />
      </div>

      <h3 className="text-sm font-bold text-slate-700">
        {title}
      </h3>

      <p className="mt-1 max-w-sm text-xs leading-5 text-slate-400">
        {description}
      </p>
    </div>
  );
}