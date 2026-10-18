import type { Metadata } from "next";
import "./globals.css";
import "./gallery.css";
import "./story.css";

export const metadata: Metadata = {
  title: "Ruang Setara — Hak & Kewajiban | Pendidikan Pancasila IX",
  description: "Jelajahi galeri tiga dimensi untuk memahami hak dan kewajiban, kasus sehari-hari, HAM, dan penegakan hukum. Perjalanan interaktif Pendidikan Pancasila untuk SMP kelas IX.",
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
    <html lang="id">
      <body className="antialiased">{children}</body>
    </html>
  );
}
