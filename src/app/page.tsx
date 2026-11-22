import Link from "next/link";
import { CalendarRange, LayoutGrid, MessageCircle, ShieldCheck, Sparkles } from "lucide-react";
import HeroForm from "@/components/HeroForm";
import Reveal from "@/components/Reveal";
import { PALACE_INFO } from "@/lib/ziwei/palaces";

const FEATURES = [
  { icon: LayoutGrid, title: "Lá số 12 cung", text: "An đủ 14 chính tinh, phụ tinh, tứ hóa và độ sáng theo phái Tam Hợp, kèm tên chữ Hán." },
  { icon: Sparkles, title: "Luận giải bằng AI", text: "Bài phân tích có cấu trúc: tổng quan, tính cách, sự nghiệp, tình cảm, tài lộc." },
  { icon: CalendarRange, title: "Đại hạn & lưu niên", text: "Xem bạn đang ở đại hạn nào, tứ hóa đại hạn và lưu niên năm nay." },
  { icon: MessageCircle, title: "Hỏi thêm với AI", text: "Đặt câu hỏi riêng về lá số của bạn, AI trả lời dựa trên chính lá số đó." },
];

const STEPS = [
  { title: "Nhập ngày giờ sinh", text: "Dương lịch hoặc âm lịch, giờ chính xác hoặc theo canh giờ." },
  { title: "Xem lá số 12 cung", text: "Bấm vào từng cung để xem chi tiết các sao và đại hạn." },
  { title: "Luận giải và hỏi thêm", text: "Đăng nhập bằng Google để nhận 3 lượt AI miễn phí mỗi ngày." },
];

const FAQ = [
  { q: "Lập lá số có mất phí không?", a: "Lập và xem lá số hoàn toàn miễn phí, không giới hạn. Luận giải và hỏi đáp bằng AI được 3 lượt miễn phí mỗi ngày cho mỗi tài khoản." },
  { q: "Cần thông tin gì để lập lá số?", a: "Ngày tháng năm sinh (dương hoặc âm lịch), giờ sinh và giới tính. Họ tên và nơi sinh không bắt buộc." },
  { q: "Không nhớ giờ sinh chính xác thì sao?", a: "Bạn có thể chọn theo canh giờ (Tý, Sửu, Dần...). Nếu giờ sinh nằm sát ranh giới hai canh giờ, app sẽ nhắc bạn lập thêm lá số giờ liền kề để đối chiếu." },
  { q: "Lá số được tính theo trường phái nào?", a: "Phái Tam Hợp. Sinh sau 23h mặc định tính sang ngày hôm sau, bạn có thể đổi trong mục Tùy chọn nâng cao. Thuật toán có hơn 200 bài kiểm thử tự động." },
  { q: "AI luận giải dựa trên gì?", a: "AI chỉ đọc lá số đã được tính sẵn và các quy tắc luận giải Tử Vi, không tự an sao lại. Nội dung mang tính tham khảo, không thay thế tư vấn chuyên môn." },
  { q: "Thông tin của tôi có được bảo mật không?", a: "Lá số chỉ hiển thị với chính tài khoản của bạn và bạn có thể xóa bất cứ lúc nào. Xem chi tiết trong Chính sách bảo mật." },
];

export default function Home() {
  return (
    <main>
      <section className="relative overflow-hidden">
        <div aria-hidden="true" className="pointer-events-none absolute -right-40 -top-40 h-[520px] w-[520px] rounded-full bg-gold/25 blur-3xl" />
        <div className="relative mx-auto grid max-w-6xl items-start gap-10 px-4 py-10 md:py-16 lg:grid-cols-[1.1fr_1fr]">
          <div className="lg:pt-8">
            <p className="inline-flex items-center gap-2 rounded-full bg-ink/5 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-ink">
              Tử Vi Đẩu Số 紫微斗数 · Phái Tam Hợp
            </p>
            <h1 className="mt-4 font-serif text-4xl font-bold leading-tight text-ink sm:text-5xl">
              Lập lá số tử vi chuẩn xác, luận giải bằng AI
            </h1>
            <p className="mt-4 max-w-xl text-lg leading-relaxed text-stone-700">
              Nhập ngày giờ sinh để xem lá số 12 cung, đại hạn và lưu niên. AI luận giải bằng tiếng Việt, giữ tên sao và cung bằng chữ Hán.
            </p>
            <ul className="mt-6 flex flex-wrap gap-x-6 gap-y-2 text-sm text-stone-700">
              <li className="flex items-center gap-2"><ShieldCheck size={18} className="text-gold-deep" aria-hidden="true" />Lập lá số miễn phí</li>
              <li className="flex items-center gap-2"><Sparkles size={18} className="text-gold-deep" aria-hidden="true" />3 lượt AI mỗi ngày</li>
              <li className="flex items-center gap-2"><LayoutGrid size={18} className="text-gold-deep" aria-hidden="true" />Kèm tên chữ Hán</li>
            </ul>
          </div>
          <div id="lap-la-so" className="scroll-mt-24 rounded-2xl border border-line bg-paper p-5 shadow-xl sm:p-6">
            <h2 className="mb-4 font-serif text-xl font-bold text-ink">Thông tin lá số</h2>
            <HeroForm />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-12">
        <Reveal><h2 className="font-serif text-3xl font-bold text-ink">Bạn nhận được gì</h2></Reveal>
        <p className="mt-2 text-stone-700">Một lá số đầy đủ và bài luận giải dễ hiểu cho người không chuyên.</p>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map(({ icon: Icon, title, text }, i) => (
            <Reveal key={title} delay={i * 90} className="rounded-2xl border border-line bg-paper p-5">
              <span className="grid h-11 w-11 place-items-center rounded-xl bg-ink text-gold"><Icon size={22} aria-hidden="true" /></span>
              <h3 className="mt-4 font-semibold text-ink">{title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-stone-700">{text}</p>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-12">
        <Reveal><h2 className="font-serif text-3xl font-bold text-ink">3 bước để xem lá số</h2></Reveal>
        <ol className="mt-8 grid gap-4 md:grid-cols-3">
          {STEPS.map((s, i) => (
            <Reveal as="li" key={s.title} delay={i * 120} className="flex gap-4 rounded-2xl border border-line bg-paper p-5">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-gold font-serif text-lg font-bold text-ink">{i + 1}</span>
              <div>
                <h3 className="font-semibold text-ink">{s.title}</h3>
                <p className="mt-1 text-sm leading-relaxed text-stone-700">{s.text}</p>
              </div>
            </Reveal>
          ))}
        </ol>
      </section>

      <section id="12-cung" className="mx-auto max-w-6xl scroll-mt-20 px-4 py-12">
        <Reveal className="rounded-3xl border border-line bg-paper p-6 sm:p-10">
          <h2 className="font-serif text-3xl font-bold text-ink">Lá số tử vi là gì?</h2>
          <div className="mt-4 max-w-3xl space-y-3 leading-relaxed text-stone-700">
            <p>
              Lá số tử vi là bản đồ các sao tại thời điểm bạn sinh ra, dựa trên năm, tháng, ngày, giờ sinh âm lịch và giới tính.
              Chính tinh, phụ tinh và tứ hóa được an vào 12 cung, mỗi cung ứng với một lĩnh vực trong đời sống.
            </p>
            <p>Cung Mệnh cho biết bản chất của bạn. Các cung còn lại nói về những mối quan hệ và chặng đường khác nhau, kết hợp với đại hạn 10 năm và lưu niên từng năm.</p>
          </div>
          <h3 className="mt-8 font-semibold text-ink">12 cung trên lá số nói về điều gì</h3>
          <ul className="mt-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
            {PALACE_INFO.map((p) => (
              <li key={p.han} className="rounded-xl bg-background/70 p-4">
                <p className="font-semibold text-ink">{p.vi} <span className="text-sm font-normal text-stone-500">{p.han}</span></p>
                <p className="mt-1 text-sm text-stone-700">{p.meaning}</p>
              </li>
            ))}
          </ul>
        </Reveal>
      </section>

      <section id="hoi-dap" className="mx-auto max-w-3xl scroll-mt-20 px-4 py-12">
        <h2 className="text-center font-serif text-3xl font-bold text-ink">Câu hỏi thường gặp</h2>
        <Reveal className="mt-8 divide-y divide-line rounded-2xl border border-line bg-paper">
          {FAQ.map((f) => (
            <details key={f.q} className="group px-5">
              <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-4 py-3 font-medium text-ink [&::-webkit-details-marker]:hidden">
                {f.q}
                <span aria-hidden="true" className="text-xl text-gold-deep transition-transform group-open:rotate-45">+</span>
              </summary>
              <p className="pb-4 leading-relaxed text-stone-700">{f.a}</p>
            </details>
          ))}
        </Reveal>
      </section>

      <section className="mx-auto max-w-6xl px-4 pt-6">
        <Reveal className="flex flex-col items-center gap-5 rounded-3xl bg-ink px-6 py-10 text-center sm:flex-row sm:justify-between sm:px-10 sm:text-left">
          <div>
            <h2 className="font-serif text-2xl font-bold text-gold sm:text-3xl">Xem lá số của bạn ngay</h2>
            <p className="mt-2 text-stone-300">Miễn phí, chỉ cần ngày giờ sinh.</p>
          </div>
          <Link href="/#lap-la-so" className="rounded-xl bg-gold px-6 py-3 font-semibold text-ink transition-opacity hover:opacity-90">
            Lập lá số
          </Link>
        </Reveal>
      </section>
    </main>
  );
}
