import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Sidebar } from "@/components/layout/sidebar";
import { DemoProvider } from "@/lib/demo-context";
import { PinProvider } from "@/lib/pin-context";
import { AppShell } from "@/components/layout/app-shell";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Zenan Fleet",
  description: "Truck fleet management and tracking",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body className="min-h-screen bg-background font-sans antialiased">
        <PinProvider>
          <AppShell>
            <DemoProvider>
              <div className="flex min-h-screen">
                <Sidebar />
                <main className="flex-1 overflow-auto">
                  <div className="container mx-auto p-6">{children}</div>
                </main>
              </div>
            </DemoProvider>
          </AppShell>
        </PinProvider>
      </body>
    </html>
  );
}
