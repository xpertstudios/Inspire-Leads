import type { Metadata, Viewport } from "next";
import { MobileAppShell } from "@/components/mobile-app-shell";
import "./globals.css";

export const metadata: Metadata = {
  title: "Inspire Leads · WINSPIRE OFFICE",
  description: "Private daily lead capture and outreach tracking for WINSPIRE OFFICE.",
  manifest: "/manifest.webmanifest",
  applicationName: "Inspire Leads",
  appleWebApp: { capable: true, statusBarStyle: "black-translucent", title: "Inspire" },
  formatDetection: { telephone: false },
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export const viewport: Viewport = {
  themeColor: "#173f31",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
        <MobileAppShell />
      </body>
    </html>
  );
}
