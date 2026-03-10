import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Celato — Bionic Director",
  description: "Real-time collaborative voice agent for phone calls",
};

export default function RootLayout({ children }: { children: React.ReactNode }): React.JSX.Element {
  return (
    <html lang="en">
      <body className="bg-gray-50 text-gray-900 antialiased">{children}</body>
    </html>
  );
}
