
"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import {
  FiArrowLeft,
  FiEye,
  FiEyeOff,
  FiLock,
  FiMail,
  FiPhone,
  FiUser,
} from "react-icons/fi";
import { LuGraduationCap } from "react-icons/lu";

export default function RegisterPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const clearError = () => {
    if (error) {
      setError("");
    }
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setError("");

    if (!name.trim()) {
      setError("من فضلك أدخل الاسم بالكامل.");
      return;
    }

    if (!email.trim()) {
      setError("من فضلك أدخل البريد الإلكتروني.");
      return;
    }

    if (!phone.trim()) {
      setError("من فضلك أدخل رقم الهاتف.");
      return;
    }

    if (!password.trim()) {
      setError("من فضلك أدخل كلمة المرور.");
      return;
    }

    if (password.length < 6) {
      setError("يجب أن تتكون كلمة المرور من 6 أحرف أو أرقام على الأقل.");
      return;
    }

    if (!confirmPassword.trim()) {
      setError("من فضلك أكد كلمة المرور.");
      return;
    }

    if (password !== confirmPassword) {
      setError("كلمة المرور وتأكيد كلمة المرور غير متطابقين.");
      return;
    }

    setLoading(true);

    /*
     * سيتم استبدال هذا الجزء لاحقًا باستدعاء API حقيقي:
     *
     * await register({
     *   name,
     *   email,
     *   phone,
     *   password,
     * });
     */

    setTimeout(() => {
      setLoading(false);
      router.replace("/login");
    }, 800);
  };

  return (
    <main dir="rtl" className="min-h-screen bg-slate-50">
      <div className="grid min-h-screen lg:grid-cols-2">
        {/* Brand Side */}
        <section className="relative hidden overflow-hidden bg-teal-600 lg:flex">
          <div className="absolute -right-32 -top-32 h-96 w-96 rounded-full bg-white/10" />

          <div className="absolute -bottom-40 -left-32 h-[28rem] w-[28rem] rounded-full bg-white/10" />

          <div className="absolute right-1/2 top-1/2 h-72 w-72 -translate-y-1/2 translate-x-1/2 rounded-full border border-white/10" />

          <div className="relative z-10 flex w-full flex-col justify-between p-12 xl:p-16">
            {/* Brand */}
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

            {/* Content */}
            <div className="max-w-lg">
              <p className="mb-4 text-sm font-medium text-teal-100">
                ابدأ الآن بسهولة
              </p>

              <h1 className="text-4xl font-bold leading-tight tracking-tight text-white xl:text-5xl">
                أنشئ حسابك وابدأ إدارة مركزك التعليمي.
              </h1>

              <p className="mt-6 max-w-md text-sm leading-7 text-teal-50">
                أنشئ حسابًا جديدًا للوصول إلى لوحة التحكم وإدارة
                الطلاب والمجموعات والحصص والحضور والمدفوعات والامتحانات
                من مكان واحد.
              </p>

              <div className="mt-8 flex flex-wrap gap-2">
                <span className="rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs text-white">
                  الطلاب
                </span>

                <span className="rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs text-white">
                  الحضور
                </span>

                <span className="rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs text-white">
                  المدفوعات
                </span>

                <span className="rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs text-white">
                  الامتحانات
                </span>
              </div>
            </div>

            {/* Footer */}
            <p className="text-xs text-teal-100">
              © 2026 مَنارة. جميع الحقوق محفوظة.
            </p>
          </div>
        </section>

        {/* Register */}
        <section className="flex min-h-screen items-center justify-center px-5 py-10 sm:px-8">
          <div className="w-full max-w-md">
            {/* Mobile Brand */}
            <div className="mb-8 flex items-center gap-3 lg:hidden">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-teal-600 text-white shadow-sm">
                <LuGraduationCap
                  size={23}
                  strokeWidth={2}
                  aria-hidden="true"
                />
              </div>

              <div>
                <p className="text-lg font-bold text-slate-900">
                  مَنارة
                </p>

                <p className="text-xs text-slate-400">
                  نظام إدارة المركز التعليمي
                </p>
              </div>
            </div>

            {/* Heading */}
            <div className="mb-7">
              <p className="mb-2 text-sm font-medium text-teal-600">
                حساب جديد
              </p>

              <h2 className="text-3xl font-bold tracking-tight text-slate-900">
                إنشاء حساب
              </h2>

              <p className="mt-2 text-sm leading-6 text-slate-500">
                أدخل بياناتك لإنشاء حساب جديد في مَنارة.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Name */}
              <div>
                <label
                  htmlFor="name"
                  className="mb-2 block text-sm font-semibold text-slate-700"
                >
                  الاسم بالكامل
                </label>

                <div className="relative">
                  <FiUser
                    size={18}
                    className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
                  />

                  <input
                    id="name"
                    type="text"
                    value={name}
                    onChange={(event) => {
                      setName(event.target.value);
                      clearError();
                    }}
                    placeholder="أدخل الاسم بالكامل"
                    autoComplete="name"
                    className="h-12 w-full rounded-xl border border-slate-200 bg-white pr-10 pl-4 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10"
                  />
                </div>
              </div>

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
                      clearError();
                    }}
                    placeholder="admin@example.com"
                    autoComplete="email"
                    className="h-12 w-full rounded-xl border border-slate-200 bg-white pr-10 pl-4 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10"
                  />
                </div>
              </div>

              {/* Phone */}
              <div>
                <label
                  htmlFor="phone"
                  className="mb-2 block text-sm font-semibold text-slate-700"
                >
                  رقم الهاتف
                </label>

                <div className="relative">
                  <FiPhone
                    size={18}
                    className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
                  />

                  <input
                    id="phone"
                    type="tel"
                    value={phone}
                    onChange={(event) => {
                      setPhone(event.target.value);
                      clearError();
                    }}
                    placeholder="01xxxxxxxxx"
                    autoComplete="tel"
                    dir="ltr"
                    className="h-12 w-full rounded-xl border border-slate-200 bg-white pr-10 pl-4 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label
                  htmlFor="password"
                  className="mb-2 block text-sm font-semibold text-slate-700"
                >
                  كلمة المرور
                </label>

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
                      clearError();
                    }}
                    placeholder="أدخل كلمة المرور"
                    autoComplete="new-password"
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

              {/* Confirm Password */}
              <div>
                <label
                  htmlFor="confirmPassword"
                  className="mb-2 block text-sm font-semibold text-slate-700"
                >
                  تأكيد كلمة المرور
                </label>

                <div className="relative">
                  <FiLock
                    size={18}
                    className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
                  />

                  <input
                    id="confirmPassword"
                    type={
                      showConfirmPassword ? "text" : "password"
                    }
                    value={confirmPassword}
                    onChange={(event) => {
                      setConfirmPassword(event.target.value);
                      clearError();
                    }}
                    placeholder="أعد إدخال كلمة المرور"
                    autoComplete="new-password"
                    className="h-12 w-full rounded-xl border border-slate-200 bg-white pr-10 pl-11 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10"
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowConfirmPassword(
                        (current) => !current
                      )
                    }
                    aria-label={
                      showConfirmPassword
                        ? "إخفاء تأكيد كلمة المرور"
                        : "إظهار تأكيد كلمة المرور"
                    }
                    className="absolute left-3 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-50 hover:text-slate-600"
                  >
                    {showConfirmPassword ? (
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
                  className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm leading-6 text-red-600"
                >
                  {error}
                </div>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="group mt-2 flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-teal-600 text-sm font-semibold text-white shadow-sm transition hover:bg-teal-700 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? (
                  <>
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                    جاري إنشاء الحساب...
                  </>
                ) : (
                  <>
                    إنشاء الحساب

                    <FiArrowLeft
                      size={17}
                      className="transition-transform group-hover:-translate-x-1"
                    />
                  </>
                )}
              </button>
            </form>

            {/* Login Link */}
            <div className="mt-6 text-center">
              <p className="text-sm text-slate-500">
                لديك حساب بالفعل؟{" "}
                <button
                  type="button"
                  onClick={() => router.push("/login")}
                  className="font-semibold text-teal-600 transition hover:text-teal-700"
                >
                  تسجيل الدخول
                </button>
              </p>
            </div>

            <div className="mt-6 border-t border-slate-100 pt-5 text-center">
              <p className="text-xs leading-5 text-slate-400">
                هذا الإصدار يعمل محليًا حاليًا، ويمكن ربط إنشاء الحساب
                لاحقًا بنظام مصادقة وAPI حقيقي.
              </p>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
