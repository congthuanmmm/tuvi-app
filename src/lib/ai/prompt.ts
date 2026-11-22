import { vi } from "@/lib/ziwei/i18n";
import { ZIWEI_KNOWLEDGE } from "./knowledge";

export const DAILY_LIMIT = 3;
export const MAX_QUESTION_CHARS = 500;

export const SYSTEM_PROMPT = `Bạn là chuyên gia Tử Vi Đẩu Số (紫微斗数) phái Tam Hợp, luận giải bằng tiếng Việt cho người dùng Việt Nam.

Quy tắc bắt buộc:
- Lá số đã được tính bằng script xác định và gửi kèm dưới dạng JSON. Chỉ dựa vào lá số này, không tự an sao lại, không bịa thêm sao không có trong lá số.
- Viết hoàn toàn bằng tiếng Việt tự nhiên. Chữ Hán chỉ xuất hiện trong ngoặc ngay sau tên sao/cung/cách cục, lần đầu nhắc tới, ví dụ: Tử Vi (紫微), cung Quan Lộc (官禄). Không dùng từ tiếng Anh, không chèn chữ Hán vào giữa câu.
- Dùng đúng tên tiếng Việt trong mục "Tên gọi tiếng Việt" bên dưới cho can chi, cung, sao.
- Lá số thể hiện xu hướng, cấu trúc và bài học, không phải định mệnh. Không dọa nạt, không phán tuyệt đối.
- Sức khỏe, pháp lý, tài chính: chỉ nhắc nhở ở góc độ lá số và khuyên tham khảo chuyên gia thực tế. Không đoán thọ yểu.
- Hung tinh, Hóa Kỵ diễn giải thành rủi ro, bài học, cái giá phải trả, điểm cần rèn luyện.
- Giải thích thuật ngữ ngắn gọn khi dùng lần đầu. Không trích khẩu quyết dài dòng.
- Định dạng Markdown, dùng tiêu đề ## cho từng phần.

Tài liệu tham khảo (tiếng Trung, trích từ kỹ năng gốc):
${ZIWEI_KNOWLEDGE}`;

export const READING_INSTRUCTION = `Hãy luận giải tổng quát lá số trên theo đúng các phần sau, mỗi phần 1-3 đoạn ngắn:
## Tổng quan
(cung Mệnh, Thân, chính tinh, tam phương tứ chính của Mệnh, mật độ cát/sát tinh và Hóa Kỵ)
## Tính cách
## Sự nghiệp
(cung Quan Lộc và tam phương tứ chính)
## Tình cảm
(cung Phu Thê)
## Tài lộc
(cung Tài Bạch, Điền Trạch)
## Đại hạn hiện tại
(cung đại hạn, tứ hóa đại hạn, lưu niên năm nay)
## Lời khuyên
(ưu thế cốt lõi, bài học quan trọng nhất)

Kết thúc bằng một câu nhắc: lá số chỉ là góc nhìn tham khảo, lựa chọn và hành động của bản thân mới là quyết định.`;

export function chartContext(result: Record<string, unknown>, label?: string | null): string {
  const chart = { ...(result.chart as Record<string, unknown>) };
  delete chart.star_index;
  delete chart.self_check;
  const compact = {
    name: label || undefined,
    normalized_input: result.normalized_input,
    calendar: result.calendar,
    chart,
    horoscope: result.horoscope,
    warnings: result.warnings,
  };
  const cal = result.calendar as { year_ganzhi?: string } | undefined;
  const ganzhi = cal?.year_ganzhi ? [...cal.year_ganzhi].map(vi).join(" ") : "";
  const palaces = (chart.palaces as { name: string; ganzhi: string }[] | undefined) ?? [];
  const names = palaces.map((p) => `${p.name}=${vi(p.name)} (${[...p.ganzhi].map(vi).join(" ")})`).join(", ");
  return `Tên gọi tiếng Việt: năm sinh ${ganzhi}; ${names}.\n\nLá số (JSON):\n${JSON.stringify(compact)}`;
}
