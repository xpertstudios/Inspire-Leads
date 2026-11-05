import type { Metadata } from "next";
import { MobileAppShell } from "@/components/mobile-app-shell";
import "./globals.css";

export const metadata: Metadata = {
  title: "Inspire Leads · Winsire Office",
  description: "Private daily lead capture and outreach tracking for Winsire Office.",
  manifest: "/manifest.webmanifest",
  applicationName: "Inspire Leads",
  appleWebApp: { capable: true, statusBarStyle: "black-translucent", title: "Inspire" },
  formatDetection: { telephone: false },
  themeColor: "#173f31",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}<MobileAppShell/></body>
    </html>
  );
}
