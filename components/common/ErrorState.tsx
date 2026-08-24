import { FiAlertCircle } from "react-icons/fi";

type ErrorStateProps = {
  title?: string;
  description?: string;
};

export default function ErrorState({
  title = "حدث خطأ",
  description = "تعذر تحميل البيانات. حاول مرة أخرى.",
}: ErrorStateProps) {
  return (
    <div
      role="alert"
      aria-live="assertive"
      className="flex min-h-48 w-full flex-col items-center justify-center rounded-xl border border-red-100 bg-red-50/40 px-6 py-8 text-center"
    >
      <div
        aria-hidden="true"
        className="mb-3 flex h-11 w-11 items-center justify-center rounded-full bg-white text-red-500 shadow-sm"
      >
        <FiAlertCircle size={19} />
      </div>

      <h3 className="text-sm font-bold text-red-700">
        {title}
      </h3>

      <p className="mt-1 max-w-sm text-xs leading-5 text-red-500/80">
        {description}
      </p>
    </div>
  );
}