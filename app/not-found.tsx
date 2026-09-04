import Link from "next/link";
import { FiHome } from "react-icons/fi";
import { LuGraduationCap } from "react-icons/lu";

export default function NotFound() {
  return (
    <main
      dir="rtl"
      className="flex min-h-screen bg-slate-50 px-6 py-16"
    >
      <div className="mx-auto w-full max-w-md text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-teal-600 text-white shadow-lg shadow-teal-600/20">
          <LuGraduationCap size={28} aria-hidden="true" />
        </div>

        <p className="mt-8 text-sm font-semibold text-teal-600">
          خطأ 404
        </p>

        <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
          الصفحة غير موجودة
        </h1>

        <p className="mt-3 text-sm leading-7 text-slate-500">
          عذرًا، لم نتمكن من العثور على الصفحة التي تبحث عنها. ربما تم
          نقلها أو حذفها.
        </p>

        <Link
          href="/dashboard"
          className="mt-8 inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-teal-600 px-6 text-sm font-semibold text-white shadow-sm transition hover:bg-teal-700 active:scale-[0.98]"
        >
          <FiHome size={16} aria-hidden="true" />
          العودة إلى لوحة التحكم
        </Link>
      </div>
    </main>
  );
}