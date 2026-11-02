import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Inspire Leads · Winsire Office",
  description: "Private daily lead capture and outreach tracking for Winsire Office.",
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
      <body className="antialiased">{children}</body>
    </html>
  );
}
