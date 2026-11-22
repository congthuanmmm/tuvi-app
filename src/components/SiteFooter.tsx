import Link from "next/link";
import { Mail } from "lucide-react";

export const CONTACT_EMAIL = "congthuanmmm@gmail.com";

export default function SiteFooter() {
  return (
    <footer className="mt-16 bg-ink text-stone-300">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 md:grid-cols-[1.5fr_1fr_1fr]">
        <div>
          <div className="flex items-center gap-2.5">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo-mark.png" alt="" width={40} height={40} className="rounded-lg ring-1 ring-gold/30" />
            <span className="font-serif text-lg font-bold text-gold">Lá Số Việt</span>
          </div>
          <p className="mt-3 max-w-sm text-sm leading-relaxed">
            Lập lá số Tử Vi Đẩu Số phái Tam Hợp và luận giải bằng AI. Lá số chỉ mang tính tham khảo, không thay thế tư vấn y tế, pháp lý hay tài chính.
          </p>
        </div>
        <div>
          <h2 className="text-sm font-semibold text-white">Liên hệ</h2>
          <a href={`mailto:${CONTACT_EMAIL}`} className="mt-3 flex items-center gap-2 text-sm transition-colors hover:text-gold">
            <Mail size={16} aria-hidden="true" /> {CONTACT_EMAIL}
          </a>
        </div>
        <div>
          <h2 className="text-sm font-semibold text-white">Thông tin</h2>
          <ul className="mt-3 space-y-2 text-sm">
            <li><Link href="/privacy" className="transition-colors hover:text-gold">Chính sách bảo mật</Link></li>
            <li><Link href="/terms" className="transition-colors hover:text-gold">Điều khoản sử dụng</Link></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10 py-4 text-center text-xs text-stone-400">
        © {new Date().getFullYear()} Lá Số Việt. Thuật toán an sao dựa trên{" "}
        <a href="https://github.com/FANzR-arch/Numerologist_skills" className="underline hover:text-gold" target="_blank" rel="noreferrer">Numerologist_skills</a>.
      </div>
    </footer>
  );
}
