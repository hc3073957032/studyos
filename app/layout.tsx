import type { Metadata } from "next";

import "./globals.css";

export const metadata: Metadata = {
  title: "StudyOS",
  description: "A calm personal learning operating system.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" data-scroll-behavior="smooth">
      <body>{children}</body>
    </html>
  );
}
