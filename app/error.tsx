"use client";

import { useEffect } from "react";
import { FiAlertCircle, FiRefreshCw } from "react-icons/fi";

export default function Error({
  error,
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main
      dir="rtl"
      className="flex min-h-screen items-center justify-center bg-slate-50 px-6"
    >
      <div
        role="alert"
        className="w-full max-w-md rounded-2xl border border-red-100 bg-white p-8 text-center shadow-sm"
      >
        <div
          aria-hidden="true"
          className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-50 text-red-500"
        >
          <FiAlertCircle size={21} />
        </div>

        <h1 className="mt-4 text-lg font-bold text-slate-900">
          حدث خطأ غير متوقع
        </h1>

        <p className="mt-2 text-sm leading-6 text-slate-500">
          تعذر تحميل هذه الصفحة. حاول إعادة التحميل، وإذا استمرت
          المشكلة فتواصل مع الدعم الفني.
        </p>

        <button
          type="button"
          onClick={() => retry()}
          className="mt-6 inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-teal-600 px-6 text-sm font-semibold text-white shadow-sm transition hover:bg-teal-700 active:scale-[0.98]"
        >
          <FiRefreshCw size={16} aria-hidden="true" />
          إعادة المحاولة
        </button>
      </div>
    </main>
  );
}