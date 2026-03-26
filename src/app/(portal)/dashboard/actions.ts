"use server";

import { createServerSupabaseClientWithCookies } from "@/lib/supabase-server";
import { revalidatePath } from "next/cache";

export async function createNote(formData: FormData) {
  const supabase = await createServerSupabaseClientWithCookies();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("Not authenticated");

  const title = formData.get("title") as string;
  const content = formData.get("content") as string;

  await supabase.from("portal_notes").insert({
    user_id: user.id,
    title,
    content,
  });

  revalidatePath("/dashboard");
}

export async function deleteNote(noteId: string) {
  const supabase = await createServerSupabaseClientWithCookies();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("Not authenticated");

  await supabase.from("portal_notes").delete().eq("id", noteId);

  revalidatePath("/dashboard");
}
