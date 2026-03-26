import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { createClient } from "@supabase/supabase-js";

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN!;
const SESSION_SECRET = process.env.SESSION_SECRET!;

function verifyTelegramData(data: Record<string, string>): boolean {
  const { hash, ...fields } = data;
  if (!hash) return false;

  // Check auth_date is not older than 24 hours
  const authDate = parseInt(fields.auth_date, 10);
  if (Date.now() / 1000 - authDate > 86400) return false;

  // secretKey = SHA256(botToken)
  const secretKey = crypto.createHash("sha256").update(BOT_TOKEN).digest();

  // checkString = sorted key=value pairs joined by \n
  const checkString = Object.entries(fields)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([k, v]) => `${k}=${v}`)
    .join("\n");

  const expectedHash = crypto
    .createHmac("sha256", secretKey)
    .update(checkString)
    .digest("hex");

  return expectedHash === hash;
}

function createSessionCookie(payload: Record<string, unknown>): string {
  const data = Buffer.from(JSON.stringify(payload)).toString("base64");
  const signature = crypto
    .createHmac("sha256", SESSION_SECRET)
    .update(data)
    .digest("hex");
  return `${data}.${signature}`;
}

export async function POST(request: NextRequest) {
  const body = await request.json();

  // Verify Telegram data
  const stringFields: Record<string, string> = {};
  for (const [key, value] of Object.entries(body)) {
    stringFields[key] = String(value);
  }

  if (!verifyTelegramData(stringFields)) {
    return NextResponse.json(
      { error: "Invalid Telegram data" },
      { status: 401 }
    );
  }

  // Supabase admin client (bypasses RLS)
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  // Check existing profile to preserve role
  const { data: existing } = await supabase
    .from("portal_profiles")
    .select("role")
    .eq("telegram_id", body.id)
    .single();

  const role = existing?.role === "admin" ? "admin" : "client";

  const displayName =
    [body.first_name, body.last_name].filter(Boolean).join(" ") ||
    body.username ||
    `tg_${body.id}`;

  // Upsert profile
  await supabase.from("portal_profiles").upsert(
    {
      id: crypto.randomUUID(),
      telegram_id: body.id,
      telegram_username: body.username || null,
      display_name: displayName,
      avatar_url: body.photo_url || null,
      auth_method: "telegram",
      role,
    },
    { onConflict: "telegram_id" }
  );

  // Get the profile we just upserted
  const { data: profile } = await supabase
    .from("portal_profiles")
    .select("id, display_name, role, plan")
    .eq("telegram_id", body.id)
    .single();

  // Create custom session cookie
  const sessionValue = createSessionCookie({
    id: profile!.id,
    telegram_id: body.id,
    display_name: profile!.display_name,
    role: profile!.role,
    plan: profile!.plan,
  });

  const response = NextResponse.json({ success: true });
  response.cookies.set("tg_session", sessionValue, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7, // 7 days
  });

  return response;
}
