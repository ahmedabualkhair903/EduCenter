import type { Metadata } from "next";
import { Cairo } from "next/font/google";

import "./globals.css";

import DashboardShell from "@/components/layout/DashboardShell";
import { AppSettingsProvider } from "@/components/providers";

const cairo = Cairo({
  variable: "--font-cairo",
  subsets: ["arabic"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "مَنارة | إدارة المركز",
    template: "%s | مَنارة",
  },
  description: "نظام إدارة المركز التعليمي",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ar"
      dir="rtl"
      className={cairo.variable}
    >
      <body className="min-h-screen antialiased">
        <AppSettingsProvider>
          <DashboardShell>{children}</DashboardShell>
        </AppSettingsProvider>
      </body>
    </html>
  );
}