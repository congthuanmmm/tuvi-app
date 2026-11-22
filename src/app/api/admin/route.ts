import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const ADMIN_EMAILS = (process.env.ADMIN_EMAILS ?? "")
  .split(",").map((e) => e.trim().toLowerCase()).filter(Boolean);

export async function GET(req: Request) {
  const notFound = NextResponse.json({ error: "Not found" }, { status: 404 });
  const token = req.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
  if (!token) return notFound;
  const { data: auth } = await supabaseAdmin.auth.getUser(token);
  const email = auth.user?.email?.toLowerCase();
  if (!email || !ADMIN_EMAILS.includes(email)) return notFound;

  const { data, error } = await supabaseAdmin.rpc("admin_users");
  if (error) return NextResponse.json({ error: "Không tải được dữ liệu" }, { status: 500 });
  return NextResponse.json({ users: data }, { headers: { "Cache-Control": "no-store" } });
}
