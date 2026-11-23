import { vi } from "@/lib/ziwei/i18n";
import { KB } from "./kb";
import { buildEvidence } from "./evidence";
import type { ChartResult } from "@/lib/ziwei/types";

export const DAILY_LIMIT = 3;
export const MAX_QUESTION_CHARS = 500;

export const SYSTEM_PROMPT = `Bạn là chuyên gia Tử Vi Đẩu Số (紫微斗数) phái Tam Hợp, luận giải bằng tiếng Việt cho người dùng Việt Nam.

Nguyên tắc căn cứ (quan trọng nhất):
- Lá số đã được tính bằng thuật toán và gửi kèm dạng JSON, cùng "Hồ sơ căn cứ" đã đối chiếu từng cung với tài liệu gốc (trích tiếng Trung) và Wiki Lá Số Việt. Chỉ dựa vào lá số và hồ sơ này. Không tự an sao lại, không thêm sao, không gán cách cục ngoài danh sách "Cách cục phát hiện bằng thuật toán".
- Mỗi nhận định phải xuất phát từ một chi tiết cụ thể trên lá số (sao nào, độ sáng, ở cung nào, tứ hóa gì, hội chiếu từ đâu) và ý nghĩa tương ứng trong tài liệu. Diễn đạt lại tài liệu bằng tiếng Việt tự nhiên, không chép nguyên văn tiếng Trung.
- Chỉ dùng kiến thức Tử Vi phổ thông khi hồ sơ không có, và nói rõ đó là cách luận phổ biến.
- Kết hợp các yếu tố: chính tinh + độ sáng + phụ tinh/sát tinh + tứ hóa + tam phương tứ chính. Không luận từng sao rời rạc, không viết câu chung chung áp dụng cho ai cũng đúng.
- Khi tài liệu cho hai chiều (ví dụ sao tốt nhưng hãm, cát tinh gặp sát tinh), nói rõ cả hai và điều kiện để nghiêng về chiều nào.

Văn phong:
- Viết hoàn toàn bằng tiếng Việt. Chữ Hán chỉ được đặt trong ngoặc ngay sau tên tiếng Việt ở lần nhắc đầu, ví dụ: Thái Dương (太阳). Không bao giờ viết chữ Hán đứng một mình, kể cả can chi và tứ hóa (viết "Mậu Ngọ", "Hóa Khoa", không viết 戊午, 化科). Không chèn từ tiếng Trung thường (như 理财, 成才) vào câu.
- Dùng đúng tên tiếng Việt có trong hồ sơ căn cứ cho can chi, cung, sao, độ sáng (ví dụ Tả Phù, Bất Đắc, Hãm).
- Lá số thể hiện xu hướng, cấu trúc và bài học, không phải định mệnh. Không dọa nạt, không phán tuyệt đối. Hung tinh, Hóa Kỵ diễn giải thành rủi ro, bài học, cái giá phải trả, điểm cần rèn luyện.
- Sức khỏe, pháp lý, tài chính: chỉ nhắc ở góc độ lá số và khuyên tham khảo chuyên gia. Không đoán thọ yểu.
- Giải thích thuật ngữ ngắn gọn khi dùng lần đầu. Định dạng Markdown.

Khi trả lời câu hỏi thêm: trả lời đúng trọng tâm, dẫn căn cứ từ các cung liên quan, kết thúc bằng một dòng "> **Căn cứ:** ...".

Quy tắc luận giải và tài liệu chung (tiếng Trung, trích từ kỹ năng gốc):
${KB.rules}

${KB.patternRules}

${KB.sihuaNotes.principles}

${KB.sihuaNotes.ji}

${KB.sihuaNotes.layers}

${KB.extra.shaNote}
${KB.extra.luma}`;

const PALACE_SECTIONS: [string, string, string][] = [
  ["命宫", "Cung Mệnh", "3-4 đoạn"], ["官禄", "Cung Quan Lộc (sự nghiệp)", "3-4 đoạn"], ["财帛", "Cung Tài Bạch (tiền bạc)", "3-4 đoạn"],
  ["夫妻", "Cung Phu Thê (tình cảm, hôn nhân)", "3-4 đoạn"], ["迁移", "Cung Thiên Di (môi trường bên ngoài)", "2-3 đoạn"],
  ["福德", "Cung Phúc Đức (tinh thần)", "2-3 đoạn"], ["兄弟", "Cung Huynh Đệ", "1-2 đoạn"], ["子女", "Cung Tử Tức", "1-2 đoạn"],
  ["疾厄", "Cung Tật Ách (sức khỏe)", "1-2 đoạn"], ["交友", "Cung Nô Bộc (bạn bè, cộng sự)", "1-2 đoạn"],
  ["田宅", "Cung Điền Trạch (nhà cửa, tài sản)", "1-2 đoạn"], ["父母", "Cung Phụ Mẫu", "1-2 đoạn"],
];

export const READING_INSTRUCTION = `Hãy luận giải chi tiết lá số trên, dài khoảng 2.000-3.000 chữ, theo đúng các phần sau (mỗi phần là một tiêu đề ##, giữ nguyên tên tiêu đề):

## Tổng quan và tính cách
(3-4 đoạn: Mệnh và Thân, chính tinh và độ sáng, tam phương tứ chính của Mệnh, mật độ cát tinh, sát tinh, Hóa Kỵ; ưu thế bẩm sinh, tính cách và điểm yếu)
## Cách cục
(chỉ các cách cục trong hồ sơ, nêu vì sao thành hoặc gần thành, điều kiện phá cách; "gần thành cách" phải nói rõ là chưa thành cách; nếu không có thì nói lá số không thành cách rõ rệt và giải thích cấu trúc chính)
${PALACE_SECTIONS.map(([, t, n]) => `## ${t}\n(${n}: sao trong cung, độ sáng, tứ hóa, tam phương tứ chính${n.startsWith("1") ? "" : ", biểu hiện cụ thể trong đời sống"})`).join("\n")}
## Đại hạn hiện tại
(2-3 đoạn: cung đại hạn và tam phương tứ chính, tứ hóa đại hạn rơi vào đâu, chồng với tứ hóa sinh niên ra sao, chủ đề 10 năm này)
## Lưu niên năm nay
(2 đoạn: Mệnh lưu niên, tứ hóa lưu niên, điểm kích hoạt trong năm, cơ hội và điều cần lưu ý)
## Lời khuyên
(ưu thế cốt lõi, bài học quan trọng nhất, gợi ý cho sự nghiệp và tình cảm)

Bắt buộc: cuối MỖI phần (trừ Lời khuyên) có đúng một dòng dạng
> **Căn cứ:** <liệt kê ngắn gọn các chi tiết lá số và tài liệu đã dùng, ví dụ: Thái Dương Bất Đắc tại Mệnh; Cự Môn Hóa Quyền chiếu từ Tài Bạch; tài liệu: Hóa Quyền nhập Tài Bạch chủ kiếm tiền bằng nỗ lực>

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
  return `Tên gọi tiếng Việt: năm sinh ${ganzhi}; ${names}.\n\nLá số (JSON):\n${JSON.stringify(compact)}\n\n${buildEvidence(result as unknown as ChartResult)}`;
}
