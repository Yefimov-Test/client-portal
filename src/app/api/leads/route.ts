import { NextResponse } from "next/server";

const N8N_WEBHOOK_URL = process.env.N8N_WEBHOOK_URL || "https://bot-n8.lol/webhook/crm-lead";

export async function POST(request: Request) {
  const body = await request.json();

  const { name, email, phone, topic, message } = body;

  if (!name || !email || !topic || !message) {
    return NextResponse.json(
      { error: "Missing required fields" },
      { status: 400 }
    );
  }

  // Send success to client immediately, process in n8n async
  // Fire webhook to n8n (don't await — client gets instant response)
  fetch(N8N_WEBHOOK_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, email, phone: phone || null, topic, message }),
  }).catch((err) => {
    console.error("n8n webhook failed:", err);
  });

  return NextResponse.json({ success: true });
}
