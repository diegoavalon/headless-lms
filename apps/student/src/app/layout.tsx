import type { ReactNode } from "react";
import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { AppProvider } from "@/lib/store";
import { StudentTheme } from "@/lib/theme";
import { Toast } from "@/components/primitives/toast";

// Self-hosted Pretendard variable font (best practice: no FOUT, no layout shift).
const pretendard = localFont({
  src: "../fonts/PretendardVariable.woff2",
  display: "swap",
  weight: "45 920",
  variable: "--font-pretendard",
});

export const metadata: Metadata = {
  title: "Headless LMS — Your courses",
  description: "Student course platform for a headless LMS.",
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="en" className={pretendard.variable} suppressHydrationWarning>
      <body>
        <StudentTheme />
        <AppProvider>
          {children}
          <Toast />
        </AppProvider>
      </body>
    </html>
  );
}
