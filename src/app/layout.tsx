import type { Metadata } from "next";
import { Be_Vietnam_Pro, Noto_Sans_SC, Noto_Serif } from "next/font/google";
import LoginProvider from "@/components/LoginProvider";
import SiteFooter from "@/components/SiteFooter";
import SiteHeader from "@/components/SiteHeader";
import "./globals.css";

const font = Be_Vietnam_Pro({
  variable: "--font-be-vietnam",
  subsets: ["latin", "vietnamese"],
  weight: ["400", "500", "600", "700"],
});

const serif = Noto_Serif({
  variable: "--font-noto-serif",
  subsets: ["latin", "vietnamese"],
  weight: ["600", "700"],
});

const hanFont = Noto_Sans_SC({
  variable: "--font-noto-sc",
  weight: ["400", "700"],
  preload: false,
});

export const metadata: Metadata = {
  title: "Lá Số Việt - Lập lá số Tử Vi & luận giải AI",
  description: "Lập lá số Tử Vi Đẩu Số phái Tam Hợp, luận giải 12 cung bằng AI, tiếng Việt kèm tên sao chữ Hán.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="vi" className={`${font.variable} ${serif.variable} ${hanFont.variable}`}>
      <head>
        <noscript>
          <style>{".reveal{opacity:1!important;transform:none!important}"}</style>
        </noscript>
      </head>
      <body className="flex min-h-screen flex-col antialiased">
        <LoginProvider>
          <SiteHeader />
          <div className="flex-1">{children}</div>
          <SiteFooter />
        </LoginProvider>
      </body>
    </html>
  );
}
