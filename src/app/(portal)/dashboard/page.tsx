import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase-server";
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

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("portal_profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  const { data: notes } = await supabase
    .from("portal_notes")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

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
                {profile?.display_name ?? user.email}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Email</p>
              <p className="font-medium">{user.email}</p>
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

      <Card>
        <CardHeader>
          <CardTitle>My Notes</CardTitle>
          <CardDescription>
            Personal notes for your consulting sessions
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <NoteForm />

          {notes && notes.length > 0 && (
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

          {(!notes || notes.length === 0) && (
            <p className="text-sm text-muted-foreground text-center py-4">
              No notes yet. Add your first one above.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
