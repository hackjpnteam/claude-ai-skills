import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "hackjpn Skills Marketplace",
  description: "hackjpnのClaude Code向けAIスキルを無料公開。",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body>{children}</body>
    </html>
  );
}
