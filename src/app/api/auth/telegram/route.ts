import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { createClient } from "@supabase/supabase-js";

const SESSION_SECRET = process.env.SESSION_SECRET!;
const BOT_USERNAME = "stream_client_portal_bot";

function createSessionCookie(payload: Record<string, unknown>): string {
  const data = Buffer.from(JSON.stringify(payload)).toString("base64");
  const signature = crypto
    .createHmac("sha256", SESSION_SECRET)
    .update(data)
    .digest("hex");
  return `${data}.${signature}`;
}

function getSupabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

// POST /api/auth/telegram — generate auth token and return deep link
export async function POST() {
  const token = crypto.randomBytes(32).toString("hex");
  const supabase = getSupabaseAdmin();

  await supabase.from("portal_telegram_auth").insert({ token });

  const deepLink = `https://t.me/${BOT_USERNAME}?start=${token}`;

  return NextResponse.json({ token, deepLink });
}

// GET /api/auth/telegram?token=xxx — poll to check if confirmed
export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get("token");
  if (!token) {
    return NextResponse.json({ error: "Missing token" }, { status: 400 });
  }

  const supabase = getSupabaseAdmin();

  const { data: authRow } = await supabase
    .from("portal_telegram_auth")
    .select("*")
    .eq("token", token)
    .single();

  if (!authRow || !authRow.confirmed) {
    return NextResponse.json({ confirmed: false });
  }

  // Confirmed — create/update profile and set cookie
  const { data: existing } = await supabase
    .from("portal_profiles")
    .select("role")
    .eq("telegram_id", authRow.telegram_id)
    .single();

  const role = existing?.role === "admin" ? "admin" : "client";

  const displayName =
    [authRow.first_name, authRow.last_name].filter(Boolean).join(" ") ||
    authRow.telegram_username ||
    `tg_${authRow.telegram_id}`;

  await supabase.from("portal_profiles").upsert(
    {
      id: crypto.randomUUID(),
      telegram_id: authRow.telegram_id,
      telegram_username: authRow.telegram_username || null,
      display_name: displayName,
      auth_method: "telegram",
      role,
    },
    { onConflict: "telegram_id" }
  );

  const { data: profile } = await supabase
    .from("portal_profiles")
    .select("id, display_name, role, plan")
    .eq("telegram_id", authRow.telegram_id)
    .single();

  // Clean up used token
  await supabase.from("portal_telegram_auth").delete().eq("token", token);

  // Set session cookie
  const sessionValue = createSessionCookie({
    id: profile!.id,
    telegram_id: authRow.telegram_id,
    display_name: profile!.display_name,
    role: profile!.role,
    plan: profile!.plan,
  });

  const response = NextResponse.json({ confirmed: true });
  response.cookies.set("tg_session", sessionValue, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });

  return response;
}
