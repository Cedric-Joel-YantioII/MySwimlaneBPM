import type { Metadata, Viewport } from "next";
import { Sidebar } from "@/components/layout/sidebar";
import "./globals.css";

export const metadata: Metadata = {
  title: "EvalFlow - Swimlane BPM",
  description: "BPMN swimlane-driven evaluation management platform",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#0A84FF",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen flex">
        <Sidebar />
        <main className="flex-1 min-h-screen p-4 lg:p-6 overflow-x-hidden">
          {children}
        </main>
      </body>
    </html>
  );
}
