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

/*

* Authentication pages should not contain
* the dashboard layout.
  */
  const isAuthPage =
  pathname === "/login" ||
  pathname === "/register";

const closeSidebar = () => {
setSidebarOpen(false);
};

const toggleSidebar = () => {
setSidebarOpen((current) => !current);
};

if (isAuthPage) {
return <>{children}</>;
}

return ( <div
   className="min-h-screen bg-slate-50"
   dir="rtl"
 > <div className="min-h-screen lg:flex"> <Sidebar
       mobileOpen={sidebarOpen}
       onClose={closeSidebar}
     />

```
    <div className="flex min-w-0 flex-1 flex-col">
      <Header onMenuClick={toggleSidebar} />

      <main className="min-w-0 flex-1">
        {children}
      </main>
    </div>
  </div>
</div>


);
}
