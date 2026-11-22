const VI: Record<string, string> = {
  // 十二宫
  命宫: "Mệnh", 兄弟: "Huynh Đệ", 夫妻: "Phu Thê", 子女: "Tử Tức", 财帛: "Tài Bạch", 疾厄: "Tật Ách",
  迁移: "Thiên Di", 交友: "Nô Bộc", 官禄: "Quan Lộc", 田宅: "Điền Trạch", 福德: "Phúc Đức", 父母: "Phụ Mẫu",
  // 十四主星
  紫微: "Tử Vi", 天机: "Thiên Cơ", 太阳: "Thái Dương", 武曲: "Vũ Khúc", 天同: "Thiên Đồng", 廉贞: "Liêm Trinh",
  天府: "Thiên Phủ", 太阴: "Thái Âm", 贪狼: "Tham Lang", 巨门: "Cự Môn", 天相: "Thiên Tướng", 天梁: "Thiên Lương",
  七杀: "Thất Sát", 破军: "Phá Quân",
  // 辅星
  文昌: "Văn Xương", 文曲: "Văn Khúc", 左辅: "Tả Phù", 右弼: "Hữu Bật", 天魁: "Thiên Khôi", 天钺: "Thiên Việt",
  禄存: "Lộc Tồn", 擎羊: "Kình Dương", 陀罗: "Đà La", 火星: "Hỏa Tinh", 铃星: "Linh Tinh", 地空: "Địa Không",
  地劫: "Địa Kiếp", 天马: "Thiên Mã",
  // 杂曜
  天刑: "Thiên Hình", 天姚: "Thiên Diêu", 红鸾: "Hồng Loan", 天喜: "Thiên Hỷ", 天哭: "Thiên Khốc", 天虚: "Thiên Hư",
  // 庙旺
  庙: "Miếu", 旺: "Vượng", 得地: "Đắc", 利: "Lợi", 平: "Bình", 不得地: "Bất Đắc", 落陷: "Hãm",
  // 四化
  化禄: "Hóa Lộc", 化权: "Hóa Quyền", 化科: "Hóa Khoa", 化忌: "Hóa Kỵ",
  // 天干
  甲: "Giáp", 乙: "Ất", 丙: "Bính", 丁: "Đinh", 戊: "Mậu", 己: "Kỷ", 庚: "Canh", 辛: "Tân", 壬: "Nhâm", 癸: "Quý",
  // 地支
  子: "Tý", 丑: "Sửu", 寅: "Dần", 卯: "Mão", 辰: "Thìn", 巳: "Tỵ", 午: "Ngọ", 未: "Mùi", 申: "Thân", 酉: "Dậu",
  戌: "Tuất", 亥: "Hợi",
  // 五行局
  水二局: "Thủy Nhị Cục", 木三局: "Mộc Tam Cục", 金四局: "Kim Tứ Cục", 土五局: "Thổ Ngũ Cục", 火六局: "Hỏa Lục Cục",
  顺行: "Thuận hành", 逆行: "Nghịch hành", 阳: "Dương", 阴: "Âm", 男: "Nam", 女: "Nữ",
};

export function vi(han: string): string {
  if (VI[han]) return VI[han];
  // Can chi ghép (vd 甲子) hoặc giờ (子时)
  const chars = [...han.replace(/时$/, "")];
  if (chars.length > 0 && chars.every((c) => VI[c])) return chars.map((c) => VI[c]).join(" ");
  return han;
}

export function viHan(han: string): string {
  const v = vi(han);
  return v === han ? han : `${v} ${han}`;
}

export const SIHUA_SHORT: Record<string, string> = { 化禄: "Lộc", 化权: "Quyền", 化科: "Khoa", 化忌: "Kỵ" };

export function translateWarning(w: string): string {
  if (w.includes("时辰交界"))
    return "Giờ sinh cách ranh giới giờ âm lịch dưới 15 phút. Nếu giờ sinh lệch, lá số sẽ thay đổi toàn bộ; nên lập thêm lá số giờ liền kề để đối chiếu.";
  if (w.includes("23 点后"))
    return "Sinh sau 23h: đã lập theo giờ Tý của ngày hôm sau (ngày âm lịch tính sang ngày kế tiếp). Có thể đổi quy ước ở mục Tùy chọn nâng cao.";
  if (w.includes("闰"))
    return "Sinh vào tháng nhuận âm lịch: ngày 1-15 tính theo tháng hiện tại, từ ngày 16 tính sang tháng sau.";
  return w;
}
