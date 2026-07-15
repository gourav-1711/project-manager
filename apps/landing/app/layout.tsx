import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Dev Project Organizer — Stop losing time between projects, terminals, and IDEs",
  description:
    "A lightweight desktop app for managing dev projects. Quick launch, todos, error tracking, mobile sharing, skills management, and timeline planning — all in one place.",
  keywords: [
    "developer tools",
    "project manager",
    "productivity",
    "Tauri app",
    "desktop app",
    "dev tools",
  ],
  openGraph: {
    title: "Dev Project Organizer",
    description:
      "Stop losing time between projects, terminals, and IDEs.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable}`}
    >
      <body className="min-h-screen bg-background text-foreground antialiased">
        {children}
      </body>
    </html>
  );
}
