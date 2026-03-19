"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { formatDistanceToNow } from "date-fns";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Lead, LeadPriority } from "@/types";

const priorityConfig: Record<
  NonNullable<LeadPriority>,
  { variant: "destructive" | "default" | "secondary"; label: string }
> = {
  hot: { variant: "destructive", label: "Hot" },
  warm: { variant: "default", label: "Warm" },
  cold: { variant: "secondary", label: "Cold" },
};

const topicLabels: Record<string, string> = {
  strategy: "Strategy",
  marketing: "Marketing",
  operations: "Operations",
  other: "Other",
};

interface LeadCardProps {
  lead: Lead;
  onClick: () => void;
  isDragOverlay?: boolean;
}

export function LeadCard({ lead, onClick, isDragOverlay }: LeadCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: lead.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const priority = lead.priority
    ? priorityConfig[lead.priority]
    : null;

  return (
    <div
      ref={isDragOverlay ? undefined : setNodeRef}
      style={isDragOverlay ? undefined : style}
      {...(isDragOverlay ? {} : attributes)}
      {...(isDragOverlay ? {} : listeners)}
    >
      <Card
        size="sm"
        className={`cursor-grab active:cursor-grabbing transition-opacity ${
          isDragging ? "opacity-40" : ""
        } ${isDragOverlay ? "shadow-xl ring-2 ring-primary/30" : ""}`}
        onClick={(e) => {
          // Don't open sheet if dragging
          if (isDragging) return;
          e.stopPropagation();
          onClick();
        }}
      >
        <CardContent className="space-y-1.5">
          <div className="flex items-center justify-between gap-2">
            <span className="font-medium text-sm truncate">{lead.name}</span>
            {priority && (
              <Badge variant={priority.variant} className="shrink-0 text-[10px] px-1.5">
                {priority.label}
              </Badge>
            )}
          </div>
          <p className="text-xs text-muted-foreground truncate">{lead.email}</p>
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>{topicLabels[lead.topic] ?? lead.topic}</span>
            <span>
              {formatDistanceToNow(new Date(lead.created_at), {
                addSuffix: true,
              })}
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
