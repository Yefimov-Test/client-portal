"use client";

import { format } from "date-fns";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import type { Lead, LeadPriority, LeadStatus } from "@/types";

const priorityConfig: Record<
  NonNullable<LeadPriority>,
  { variant: "destructive" | "default" | "secondary"; label: string }
> = {
  hot: { variant: "destructive", label: "Hot" },
  warm: { variant: "default", label: "Warm" },
  cold: { variant: "secondary", label: "Cold" },
};

const statusLabels: Record<LeadStatus, string> = {
  new: "New",
  contacted: "Contacted",
  qualified: "Qualified",
  proposal: "Proposal",
  closed_won: "Closed Won",
  closed_lost: "Closed Lost",
};

const topicLabels: Record<string, string> = {
  strategy: "Growth Strategy",
  marketing: "Marketing",
  operations: "Operations",
  other: "Other",
};

interface LeadDetailSheetProps {
  lead: Lead | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function DetailRow({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
        {label}
      </span>
      <div className="text-sm">{children}</div>
    </div>
  );
}

export function LeadDetailSheet({
  lead,
  open,
  onOpenChange,
}: LeadDetailSheetProps) {
  if (!lead) return null;

  const priority = lead.priority ? priorityConfig[lead.priority] : null;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="overflow-y-auto">
        <SheetHeader>
          <div className="flex items-center gap-2 flex-wrap">
            <SheetTitle className="text-lg">{lead.name}</SheetTitle>
            {priority && (
              <Badge variant={priority.variant}>{priority.label}</Badge>
            )}
            <Badge variant="outline">{statusLabels[lead.status]}</Badge>
          </div>
          <SheetDescription>{lead.email}</SheetDescription>
        </SheetHeader>

        <Separator />

        <div className="flex flex-col gap-4 px-4">
          <DetailRow label="Email">
            <a
              href={`mailto:${lead.email}`}
              className="text-primary hover:underline"
            >
              {lead.email}
            </a>
          </DetailRow>

          {lead.phone && (
            <DetailRow label="Phone">
              <a
                href={`tel:${lead.phone}`}
                className="text-primary hover:underline"
              >
                {lead.phone}
              </a>
            </DetailRow>
          )}

          <DetailRow label="Topic">
            {topicLabels[lead.topic] ?? lead.topic}
          </DetailRow>

          <DetailRow label="Message">
            <p className="whitespace-pre-wrap text-muted-foreground">
              {lead.message}
            </p>
          </DetailRow>

          <Separator />

          <div className="flex gap-8 text-xs text-muted-foreground">
            <div>
              <span className="font-medium">Created: </span>
              {format(new Date(lead.created_at), "MMM d, yyyy 'at' HH:mm")}
            </div>
            <div>
              <span className="font-medium">Updated: </span>
              {format(new Date(lead.updated_at), "MMM d, yyyy 'at' HH:mm")}
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
