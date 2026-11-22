import type { Metadata } from "next";
import { Be_Vietnam_Pro, Noto_Sans_SC } from "next/font/google";
import "./globals.css";

const font = Be_Vietnam_Pro({
  variable: "--font-be-vietnam",
  subsets: ["latin", "vietnamese"],
  weight: ["400", "500", "600", "700"],
});

const hanFont = Noto_Sans_SC({
  variable: "--font-noto-sc",
  weight: ["400", "700"],
  preload: false,
});

export const metadata: Metadata = {
  title: "Tử Vi Đẩu Số - Lập lá số & luận giải AI",
  description: "Lập lá số Tử Vi Đẩu Số phái Tam Hợp, luận giải bằng AI, tiếng Việt kèm chữ Hán.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi">
      <body className={`${font.variable} ${hanFont.variable} antialiased`}>{children}</body>
    </html>
  );
}
