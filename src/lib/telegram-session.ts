import crypto from "crypto";

const SESSION_SECRET = process.env.SESSION_SECRET!;

export function verifySessionCookie(
  cookie: string
): Record<string, unknown> | null {
  const [data, signature] = cookie.split(".");
  if (!data || !signature) return null;

  const expectedSignature = crypto
    .createHmac("sha256", SESSION_SECRET)
    .update(data)
    .digest("hex");

  if (expectedSignature !== signature) return null;

  try {
    return JSON.parse(Buffer.from(data, "base64").toString("utf-8"));
  } catch {
    return null;
  }
}
