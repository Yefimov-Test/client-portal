import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN!;

function getSupabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

async function sendTelegramMessage(chatId: number, text: string) {
  await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id: chatId, text }),
  });
}

export async function POST(request: NextRequest) {
  const update = await request.json();

  const message = update.message;
  if (!message?.text) {
    return NextResponse.json({ ok: true });
  }

  const chatId = message.chat.id;
  const text = message.text;

  // Handle /start TOKEN
  if (text.startsWith("/start ")) {
    const token = text.replace("/start ", "").trim();

    if (!token) {
      await sendTelegramMessage(chatId, "Invalid auth link.");
      return NextResponse.json({ ok: true });
    }

    const supabase = getSupabaseAdmin();

    // Check if token exists and not expired (10 min)
    const { data: authRow } = await supabase
      .from("portal_telegram_auth")
      .select("*")
      .eq("token", token)
      .single();

    if (!authRow) {
      await sendTelegramMessage(
        chatId,
        "Auth link expired or invalid. Please try again from the website."
      );
      return NextResponse.json({ ok: true });
    }

    const tenMinAgo = new Date(Date.now() - 10 * 60 * 1000).toISOString();
    if (authRow.created_at < tenMinAgo) {
      await supabase.from("portal_telegram_auth").delete().eq("token", token);
      await sendTelegramMessage(
        chatId,
        "Auth link expired. Please try again from the website."
      );
      return NextResponse.json({ ok: true });
    }

    // Confirm the auth token
    await supabase
      .from("portal_telegram_auth")
      .update({
        confirmed: true,
        telegram_id: message.from.id,
        telegram_username: message.from.username || null,
        first_name: message.from.first_name || null,
        last_name: message.from.last_name || null,
      })
      .eq("token", token);

    await sendTelegramMessage(
      chatId,
      "✅ Authorization successful! You can return to the website now."
    );

    return NextResponse.json({ ok: true });
  }

  // Default /start without token
  if (text === "/start") {
    await sendTelegramMessage(
      chatId,
      "Welcome to Apex Strategy Client Portal bot!\n\nTo log in, use the Telegram button on the website."
    );
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ ok: true });
}
