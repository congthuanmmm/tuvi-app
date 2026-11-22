import { supabase } from "@/lib/supabase/client";
import type { BirthInput, ChartResult } from "@/lib/ziwei/types";

export const TEMP_KEY = "lsv:temp-chart";

export interface StoredChart {
  birth: BirthInput;
  result: ChartResult;
}

export async function computeChart(birth: BirthInput): Promise<ChartResult> {
  const res = await fetch("/api/chart", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(birth),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || "Không lập được lá số");
  return data as ChartResult;
}

export async function saveChart(userId: string, { birth, result }: StoredChart): Promise<string> {
  const { data, error } = await supabase
    .from("charts")
    .insert({ user_id: userId, label: birth.name ?? null, birth, result })
    .select("id")
    .single();
  if (error) throw new Error("Không lưu được lá số, vui lòng thử lại.");
  return data.id as string;
}

export function readTempChart(): StoredChart | null {
  try {
    const raw = sessionStorage.getItem(TEMP_KEY);
    return raw ? (JSON.parse(raw) as StoredChart) : null;
  } catch {
    return null;
  }
}
