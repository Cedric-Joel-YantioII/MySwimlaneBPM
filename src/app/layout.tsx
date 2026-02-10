import type { Metadata, Viewport } from "next";
import { Sidebar } from "@/components/layout/sidebar";
import { ClientProviders } from "@/components/layout/client-providers";
import "./globals.css";

export const metadata: Metadata = {
  title: "EvalFlow - Swimlane BPM",
  description: "BPMN swimlane-driven evaluation management platform",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#2563EB",
};

const themeScript = `
(function() {
  try {
    var stored = localStorage.getItem('theme');
    var theme = stored || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    document.documentElement.setAttribute('data-theme', theme);
  } catch(e) {}
})();
`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="min-h-screen flex">
        <Sidebar />
        <ClientProviders>
          <main className="flex-1 min-h-screen p-4 pt-18 lg:p-6 lg:pt-6 overflow-x-hidden">
            {children}
          </main>
        </ClientProviders>
      </body>
    </html>
  );
}
