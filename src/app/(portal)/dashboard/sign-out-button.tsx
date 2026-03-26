"use client";

import { useRouter } from "next/navigation";
import { createBrowserClient } from "@/lib/supabase";
import { Button } from "@/components/ui/button";

export function SignOutButton() {
  const router = useRouter();

  async function handleSignOut() {
    const supabase = createBrowserClient();
    await supabase.auth.signOut();

    // Also clear Telegram session cookie
    document.cookie = "tg_session=; path=/; max-age=0";

    router.push("/login");
  }

  return (
    <Button variant="outline" className="w-full" onClick={handleSignOut}>
      Sign Out
    </Button>
  );
}
