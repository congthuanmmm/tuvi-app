import { NextResponse } from "next/server";
import type { Content } from "@google/genai";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { generate } from "@/lib/ai/gemini";
import { DAILY_LIMIT, MAX_QUESTION_CHARS, READING_INSTRUCTION, chartContext } from "@/lib/ai/prompt";

export const runtime = "nodejs";
export const maxDuration = 180;

const err = (status: number, error: string) => NextResponse.json({ error }, { status });

export async function POST(req: Request) {
  const token = req.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
  if (!token) return err(401, "Vui lòng đăng nhập");
  const { data: auth } = await supabaseAdmin.auth.getUser(token);
  const user = auth.user;
  if (!user) return err(401, "Phiên đăng nhập hết hạn, vui lòng đăng nhập lại");

  let body: { chart_id?: unknown; question?: unknown };
  try {
    body = await req.json();
  } catch {
    return err(400, "Dữ liệu không hợp lệ");
  }
  const chartId = typeof body.chart_id === "string" ? body.chart_id : "";
  const question = typeof body.question === "string" ? body.question.trim() : "";
  if (!chartId) return err(400, "Thiếu lá số");
  if (question.length > MAX_QUESTION_CHARS) return err(400, `Câu hỏi tối đa ${MAX_QUESTION_CHARS} ký tự`);

  const { data: chart } = await supabaseAdmin
    .from("charts").select("id, label, result").eq("id", chartId).eq("user_id", user.id).maybeSingle();
  if (!chart) return err(404, "Không tìm thấy lá số");

  const { data: history, error: historyError } = await supabaseAdmin
    .from("messages").select("role, content").eq("chart_id", chartId).order("id");
  if (historyError) return err(500, "Không tải được lịch sử luận giải, vui lòng thử lại");
  const messages = history ?? [];
  if (!question && messages.length > 0) return err(400, "Lá số này đã được luận giải");
  if (question && messages.length === 0) return err(400, "Hãy bấm Luận giải trước khi hỏi thêm");

  const { data: used, error: rpcError } = await supabaseAdmin.rpc("consume_ai_credit", {
    p_user: user.id,
    p_limit: DAILY_LIMIT,
  });
  if (rpcError) return err(500, "Không kiểm tra được lượt dùng");
  if (used === null) return err(429, `Bạn đã dùng hết ${DAILY_LIMIT} lượt hôm nay. Quay lại vào ngày mai nhé.`);

  const contents: Content[] = [
    { role: "user", parts: [{ text: `${chartContext(chart.result, chart.label)}\n\n${READING_INSTRUCTION}` }] },
    ...messages.map((m) => ({ role: m.role === "assistant" ? "model" : "user", parts: [{ text: m.content }] })),
  ];
  if (question) contents.push({ role: "user", parts: [{ text: question }] });

  let answer: string;
  try {
    answer = await generate(contents);
  } catch (e) {
    console.error("gemini error", e);
    await supabaseAdmin.rpc("refund_ai_credit", { p_user: user.id });
    return err(502, "AI đang bận, vui lòng thử lại sau. Lượt dùng chưa bị trừ.");
  }

  const rows = [
    ...(question ? [{ chart_id: chartId, user_id: user.id, role: "user", content: question }] : []),
    { chart_id: chartId, user_id: user.id, role: "assistant", content: answer },
  ];
  const { error: saveError } = await supabaseAdmin.from("messages").insert(rows);
  if (saveError) {
    console.error("save messages error", saveError);
    await supabaseAdmin.rpc("refund_ai_credit", { p_user: user.id });
    return err(500, "Không lưu được câu trả lời, vui lòng thử lại. Lượt dùng chưa bị trừ.");
  }

  return NextResponse.json({ answer, used, limit: DAILY_LIMIT });
}
