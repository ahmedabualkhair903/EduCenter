"use client";

import { usePathname } from "next/navigation";
import { useState } from "react";

import Header from "./Header";
import Sidebar from "./Sidebar";

type DashboardShellProps = {
  children: React.ReactNode;
};

export default function DashboardShell({
  children,
}: DashboardShellProps) {
  const pathname = usePathname();

  const [sidebarOpen, setSidebarOpen] = useState(false);

  const isAuthPage = pathname === "/login";

  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  const toggleSidebar = () => {
    setSidebarOpen((current) => !current);
  };

  /*
   * Authentication pages should not contain
   * the dashboard layout.
   */
  if (isAuthPage) {
    return <>{children}</>;
  }

  return (
    <div
      className="min-h-screen bg-slate-50"
      dir="rtl"
    >
      <div className="min-h-screen lg:flex">
        <Sidebar
          mobileOpen={sidebarOpen}
          onClose={closeSidebar}
        />

        <div className="min-w-0 flex-1">
          <Header onMenuClick={toggleSidebar} />

          <main className="min-w-0">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}