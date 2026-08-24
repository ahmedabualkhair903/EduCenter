"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  FiBookOpen,
  FiCalendar,
  FiCheckCircle,
  FiClock,
  FiDollarSign,
  FiFileText,
  FiGrid,
  FiLogOut,
  FiMessageCircle,
  FiSettings,
  FiUsers,
  FiX,
} from "react-icons/fi";
import { LuGraduationCap } from "react-icons/lu";

import { useAppSettings } from "@/components/providers";
import type { ModuleKey } from "@/types";

type SidebarProps = {
  mobileOpen: boolean;
  onClose: () => void;
};

type NavItem = {
  label: string;
  href: string;
  icon: React.ReactNode;
  module?: ModuleKey;
};

const mainItems: NavItem[] = [
  {
    label: "لوحة التحكم",
    href: "/dashboard",
    icon: <FiGrid size={18} />,
  },
];

const managementItems: NavItem[] = [
  {
    label: "الطلاب",
    href: "/students",
    icon: <FiUsers size={18} />,
    module: "students",
  },
  {
    label: "المجموعات",
    href: "/groups",
    icon: <FiBookOpen size={18} />,
    module: "groups",
  },
  {
    label: "الحضور والغياب",
    href: "/attendance",
    icon: <FiCheckCircle size={18} />,
    module: "attendance",
  },
  {
    label: "الحصص",
    href: "/lessons",
    icon: <FiCalendar size={18} />,
    module: "lessons",
  },
  {
    label: "الامتحانات والدرجات",
    href: "/exams",
    icon: <FiFileText size={18} />,
    module: "exams",
  },
  {
    label: "الحضور والانصراف",
    href: "/check-out",
    icon: <FiClock size={18} />,
    module: "checkOut",
  },
];

const financeItems: NavItem[] = [
  {
    label: "المدفوعات",
    href: "/payments",
    icon: <FiDollarSign size={18} />,
    module: "payments",
  },
];

const communicationItems: NavItem[] = [
  {
    label: "WhatsApp",
    href: "/messages",
    icon: <FiMessageCircle size={18} />,
    module: "whatsapp",
  },
  {
    label: "Excel",
    href: "/excel",
    icon: <FiFileText size={18} />,
    module: "excel",
  },
  {
    label: "التقارير",
    href: "/reports",
    icon: <FiFileText size={18} />,
    module: "reports",
  },
];

function isActivePath(
  pathname: string,
  href: string,
) {
  if (href === "/dashboard") {
    return pathname === href;
  }

  return (
    pathname === href ||
    pathname.startsWith(`${href}/`)
  );
}

export default function Sidebar({
  mobileOpen,
  onClose,
}: SidebarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { isModuleEnabled } = useAppSettings();

  const handleLogout = () => {
    onClose();

    // Frontend-only logout for now.
    // Backend authentication will be connected here later.
    router.replace("/login");
  };

  const renderItems = (items: NavItem[]) =>
    items
      .filter(
        (item) =>
          !item.module ||
          isModuleEnabled(item.module),
      )
      .map((item) => {
        const active = isActivePath(
          pathname,
          item.href,
        );

        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onClose}
            aria-current={
              active ? "page" : undefined
            }
            className={[
              "group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all",
              active
                ? "bg-teal-50 text-teal-700"
                : "text-slate-500 hover:bg-slate-50 hover:text-slate-800",
            ].join(" ")}
          >
            <span
              className={[
                "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition",
                active
                  ? "bg-white text-teal-600 shadow-sm"
                  : "bg-transparent text-slate-400 group-hover:text-slate-600",
              ].join(" ")}
            >
              {item.icon}
            </span>

            <span className="flex-1">
              {item.label}
            </span>

            {active && (
              <span
                className="h-1.5 w-1.5 rounded-full bg-teal-600"
                aria-hidden="true"
              />
            )}
          </Link>
        );
      });

  const settingsActive = isActivePath(
    pathname,
    "/settings",
  );

  return (
    <>
      {/* Mobile Overlay */}
      <div
        className={[
          "fixed inset-0 z-40 bg-slate-900/30 backdrop-blur-[2px] transition-opacity lg:hidden",
          mobileOpen
            ? "visible opacity-100"
            : "invisible opacity-0",
        ].join(" ")}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Sidebar */}
      <aside
        id="dashboard-sidebar"
        aria-label="القائمة الرئيسية"
        className={[
          "fixed inset-y-0 right-0 z-50 flex w-[280px] flex-col border-l border-slate-200 bg-white transition-transform duration-300 lg:sticky lg:top-0 lg:h-screen lg:translate-x-0",
          mobileOpen
            ? "translate-x-0"
            : "translate-x-full",
        ].join(" ")}
      >
        {/* Logo */}
        <div className="flex h-20 shrink-0 items-center justify-between border-b border-slate-100 px-5">
          <Link
            href="/dashboard"
            onClick={onClose}
            aria-label="مَنارة - لوحة التحكم"
            className="flex items-center gap-3"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-600 text-white shadow-sm">
              <LuGraduationCap
                size={22}
                strokeWidth={2}
                aria-hidden="true"
              />
            </div>

            <div>
             <p className="text-xl font-extrabold tracking-tight text-slate-900">
             مَنارة
              </p>

              <p className="mt-0.5 text-[10px] font-medium text-slate-400">
                نظام إدارة المركز
              </p>
            </div>
          </Link>

          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-100 lg:hidden"
            aria-label="إغلاق القائمة"
          >
            <FiX size={18} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-3 py-5">
          <NavSection title="الرئيسية">
            {renderItems(mainItems)}
          </NavSection>

          <NavSection title="إدارة المركز">
            {renderItems(managementItems)}
          </NavSection>

          <NavSection title="المالية">
            {renderItems(financeItems)}
          </NavSection>

          <NavSection title="التواصل والبيانات">
            {renderItems(communicationItems)}
          </NavSection>

          <NavSection title="الإعدادات">
            <Link
              href="/settings"
              onClick={onClose}
              aria-current={
                settingsActive ? "page" : undefined
              }
              className={[
                "group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all",
                settingsActive
                  ? "bg-teal-50 text-teal-700"
                  : "text-slate-500 hover:bg-slate-50 hover:text-slate-800",
              ].join(" ")}
            >
              <span
                className={[
                  "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg",
                  settingsActive
                    ? "bg-white text-teal-600 shadow-sm"
                    : "text-slate-400 group-hover:text-slate-600",
                ].join(" ")}
              >
                <FiSettings size={18} />
              </span>

              <span className="flex-1">
                الإعدادات
              </span>

              {settingsActive && (
                <span
                  className="h-1.5 w-1.5 rounded-full bg-teal-600"
                  aria-hidden="true"
                />
              )}
            </Link>
          </NavSection>
        </nav>

        {/* User / Logout */}
        <div className="shrink-0 border-t border-slate-100 p-3">
          <div className="mb-2 flex items-center gap-3 rounded-lg bg-slate-50 p-3">
            <div
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-teal-100 text-sm font-bold text-teal-700"
              aria-hidden="true"
            >
              م
            </div>

            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-bold text-slate-700">
                مدير المركز
              </p>

              <p className="mt-0.5 truncate text-[10px] text-slate-400">
                مسؤول النظام
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            className="group flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-500 transition hover:bg-red-50 hover:text-red-600 focus:outline-none focus:ring-2 focus:ring-red-100"
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-lg transition group-hover:bg-white">
              <FiLogOut size={17} />
            </span>

            تسجيل الخروج
          </button>
        </div>
      </aside>
    </>
  );
}

function NavSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mb-6">
      <p className="mb-2 px-3 text-[10px] font-bold tracking-wide text-slate-400">
        {title}
      </p>

      <div className="space-y-1">
        {children}
      </div>
    </div>
  );
}