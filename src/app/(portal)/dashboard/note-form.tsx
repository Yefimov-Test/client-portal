"use client";

import { useRef } from "react";
import { createNote } from "./actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

export function NoteForm() {
  const formRef = useRef<HTMLFormElement>(null);

  async function handleSubmit(formData: FormData) {
    await createNote(formData);
    formRef.current?.reset();
  }

  return (
    <form ref={formRef} action={handleSubmit} className="space-y-3">
      <div className="space-y-1">
        <Label htmlFor="title">Title</Label>
        <Input id="title" name="title" required placeholder="Note title" />
      </div>
      <div className="space-y-1">
        <Label htmlFor="content">Content</Label>
        <Textarea
          id="content"
          name="content"
          placeholder="Write your note..."
          rows={3}
        />
      </div>
      <Button type="submit" className="w-full">
        Add Note
      </Button>
    </form>
  );
}
