import Link from "next/link";

export default function LegalPage({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <main className="mx-auto max-w-3xl px-4 py-10 text-stone-800">
      <Link href="/" className="text-sm text-red-900 hover:underline">← Về trang chủ</Link>
      <h1 className="mt-4 text-2xl font-bold text-red-900">{title}</h1>
      <div className="prose-reading mt-4 leading-relaxed">{children}</div>
      <p className="mt-8 text-sm text-stone-500">Cập nhật: 22/11/2026. Liên hệ: phamcongthuannb@gmail.com</p>
    </main>
  );
}
