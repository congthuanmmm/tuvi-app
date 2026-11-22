export const PALACE_INFO: { han: string; vi: string; meaning: string }[] = [
  { han: "命宫", vi: "Mệnh", meaning: "Bản chất, tính cách gốc, hướng đi cả đời" },
  { han: "兄弟", vi: "Huynh Đệ", meaning: "Anh chị em, cộng sự thân thiết" },
  { han: "夫妻", vi: "Phu Thê", meaning: "Hôn nhân, bạn đời, cách yêu" },
  { han: "子女", vi: "Tử Tức", meaning: "Con cái, học trò, sức sáng tạo" },
  { han: "财帛", vi: "Tài Bạch", meaning: "Tiền bạc, cách kiếm và giữ tiền" },
  { han: "疾厄", vi: "Tật Ách", meaning: "Thể chất, áp lực, điểm cần giữ gìn" },
  { han: "迁移", vi: "Thiên Di", meaning: "Ra ngoài, đi xa, cơ hội bên ngoài" },
  { han: "交友", vi: "Nô Bộc", meaning: "Bạn bè, đồng nghiệp, cấp dưới" },
  { han: "官禄", vi: "Quan Lộc", meaning: "Sự nghiệp, công danh, cách làm việc" },
  { han: "田宅", vi: "Điền Trạch", meaning: "Nhà cửa, đất đai, môi trường sống" },
  { han: "福德", vi: "Phúc Đức", meaning: "Đời sống tinh thần, hưởng thụ, phúc phần" },
  { han: "父母", vi: "Phụ Mẫu", meaning: "Cha mẹ, người bề trên, giấy tờ" },
];

export const PALACE_MEANING: Record<string, string> = Object.fromEntries(PALACE_INFO.map((p) => [p.han, p.meaning]));
