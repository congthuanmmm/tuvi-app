import { CONTACT_EMAIL } from "@/components/SiteFooter";
import { FAQ } from "@/lib/content";
import { SITE_DESCRIPTION, SITE_NAME, SITE_URL } from "@/lib/site";
import { PALACE_INFO } from "@/lib/ziwei/palaces";

export const dynamic = "force-static";

export function GET() {
  const body = `# ${SITE_NAME}

> ${SITE_DESCRIPTION}

${SITE_NAME} là ứng dụng web tiếng Việt để lập lá số Tử Vi Đẩu Số (紫微斗数). Người dùng nhập ngày giờ sinh (dương lịch hoặc âm lịch, có tháng nhuận), giới tính và nơi sinh để nhận lá số 12 cung kèm tên sao, tên cung bằng chữ Hán, đại hạn 10 năm và lưu niên năm hiện tại. Người dùng đăng nhập bằng Google được AI luận giải lá số và hỏi thêm, tối đa 3 lượt mỗi ngày.

- Trường phái: Tam Hợp. Sinh sau 23h mặc định tính sang ngày hôm sau, có thể đổi trong tùy chọn nâng cao.
- Lá số được tính bằng thuật toán xác định có hơn 200 bài kiểm thử tự động. AI chỉ luận giải trên lá số đã tính, không tự an sao.
- Lập và xem lá số miễn phí, không giới hạn.
- Nội dung chỉ mang tính tham khảo, không thay thế tư vấn y tế, pháp lý hay tài chính.

## Trang chính

- [Trang chủ và lập lá số](${SITE_URL}/): form lập lá số, giới thiệu tính năng, ý nghĩa 12 cung, câu hỏi thường gặp
- [Chính sách bảo mật](${SITE_URL}/privacy): dữ liệu thu thập, bên thứ ba (Supabase, Google Gemini, Vercel), quyền xóa dữ liệu
- [Điều khoản sử dụng](${SITE_URL}/terms): giới hạn lượt dùng AI, miễn trừ trách nhiệm

## 12 cung trên lá số tử vi

${PALACE_INFO.map((p) => `- ${p.vi} (${p.han}): ${p.meaning}`).join("\n")}

## Câu hỏi thường gặp

${FAQ.map((f) => `### ${f.q}\n\n${f.a}`).join("\n\n")}

## Optional

- [Sitemap](${SITE_URL}/sitemap.xml)
- Liên hệ: ${CONTACT_EMAIL}
`;
  return new Response(body, {
    headers: { "Content-Type": "text/markdown; charset=utf-8", "Cache-Control": "public, max-age=3600" },
  });
}
