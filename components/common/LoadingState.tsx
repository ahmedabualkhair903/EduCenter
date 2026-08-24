type LoadingStateProps = {
  label?: string;
};

export default function LoadingState({
  label = "جاري التحميل...",
}: LoadingStateProps) {
  return (
    <div
      role="status"
      aria-live="polite"
      className="flex min-h-40 w-full items-center justify-center rounded-xl border border-slate-200 bg-white px-6 py-8"
    >
      <div className="flex items-center gap-3 text-sm text-slate-500">
        <span
          aria-hidden="true"
          className="h-5 w-5 animate-spin rounded-full border-2 border-slate-200 border-t-teal-600"
        />

        <span>{label}</span>
      </div>
    </div>
  );
}