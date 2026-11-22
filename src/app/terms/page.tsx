import type { Metadata } from "next";
import LegalPage from "@/components/LegalPage";

export const metadata: Metadata = { title: "Điều khoản sử dụng", alternates: { canonical: "/terms" } };

export default function TermsPage() {
  return (
    <LegalPage title="Điều khoản sử dụng">
      <ul>
        <li>Lá số và nội dung luận giải chỉ mang tính tham khảo, giải trí. Chúng không thay thế tư vấn y tế, pháp lý hay tài chính.</li>
        <li>Nội dung luận giải do AI tạo ra nên có thể sai sót. Bạn tự chịu trách nhiệm với quyết định của mình.</li>
        <li>Mỗi tài khoản được dùng AI tối đa 3 lượt mỗi ngày. Không được lạm dụng, tự động hoá hay tìm cách vượt giới hạn.</li>
        <li>Chúng tôi có thể thay đổi, tạm dừng dịch vụ hoặc khoá tài khoản vi phạm mà không cần báo trước.</li>
      </ul>
    </LegalPage>
  );
}
