export type WikiType = "sao" | "cung" | "tu-hoa" | "cach-cuc";

export interface WikiEntry {
  type: WikiType;
  slug: string;
  name: string;
  han: string;
  group: string;
}

const e = (type: WikiType, group: string, list: [string, string, string][]): WikiEntry[] =>
  list.map(([slug, name, han]) => ({ type, slug, name, han, group }));

export const WIKI_TYPES: Record<WikiType, { label: string; description: string }> = {
  sao: { label: "Hệ thống sao", description: "Ý nghĩa 14 chính tinh, lục cát tinh, lục sát tinh và Lộc Mã trong Tử Vi Đẩu Số." },
  cung: { label: "12 cung", description: "Ý nghĩa và cách xem 12 cung trên lá số tử vi, từ cung Mệnh đến cung Phụ Mẫu." },
  "tu-hoa": { label: "Tứ hóa", description: "Hóa Lộc, Hóa Quyền, Hóa Khoa, Hóa Kỵ và bảng tứ hóa theo 10 thiên can." },
  "cach-cuc": { label: "Cách cục", description: "Các cách cục thường gặp trong Tử Vi: điều kiện thành cách, ý nghĩa và điểm cần lưu ý." },
};

export const WIKI_ENTRIES: WikiEntry[] = [
  ...e("sao", "Chính tinh", [
    ["tu-vi", "Tử Vi", "紫微"], ["thien-co", "Thiên Cơ", "天机"], ["thai-duong", "Thái Dương", "太阳"],
    ["vu-khuc", "Vũ Khúc", "武曲"], ["thien-dong", "Thiên Đồng", "天同"], ["liem-trinh", "Liêm Trinh", "廉贞"],
    ["thien-phu", "Thiên Phủ", "天府"], ["thai-am", "Thái Âm", "太阴"], ["tham-lang", "Tham Lang", "贪狼"],
    ["cu-mon", "Cự Môn", "巨门"], ["thien-tuong", "Thiên Tướng", "天相"], ["thien-luong", "Thiên Lương", "天梁"],
    ["that-sat", "Thất Sát", "七杀"], ["pha-quan", "Phá Quân", "破军"],
  ]),
  ...e("sao", "Cát tinh", [
    ["van-xuong", "Văn Xương", "文昌"], ["van-khuc", "Văn Khúc", "文曲"], ["ta-phu", "Tả Phù", "左辅"],
    ["huu-bat", "Hữu Bật", "右弼"], ["thien-khoi", "Thiên Khôi", "天魁"], ["thien-viet", "Thiên Việt", "天钺"],
    ["loc-ton", "Lộc Tồn", "禄存"], ["thien-ma", "Thiên Mã", "天马"],
  ]),
  ...e("sao", "Sát tinh", [
    ["kinh-duong", "Kình Dương", "擎羊"], ["da-la", "Đà La", "陀罗"], ["hoa-tinh", "Hỏa Tinh", "火星"],
    ["linh-tinh", "Linh Tinh", "铃星"], ["dia-khong", "Địa Không", "地空"], ["dia-kiep", "Địa Kiếp", "地劫"],
  ]),
  ...e("cung", "12 cung", [
    ["menh", "Mệnh", "命宫"], ["huynh-de", "Huynh Đệ", "兄弟"], ["phu-the", "Phu Thê", "夫妻"],
    ["tu-tuc", "Tử Tức", "子女"], ["tai-bach", "Tài Bạch", "财帛"], ["tat-ach", "Tật Ách", "疾厄"],
    ["thien-di", "Thiên Di", "迁移"], ["no-boc", "Nô Bộc", "交友"], ["quan-loc", "Quan Lộc", "官禄"],
    ["dien-trach", "Điền Trạch", "田宅"], ["phuc-duc", "Phúc Đức", "福德"], ["phu-mau", "Phụ Mẫu", "父母"],
  ]),
  ...e("tu-hoa", "Tứ hóa", [
    ["hoa-loc", "Hóa Lộc", "化禄"], ["hoa-quyen", "Hóa Quyền", "化权"], ["hoa-khoa", "Hóa Khoa", "化科"], ["hoa-ky", "Hóa Kỵ", "化忌"],
  ]),
  ...e("tu-hoa", "Tứ hóa theo năm sinh", [
    ["nam-giap", "Tứ hóa năm Giáp", "甲年四化"], ["nam-at", "Tứ hóa năm Ất", "乙年四化"], ["nam-binh", "Tứ hóa năm Bính", "丙年四化"],
    ["nam-dinh", "Tứ hóa năm Đinh", "丁年四化"], ["nam-mau", "Tứ hóa năm Mậu", "戊年四化"], ["nam-ky", "Tứ hóa năm Kỷ", "己年四化"],
    ["nam-canh", "Tứ hóa năm Canh", "庚年四化"], ["nam-tan", "Tứ hóa năm Tân", "辛年四化"], ["nam-nham", "Tứ hóa năm Nhâm", "壬年四化"],
    ["nam-quy", "Tứ hóa năm Quý", "癸年四化"],
  ]),
  ...e("cach-cuc", "Cách cục", [
    ["tu-phu-dong-cung", "Tử Phủ đồng cung", "紫府同宫"], ["tu-sat-dong-cung", "Tử Sát đồng cung", "紫杀同宫"],
    ["vu-phu-dong-cung", "Vũ Phủ đồng cung", "武府同宫"], ["nhat-nguyet-tinh-minh", "Nhật Nguyệt tịnh minh", "日月并明"],
    ["nhat-chieu-loi-mon", "Nhật chiếu Lôi Môn", "日照雷门"], ["duong-luong-xuong-loc", "Dương Lương Xương Lộc", "阳梁昌禄"],
    ["co-nguyet-dong-luong", "Cơ Nguyệt Đồng Lương", "机月同梁"], ["hoa-tham-linh-tham", "Hỏa Tham, Linh Tham", "火贪格 / 铃贪格"],
    ["loc-ma-giao-tri", "Lộc Mã giao trì", "禄马交驰"], ["sat-pha-tham", "Sát Phá Tham", "杀破狼"],
    ["menh-vo-chinh-dieu", "Mệnh vô chính diệu", "命无正曜"],
  ]),
];

export const findEntry = (type: string, slug: string) => WIKI_ENTRIES.find((x) => x.type === type && x.slug === slug);
export const entryByHan = (han: string) => WIKI_ENTRIES.find((x) => x.han === han && (x.type === "sao" || x.type === "cung"));
export const wikiPath = (x: Pick<WikiEntry, "type" | "slug">) => `/tu-vi/${x.type}/${x.slug}`;
