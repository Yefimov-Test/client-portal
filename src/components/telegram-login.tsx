"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export function TelegramLoginButton() {
  const router = useRouter();
  const [waiting, setWaiting] = useState(false);

  async function handleTelegramLogin() {
    setWaiting(true);

    // 1. Get auth token and deep link
    const res = await fetch("/api/auth/telegram", { method: "POST" });
    const { token, deepLink } = await res.json();

    // 2. Open bot in new tab
    window.open(deepLink, "_blank");

    // 3. Poll for confirmation
    const interval = setInterval(async () => {
      const check = await fetch(`/api/auth/telegram?token=${token}`);
      const data = await check.json();

      if (data.confirmed) {
        clearInterval(interval);
        router.push("/dashboard");
      }
    }, 2000);

    // Stop polling after 5 minutes
    setTimeout(() => {
      clearInterval(interval);
      setWaiting(false);
    }, 5 * 60 * 1000);
  }

  return (
    <Button
      variant="outline"
      className="w-full"
      onClick={handleTelegramLogin}
      disabled={waiting}
    >
      <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
        <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
      </svg>
      {waiting ? "Waiting for confirmation in Telegram..." : "Continue with Telegram"}
    </Button>
  );
}
