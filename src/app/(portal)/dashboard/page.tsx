import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase-server";
import { SignOutButton } from "./sign-out-button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

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

  return (
    <Card className="w-full max-w-lg">
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
            <Badge variant="secondary">{profile?.auth_method ?? "unknown"}</Badge>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Plan</p>
            <Badge>{profile?.plan ?? "basic"}</Badge>
          </div>
        </div>
        <SignOutButton />
      </CardContent>
    </Card>
  );
}
