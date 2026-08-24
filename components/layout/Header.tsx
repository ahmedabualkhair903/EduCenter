"use client";

import { useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  FiBell,
  FiChevronLeft,
  FiMenu,
  FiSearch,
  FiX,
} from "react-icons/fi";

type HeaderProps = {
  onMenuClick: () => void;
};

type SearchItem = {
  label: string;
  description: string;
  href: string;
  keywords: string;
};

const searchItems: SearchItem[] = [
  {
    label: "لوحة التحكم",
    description: "نظرة عامة على المركز",
    href: "/dashboard",
    keywords: "dashboard لوحة تحكم الرئيسية",
  },
  {
    label: "الطلاب",
    description: "إدارة بيانات الطلاب",
    href: "/students",
    keywords: "طلاب طالب students",
  },
  {
    label: "المجموعات",
    description: "إدارة مجموعات الطلاب",
    href: "/groups",
    keywords: "مجموعات مجموعة groups",
  },
  {
    label: "الحضور والغياب",
    description: "متابعة حضور الطلاب",
    href: "/attendance",
    keywords: "حضور غياب attendance",
  },
  {
    label: "الحضور والانصراف",
    description: "تسجيل دخول وخروج الطلاب",
    href: "/check-out",
    keywords: "انصراف خروج دخول check out",
  },
  {
    label: "الحصص",
    description: "إدارة الحصص والمواعيد",
    href: "/lessons",
    keywords: "حصص حصة lessons",
  },
  {
    label: "الامتحانات والدرجات",
    description: "إدارة الامتحانات والدرجات",
    href: "/exams",
    keywords: "امتحانات امتحان درجات exams",
  },
  {
    label: "المدفوعات",
    description: "متابعة المدفوعات والمصروفات",
    href: "/payments",
    keywords: "مدفوعات دفع فلوس payments",
  },
  {
    label: "WhatsApp",
    description: "إرسال رسائل لأولياء الأمور",
    href: "/messages",
    keywords: "واتساب whatsapp رسائل messages",
  },
  {
    label: "Excel",
    description: "استيراد وتصدير البيانات",
    href: "/excel",
    keywords: "excel اكسل استيراد تصدير",
  },
  {
    label: "التقارير",
    description: "تقارير وإحصائيات المركز",
    href: "/reports",
    keywords: "تقارير reports احصائيات",
  },
  {
    label: "الإعدادات",
    description: "إعدادات النظام والمركز",
    href: "/settings",
    keywords: "إعدادات settings",
  },
];

export default function Header({
  onMenuClick,
}: HeaderProps) {
  const router = useRouter();
  const pathname = usePathname();

  const [searchOpen, setSearchOpen] = useState(false);
  const [search, setSearch] = useState("");

  const results = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) {
      return searchItems.slice(0, 6);
    }

    return searchItems.filter((item) => {
      const searchableText = [
        item.label,
        item.description,
        item.keywords,
      ]
        .join(" ")
        .toLowerCase();

      return searchableText.includes(query);
    });
  }, [search]);

  const openSearch = () => {
    setSearchOpen(true);
  };

  const closeSearch = () => {
    setSearch("");
    setSearchOpen(false);
  };

  const handleSearchNavigate = (href: string) => {
    closeSearch();
    router.push(href);
  };

  return (
    <>
      <header className="sticky top-0 z-30 h-16 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="flex h-full items-center justify-between px-4 sm:px-6 lg:px-8">
          {/* Right Side */}
          <div className="flex min-w-0 items-center gap-3">
            <button
              type="button"
              onClick={onMenuClick}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100 hover:text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-100 lg:hidden"
              aria-label="فتح القائمة الجانبية"
              aria-controls="dashboard-sidebar"
            >
              <FiMenu size={20} />
            </button>

            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-slate-800">
                نظام إدارة المركز
              </p>

              <p className="hidden truncate text-[10px] text-slate-400 sm:block">
                مَنارة
              </p>
            </div>
          </div>

          {/* Left Side */}
          <div className="flex shrink-0 items-center gap-1 sm:gap-2">
            {/* Search */}
            <button
              type="button"
              onClick={openSearch}
              className={[
                "flex h-9 w-9 items-center justify-center rounded-lg transition",
                searchOpen
                  ? "bg-teal-50 text-teal-600"
                  : "text-slate-400 hover:bg-slate-100 hover:text-slate-700",
              ].join(" ")}
              aria-label="بحث"
              aria-expanded={searchOpen}
              aria-haspopup="dialog"
            >
              <FiSearch size={18} />
            </button>

            {/* Notifications */}
            <button
              type="button"
              className="relative flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-100"
              aria-label="الإشعارات"
            >
              <FiBell size={18} />

              <span
                className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-teal-500 ring-2 ring-white"
                aria-hidden="true"
              />
            </button>

            <div className="mx-1 hidden h-7 w-px bg-slate-200 sm:block" />

            {/* User */}
            <div className="flex items-center gap-2">
              <div
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-teal-100 text-xs font-bold text-teal-700"
                aria-hidden="true"
              >
                م
              </div>

              <div className="hidden text-right md:block">
                <p className="text-xs font-semibold text-slate-700">
                  مدير المركز
                </p>

                <p className="mt-0.5 text-[9px] text-slate-400">
                  مسؤول النظام
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Search Overlay */}
      {searchOpen && (
        <div
          className="fixed inset-0 z-50"
          role="dialog"
          aria-modal="true"
          aria-label="البحث في النظام"
        >
          <button
            type="button"
            aria-label="إغلاق البحث"
            onClick={closeSearch}
            className="absolute inset-0 cursor-default bg-slate-900/20 backdrop-blur-[2px]"
          />

          <div className="relative mx-auto mt-20 w-[calc(100%-2rem)] max-w-2xl sm:mt-24">
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl">
              {/* Search Input */}
              <div className="flex items-center gap-3 border-b border-slate-100 px-4">
                <FiSearch
                  size={19}
                  className="shrink-0 text-teal-500"
                />

                <input
                  autoFocus
                  type="search"
                  value={search}
                  onChange={(event) =>
                    setSearch(event.target.value)
                  }
                  onKeyDown={(event) => {
                    if (event.key === "Escape") {
                      closeSearch();
                    }
                  }}
                  placeholder="ابحث في النظام..."
                  className="h-14 min-w-0 flex-1 bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-400"
                />

                <button
                  type="button"
                  onClick={closeSearch}
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                  aria-label="إغلاق البحث"
                >
                  <FiX size={18} />
                </button>
              </div>

              {/* Results */}
              <div className="max-h-[60vh] overflow-y-auto p-2">
                <div className="px-3 py-2">
                  <p className="text-[10px] font-bold text-slate-400">
                    {search.trim()
                      ? "نتائج البحث"
                      : "الوصول السريع"}
                  </p>
                </div>

                {results.length > 0 ? (
                  <div className="space-y-1">
                    {results.map((item) => {
                      const active =
                        pathname === item.href ||
                        pathname.startsWith(
                          `${item.href}/`,
                        );

                      return (
                        <button
                          key={item.href}
                          type="button"
                          onClick={() =>
                            handleSearchNavigate(
                              item.href,
                            )
                          }
                          className={[
                            "group flex w-full items-center gap-3 rounded-xl px-3 py-3 text-right transition",
                            active
                              ? "bg-teal-50"
                              : "hover:bg-slate-50",
                          ].join(" ")}
                        >
                          <div
                            className={[
                              "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg",
                              active
                                ? "bg-white text-teal-600 shadow-sm"
                                : "bg-slate-100 text-slate-400 group-hover:bg-white group-hover:text-teal-600 group-hover:shadow-sm",
                            ].join(" ")}
                          >
                            <FiSearch size={16} />
                          </div>

                          <div className="min-w-0 flex-1">
                            <p
                              className={[
                                "text-sm font-semibold",
                                active
                                  ? "text-teal-700"
                                  : "text-slate-700",
                              ].join(" ")}
                            >
                              {item.label}
                            </p>

                            <p className="mt-0.5 truncate text-[11px] text-slate-400">
                              {item.description}
                            </p>
                          </div>

                          <FiChevronLeft
                            size={15}
                            className="text-slate-300 transition group-hover:text-teal-500"
                          />
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  <div className="px-6 py-12 text-center">
                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-400">
                      <FiSearch size={20} />
                    </div>

                    <p className="mt-3 text-sm font-semibold text-slate-700">
                      لا توجد نتائج
                    </p>

                    <p className="mt-1 text-xs text-slate-400">
                      جرّب البحث باسم صفحة أو وظيفة أخرى.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}