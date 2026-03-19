"use client";

import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { LeadCard } from "./lead-card";
import type { Lead, LeadStatus } from "@/types";

const statusLabels: Record<LeadStatus, string> = {
  new: "New",
  contacted: "Contacted",
  qualified: "Qualified",
  proposal: "Proposal",
  closed_won: "Closed Won",
  closed_lost: "Closed Lost",
};

interface KanbanColumnProps {
  status: LeadStatus;
  leads: Lead[];
  onLeadClick: (lead: Lead) => void;
}

export function KanbanColumn({ status, leads, onLeadClick }: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id: status });

  return (
    <div className="flex min-w-[280px] w-[280px] flex-col rounded-lg bg-muted/30">
      <div className="flex items-center justify-between px-3 py-2.5">
        <h3 className="text-sm font-medium text-foreground">
          {statusLabels[status]}
        </h3>
        <Badge variant="outline" className="text-[10px] px-1.5 tabular-nums">
          {leads.length}
        </Badge>
      </div>

      <ScrollArea className="flex-1 px-2 pb-2">
        <SortableContext
          items={leads.map((l) => l.id)}
          strategy={verticalListSortingStrategy}
        >
          <div
            ref={setNodeRef}
            className={`flex min-h-[200px] flex-col gap-2 rounded-md p-1 transition-colors ${
              isOver ? "bg-primary/5 ring-2 ring-primary/30" : ""
            }`}
          >
            {leads.map((lead) => (
              <LeadCard
                key={lead.id}
                lead={lead}
                onClick={() => onLeadClick(lead)}
              />
            ))}
          </div>
        </SortableContext>
      </ScrollArea>
    </div>
  );
}
