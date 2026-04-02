import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createServerSupabaseClient } from "@/lib/supabase-server";
import { verifySessionCookie } from "@/lib/telegram-session";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  // 1. Check auth — Supabase first, then Telegram cookie
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let sessionId: string;

  if (user) {
    sessionId = user.id;
  } else {
    const cookieStore = await cookies();
    const tgCookie = cookieStore.get("tg_session")?.value;
    const tgUser = tgCookie ? verifySessionCookie(tgCookie) : null;

    if (!tgUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    sessionId = `telegram_${tgUser.telegram_id}`;
  }

  // 2. Read body
  const body = await request.json();
  const { chatInput } = body;

  if (!chatInput || typeof chatInput !== "string") {
    return NextResponse.json({ error: "chatInput required" }, { status: 400 });
  }

  // 3. Proxy to n8n
  try {
    const n8nResponse = await fetch(process.env.N8N_CHAT_WEBHOOK_URL!, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chatInput,
        sessionId,
      }),
    });

    if (!n8nResponse.ok) {
      return NextResponse.json({ error: "Bot unavailable" }, { status: 502 });
    }

    const data = await n8nResponse.json();
    return NextResponse.json({ output: data.output });
  } catch {
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
