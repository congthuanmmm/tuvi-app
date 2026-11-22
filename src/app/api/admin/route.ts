import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const ADMIN_EMAILS = (process.env.ADMIN_EMAILS ?? "")
  .split(",").map((e) => e.trim().toLowerCase()).filter(Boolean);

const PAGE = 1000;

export async function GET(req: Request) {
  const notFound = NextResponse.json({ error: "Not found" }, { status: 404 });
  const token = req.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
  if (!token) return notFound;
  const { data: auth } = await supabaseAdmin.auth.getUser(token);
  const email = auth.user?.email?.toLowerCase();
  if (!email || !ADMIN_EMAILS.includes(email)) return notFound;

  const users: unknown[] = [];
  for (let from = 0; ; from += PAGE) {
    const { data, error } = await supabaseAdmin.rpc("admin_users").range(from, from + PAGE - 1);
    if (error) return NextResponse.json({ error: "Không tải được dữ liệu" }, { status: 500 });
    users.push(...(data ?? []));
    if (!data || data.length < PAGE) break;
  }
  return NextResponse.json({ users }, { headers: { "Cache-Control": "no-store" } });
}
