import type { Metadata } from "next";

export const metadata: Metadata = { title: "Quản trị", robots: { index: false, follow: false }, alternates: { canonical: null } };

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
