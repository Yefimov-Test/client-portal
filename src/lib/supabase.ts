import { createBrowserClient as createBrowser } from "@supabase/ssr";

// Browser client (Client Components) — singleton, automatic cookie handling
export function createBrowserClient() {
  return createBrowser(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
