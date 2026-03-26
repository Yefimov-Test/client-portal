import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { createServerSupabaseClient } from "@/lib/supabase-server";
import { verifySessionCookie } from "@/lib/telegram-session";
import { SignOutButton } from "./sign-out-button";
import { NoteForm } from "./note-form";
import { DeleteNoteButton } from "./delete-note-button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

export default async function DashboardPage() {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Check Telegram session if no Supabase user
  const cookieStore = await cookies();
  const tgCookie = cookieStore.get("tg_session")?.value;
  const tgUser = tgCookie ? verifySessionCookie(tgCookie) : null;

  if (!user && !tgUser) {
    redirect("/login");
  }

  let profile = null;
  let notes: Array<{
    id: string;
    title: string;
    content: string;
    created_at: string;
  }> = [];

  if (user) {
    // Supabase user (email/password, Google, GitHub)
    const { data } = await supabase
      .from("portal_profiles")
      .select("*")
      .eq("id", user.id)
      .single();
    profile = data;

    const { data: userNotes } = await supabase
      .from("portal_notes")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });
    notes = userNotes || [];
  } else if (tgUser) {
    // Telegram user — data from cookie
    profile = {
      display_name: tgUser.display_name as string,
      auth_method: "telegram",
      role: tgUser.role as string,
      plan: tgUser.plan as string,
    };
    // Telegram users don't have Supabase JWT, so no RLS-based notes query
    // Notes feature requires Supabase auth
  }

  const displayEmail = user?.email ?? "Telegram login";

  return (
    <div className="w-full max-w-2xl space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Dashboard</CardTitle>
          <CardDescription>Welcome to your Client Portal</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Name</p>
              <p className="font-medium">
                {profile?.display_name ?? displayEmail}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Email</p>
              <p className="font-medium">{displayEmail}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Auth Method</p>
              <Badge variant="secondary">
                {profile?.auth_method ?? "unknown"}
              </Badge>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Plan</p>
              <Badge>{profile?.plan ?? "basic"}</Badge>
            </div>
          </div>
          <SignOutButton />
        </CardContent>
      </Card>

      {user && (
        <Card>
          <CardHeader>
            <CardTitle>My Notes</CardTitle>
            <CardDescription>
              Personal notes for your consulting sessions
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <NoteForm />

            {notes.length > 0 && (
              <>
                <Separator />
                <div className="space-y-3">
                  {notes.map((note) => (
                    <div
                      key={note.id}
                      className="flex items-start justify-between gap-3 rounded-lg border p-3"
                    >
                      <div className="min-w-0">
                        <p className="font-medium">{note.title}</p>
                        {note.content && (
                          <p className="text-sm text-muted-foreground mt-1">
                            {note.content}
                          </p>
                        )}
                        <p className="text-xs text-muted-foreground mt-1">
                          {new Date(note.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <DeleteNoteButton noteId={note.id} />
                    </div>
                  ))}
                </div>
              </>
            )}

            {notes.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-4">
                No notes yet. Add your first one above.
              </p>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
