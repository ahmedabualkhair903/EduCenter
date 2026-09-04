
"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

import {
  FiArrowLeft,
  FiEye,
  FiEyeOff,
  FiLock,
  FiMail,
} from "react-icons/fi";
import { LuGraduationCap } from "react-icons/lu";

import { login } from "@/lib/auth";

const getRedirectPath = (): string => {
  const params = new URLSearchParams(
    window.location.search,
  );

  const redirect =
    params.get("redirect") ??
    "/dashboard";

  if (
    !redirect.startsWith("/") ||
    redirect.startsWith("//") ||
    redirect.includes(":")
  ) {
    return "/dashboard";
  }

  return redirect;
};

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setError("");

    if (!email.trim()) {
      setError("من فضلك أدخل البريد الإلكتروني.");
      return;
    }

    if (!password.trim()) {
      setError("من فضلك أدخل كلمة المرور.");
      return;
    }

    setLoading(true);

    try {
      login(email, password);

      setTimeout(() => {
        router.replace(getRedirectPath());
      }, 300);
    } catch {
      setLoading(false);
      setError("حدث خطأ أثناء تسجيل الدخول. حاول مرة أخرى.");
    }
  };

  return (
    <main dir="rtl" className="min-h-screen bg-slate-50">
      <div className="grid min-h-screen lg:grid-cols-2">
        {/* Brand Side */}
        <section className="relative hidden overflow-hidden bg-teal-600 lg:flex">
          <div className="absolute -right-32 -top-32 h-96 w-96 rounded-full bg-white/10" />

          <div className="absolute -bottom-40 -left-32 h-[28rem] w-[28rem] rounded-full bg-white/10" />

          <div className="relative z-10 flex w-full flex-col justify-between p-12 xl:p-16">
            <div>
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white text-teal-600 shadow-sm">
                  <LuGraduationCap
                    size={23}
                    strokeWidth={2}
                    aria-hidden="true"
                  />
                </div>

                <div>
                  <p className="text-lg font-bold text-white">مَنارة</p>

                  <p className="text-xs text-teal-100">
                    نظام إدارة المركز التعليمي
                  </p>
                </div>
              </div>
            </div>

            <div className="max-w-lg">
              <p className="mb-4 text-sm font-medium text-teal-100">
                إدارة أبسط. رؤية أوضح.
              </p>

              <h1 className="text-4xl font-bold leading-tight tracking-tight text-white xl:text-5xl">
                كل ما تحتاجه لإدارة مركزك التعليمي في مكان واحد.
              </h1>

              <p className="mt-6 max-w-md text-sm leading-7 text-teal-50">
                تابع الطلاب والحضور والمجموعات والحصص والمدفوعات
                والامتحانات من خلال لوحة تحكم واحدة بسيطة ومنظمة.
              </p>
            </div>

            <p className="text-xs text-teal-100">
              © 2026 مَنارة. جميع الحقوق محفوظة.
            </p>
          </div>
        </section>

        {/* Login */}
        <section className="flex min-h-screen items-center justify-center px-5 py-10 sm:px-8">
          <div className="w-full max-w-md">
            {/* Mobile Brand */}
            <div className="mb-10 flex items-center gap-3 lg:hidden">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-teal-600 text-white shadow-sm">
                <LuGraduationCap
                  size={23}
                  strokeWidth={2}
                  aria-hidden="true"
                />
              </div>

              <div>
                <p className="text-lg font-bold text-slate-900">مَنارة</p>

                <p className="text-xs text-slate-400">
                  نظام إدارة المركز التعليمي
                </p>
              </div>
            </div>

            {/* Heading */}
            <div className="mb-8">
              <p className="mb-2 text-sm font-medium text-teal-600">
                مرحبًا بعودتك
              </p>

              <h2 className="text-3xl font-bold tracking-tight text-slate-900">
                تسجيل الدخول
              </h2>

              <p className="mt-2 text-sm leading-6 text-slate-500">
                أدخل بياناتك للوصول إلى لوحة التحكم.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Email */}
              <div>
                <label
                  htmlFor="email"
                  className="mb-2 block text-sm font-semibold text-slate-700"
                >
                  البريد الإلكتروني
                </label>

                <div className="relative">
                  <FiMail
                    size={18}
                    className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
                  />

                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(event) => {
                      setEmail(event.target.value);

                      if (error) {
                        setError("");
                      }
                    }}
                    placeholder="admin@example.com"
                    autoComplete="email"
                    className="h-12 w-full rounded-xl border border-slate-200 bg-white pr-10 pl-4 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <div className="mb-2">
                  <label
                    htmlFor="password"
                    className="text-sm font-semibold text-slate-700"
                  >
                    كلمة المرور
                  </label>
                </div>

                <div className="relative">
                  <FiLock
                    size={18}
                    className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
                  />

                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(event) => {
                      setPassword(event.target.value);

                      if (error) {
                        setError("");
                      }
                    }}
                    placeholder="أدخل كلمة المرور"
                    autoComplete="current-password"
                    className="h-12 w-full rounded-xl border border-slate-200 bg-white pr-10 pl-11 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10"
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowPassword((current) => !current)
                    }
                    aria-label={
                      showPassword
                        ? "إخفاء كلمة المرور"
                        : "إظهار كلمة المرور"
                    }
                    className="absolute left-3 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-50 hover:text-slate-600"
                  >
                    {showPassword ? (
                      <FiEyeOff size={17} />
                    ) : (
                      <FiEye size={17} />
                    )}
                  </button>
                </div>
              </div>

              {/* Error */}
              {error && (
                <div
                  role="alert"
                  className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600"
                >
                  {error}
                </div>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="group flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-teal-600 text-sm font-semibold text-white shadow-sm transition hover:bg-teal-700 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? (
                  <>
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                    جاري تسجيل الدخول...
                  </>
                ) : (
                  <>
                    تسجيل الدخول

                    <FiArrowLeft
                      size={17}
                      className="transition-transform group-hover:-translate-x-1"
                    />
                  </>
                )}
              </button>
            </form>

            {/* Register Link */}
            <div className="mt-6 text-center">
              <p className="text-sm text-slate-500">
                ليس لديك حساب؟{" "}
                <button
                  type="button"
                  onClick={() => router.push("/register")}
                  className="font-semibold text-teal-600 transition hover:text-teal-700"
                >
                  إنشاء حساب جديد
                </button>
              </p>
            </div>

            <div className="mt-6 border-t border-slate-100 pt-6 text-center">
              <p className="text-xs leading-5 text-slate-400">
                هذا الإصدار يعمل محليًا حاليًا، ويمكن ربطه لاحقًا
                بنظام مصادقة وAPI حقيقي.
              </p>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

