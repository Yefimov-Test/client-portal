"use client";

import { deleteNote } from "./actions";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

export function DeleteNoteButton({ noteId }: { noteId: string }) {
  return (
    <Button
      variant="ghost"
      size="icon"
      className="h-6 w-6 shrink-0"
      onClick={() => deleteNote(noteId)}
    >
      <X className="h-4 w-4" />
    </Button>
  );
}
