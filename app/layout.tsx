import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import "@uiw/react-md-editor/markdown-editor.css";
import { Toaster } from "@/components/ui/toaster";
import { preload } from "react-dom";
import { ClientErrorBoundary } from "@/components/ErrorBoundary";
import { ClerkProvider } from "@clerk/nextjs";
import PerformanceMonitor from "@/components/PerformanceMonitor";
import QueryProvider from "@/components/providers/QueryProvider";

const workSans = localFont({
  src: [
    {
      path: "./fonts/WorkSans-Black.ttf",
      weight: "900",
      style: "normal",
    },
    {
      path: "./fonts/WorkSans-ExtraBold.ttf",
      weight: "800",
      style: "normal",
    },
    {
      path: "./fonts/WorkSans-Bold.ttf",
      weight: "700",
      style: "normal",
    },
    {
      path: "./fonts/WorkSans-SemiBold.ttf",
      weight: "600",
      style: "normal",
    },
    {
      path: "./fonts/WorkSans-Medium.ttf",
      weight: "500",
      style: "normal",
    },
    {
      path: "./fonts/WorkSans-Regular.ttf",
      weight: "400",
      style: "normal",
    },
    {
      path: "./fonts/WorkSans-Black.ttf",
      weight: "900",
      style: "normal",
    },
    {
      path: "./fonts/WorkSans-Thin.ttf",
      weight: "200",
      style: "normal",
    },
    {
      path: "./fonts/WorkSans-ExtraLight.ttf",
      weight: "100",
      style: "normal",
    },
  ],
  variable: "--font-work-sans",
});

export const metadata: Metadata = {
  title: "YC Directory",
  description: "Pitch, Vote and Grow",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // React 19 resource preloading for better performance
  // Note: CSS files are automatically handled by Next.js, so we don't need to preload them manually

  return (
    <ClerkProvider>
      <html lang="en">
        {/* suppressHydrationWarning prevents hydration errors from browser extensions like Grammarly */}
        <body className={workSans.variable} suppressHydrationWarning={true}>
          <ClientErrorBoundary>
            <QueryProvider>
              <PerformanceMonitor />
              {children}
              <Toaster />
            </QueryProvider>
          </ClientErrorBoundary>
        </body>
      </html>
    </ClerkProvider>
  );
}
