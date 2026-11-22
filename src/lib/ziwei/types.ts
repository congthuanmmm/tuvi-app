export type SihuaType = "化禄" | "化权" | "化科" | "化忌";

export interface StarRef {
  name: string;
  brightness?: string;
  sihua?: SihuaType | null;
}

export interface Palace {
  name: string;
  branch: string;
  stem: string;
  ganzhi: string;
  is_shen_gong: boolean;
  major_stars: StarRef[];
  minor_stars: StarRef[];
  adjective_stars: string[];
  decadal: { start_age: number; end_age: number };
}

export interface SihuaItem {
  type: SihuaType;
  star: string;
  branch: string;
  palace: string;
}

export interface ChartResult {
  normalized_input: {
    calendar_type: "solar" | "lunar";
    civil_solar_datetime: string;
    gender: "男" | "女";
    late_zi_rule: string;
  };
  calendar: {
    chart_solar_date: string;
    lunar_year: number;
    lunar_month: number;
    lunar_day: number;
    is_leap_month: boolean;
    year_ganzhi: string;
    year_yinyang: "阳" | "阴";
    hour_branch: string;
  };
  chart: {
    ming_gong: { branch: string; ganzhi: string };
    shen_gong: { branch: string; palace: string };
    wuxing_ju: { name: string; number: number };
    ming_zhu: string;
    shen_zhu: string;
    decadal_direction: "顺行" | "逆行";
    year_sihua: SihuaItem[];
    palaces: Palace[];
  };
  horoscope?: {
    query_lunar_year: number;
    nominal_age: number;
    yearly: { ganzhi: string; ming_branch: string; ming_on_natal_palace: string; sihua: SihuaItem[] };
    decadal: {
      branch: string;
      ganzhi: string;
      natal_palace: string;
      start_age: number;
      end_age: number;
      sihua: SihuaItem[];
    } | null;
  };
  warnings: string[];
}

export interface BirthInput {
  calendar_type: "solar" | "lunar";
  birth_time: { year: number; month: number; day: number; hour: number; minute: number; is_leap_month?: boolean };
  gender: "男" | "女";
  late_zi_rule: "next_day" | "same_day";
  name?: string;
  birthplace?: string;
}
