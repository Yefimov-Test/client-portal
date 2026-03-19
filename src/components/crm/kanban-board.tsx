"use client";

import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  closestCorners,
} from "@dnd-kit/core";
import { useKanbanBoard } from "@/hooks/use-kanban-board";
import { KanbanColumn } from "./kanban-column";
import { LeadCard } from "./lead-card";
import { LeadDetailSheet } from "./lead-detail-sheet";
import { Skeleton } from "@/components/ui/skeleton";

function KanbanSkeleton() {
  return (
    <div className="flex gap-4 overflow-x-auto px-4 pb-4 pt-2">
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={i}
          className="flex min-w-[280px] w-[280px] flex-col gap-3 rounded-lg bg-muted/30 p-3"
        >
          <div className="flex items-center justify-between">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-5 w-6 rounded-full" />
          </div>
          {Array.from({ length: 2 + (i % 3) }).map((_, j) => (
            <Skeleton key={j} className="h-[76px] w-full rounded-lg" />
          ))}
        </div>
      ))}
    </div>
  );
}

export function KanbanBoard() {
  const {
    columns,
    isLoading,
    selectedLead,
    setSelectedLead,
    activeLead,
    handleDragStart,
    handleDragOver,
    handleDragEnd,
    columnOrder,
  } = useKanbanBoard();

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    })
  );

  if (isLoading) {
    return <KanbanSkeleton />;
  }

  return (
    <>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        <div className="flex h-full gap-4 overflow-x-auto px-4 pb-4 pt-2">
          {columnOrder.map((status) => (
            <KanbanColumn
              key={status}
              status={status}
              leads={columns[status]}
              onLeadClick={setSelectedLead}
            />
          ))}
        </div>

        <DragOverlay>
          {activeLead ? (
            <div className="z-50 w-[264px]">
              <LeadCard
                lead={activeLead}
                onClick={() => {}}
                isDragOverlay
              />
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>

      <LeadDetailSheet
        lead={selectedLead}
        open={!!selectedLead}
        onOpenChange={(open) => {
          if (!open) setSelectedLead(null);
        }}
      />
    </>
  );
}
