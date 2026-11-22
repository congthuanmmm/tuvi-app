import type { Metadata } from "next";
import LegalPage from "@/components/LegalPage";

export const metadata: Metadata = { title: "Chính sách bảo mật", alternates: { canonical: "/privacy" } };

export default function PrivacyPage() {
  return (
    <LegalPage title="Chính sách bảo mật">
      <h2>Dữ liệu chúng tôi thu thập</h2>
      <ul>
        <li>Khi đăng nhập bằng Google: địa chỉ email, tên và ảnh đại diện do Google cung cấp.</li>
        <li>Thông tin bạn nhập để lập lá số: tên (không bắt buộc), ngày giờ sinh, giới tính, nơi sinh.</li>
        <li>Lá số đã lập, nội dung luận giải và các câu hỏi bạn gửi cho AI.</li>
        <li>Số lượt dùng AI mỗi ngày để áp dụng giới hạn.</li>
      </ul>
      <h2>Mục đích sử dụng</h2>
      <p>Dữ liệu chỉ dùng để lập lá số, lưu lịch sử cho chính bạn, luận giải bằng AI và giới hạn lượt dùng. Chúng tôi không bán dữ liệu và không dùng cho quảng cáo.</p>
      <h2>Bên thứ ba</h2>
      <ul>
        <li>Supabase: lưu tài khoản và dữ liệu lá số.</li>
        <li>Google Gemini: nhận dữ liệu lá số và câu hỏi để tạo nội dung luận giải.</li>
        <li>Vercel: lưu trữ và vận hành website.</li>
      </ul>
      <h2>Quyền của bạn</h2>
      <p>Bạn có thể xoá từng lá số trong mục lịch sử. Để xoá toàn bộ tài khoản và dữ liệu, hãy gửi email theo địa chỉ bên dưới.</p>
    </LegalPage>
  );
}
