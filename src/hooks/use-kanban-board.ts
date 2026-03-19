"use client";

import { useCallback, useEffect, useReducer, useRef, useState } from "react";
import type { DragStartEvent, DragOverEvent, DragEndEvent } from "@dnd-kit/core";
import { arrayMove } from "@dnd-kit/sortable";
import { toast } from "sonner";
import { createBrowserClient } from "@/lib/supabase";
import type { Lead, LeadStatus } from "@/types";

const COLUMN_ORDER: LeadStatus[] = [
  "new",
  "contacted",
  "qualified",
  "proposal",
  "closed_won",
  "closed_lost",
];

type Columns = Record<LeadStatus, Lead[]>;

function emptyColumns(): Columns {
  return {
    new: [],
    contacted: [],
    qualified: [],
    proposal: [],
    closed_won: [],
    closed_lost: [],
  };
}

type Action =
  | { type: "SET_LEADS"; leads: Lead[] }
  | { type: "MOVE_LEAD"; leadId: string; from: LeadStatus; to: LeadStatus; toIndex: number }
  | { type: "ADD_LEAD"; lead: Lead }
  | { type: "UPDATE_LEAD"; lead: Lead };

function kanbanReducer(state: Columns, action: Action): Columns {
  switch (action.type) {
    case "SET_LEADS": {
      const cols = emptyColumns();
      for (const lead of action.leads) {
        const status = lead.status as LeadStatus;
        if (cols[status]) {
          cols[status].push(lead);
        }
      }
      return cols;
    }

    case "MOVE_LEAD": {
      const { leadId, from, to, toIndex } = action;
      if (from === to) {
        // Reorder within same column
        const col = [...state[from]];
        const oldIndex = col.findIndex((l) => l.id === leadId);
        if (oldIndex === -1) return state;
        const reordered = arrayMove(col, oldIndex, toIndex);
        return { ...state, [from]: reordered };
      }

      // Move between columns
      const fromCol = state[from].filter((l) => l.id !== leadId);
      const lead = state[from].find((l) => l.id === leadId);
      if (!lead) return state;

      const toCol = [...state[to]];
      const updatedLead = { ...lead, status: to };
      toCol.splice(toIndex, 0, updatedLead);

      return { ...state, [from]: fromCol, [to]: toCol };
    }

    case "ADD_LEAD": {
      const status = action.lead.status as LeadStatus;
      return {
        ...state,
        [status]: [action.lead, ...state[status]],
      };
    }

    case "UPDATE_LEAD": {
      const oldStatus = Object.keys(state).find((s) =>
        state[s as LeadStatus].some((l) => l.id === action.lead.id)
      ) as LeadStatus | undefined;

      if (!oldStatus) return state;

      const newStatus = action.lead.status as LeadStatus;

      if (oldStatus === newStatus) {
        return {
          ...state,
          [oldStatus]: state[oldStatus].map((l) =>
            l.id === action.lead.id ? action.lead : l
          ),
        };
      }

      // Lead changed status (e.g. from realtime)
      return {
        ...state,
        [oldStatus]: state[oldStatus].filter((l) => l.id !== action.lead.id),
        [newStatus]: [action.lead, ...state[newStatus]],
      };
    }

    default:
      return state;
  }
}

function findColumn(columns: Columns, id: string): LeadStatus | null {
  for (const status of COLUMN_ORDER) {
    if (columns[status].some((l) => l.id === id)) {
      return status;
    }
  }
  // id might be a column id (droppable)
  if (COLUMN_ORDER.includes(id as LeadStatus)) {
    return id as LeadStatus;
  }
  return null;
}

export function useKanbanBoard() {
  const [columns, dispatch] = useReducer(kanbanReducer, emptyColumns());
  const [isLoading, setIsLoading] = useState(true);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [activeId, setActiveId] = useState<string | null>(null);
  const pendingUpdates = useRef(new Set<string>());
  const supabaseRef = useRef(createBrowserClient());

  // Initial fetch
  useEffect(() => {
    async function fetchLeads() {
      const { data, error } = await supabaseRef.current
        .from("leads")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Failed to fetch leads:", error);
        toast.error("Failed to load leads");
      } else {
        dispatch({ type: "SET_LEADS", leads: data as Lead[] });
      }
      setIsLoading(false);
    }

    fetchLeads();
  }, []);

  // Realtime subscription
  useEffect(() => {
    const channel = supabaseRef.current
      .channel("leads-realtime")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "crm_demo", table: "leads" },
        (payload) => {
          const lead = payload.new as Lead;
          if (!pendingUpdates.current.has(lead.id)) {
            dispatch({ type: "ADD_LEAD", lead });
          }
        }
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "crm_demo", table: "leads" },
        (payload) => {
          const lead = payload.new as Lead;
          if (!pendingUpdates.current.has(lead.id)) {
            dispatch({ type: "UPDATE_LEAD", lead });
          }
        }
      )
      .subscribe();

    return () => {
      supabaseRef.current.removeChannel(channel);
    };
  }, []);

  // Drag handlers
  const handleDragStart = useCallback((event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  }, []);

  const handleDragOver = useCallback(
    (event: DragOverEvent) => {
      const { active, over } = event;
      if (!over) return;

      const activeLeadId = active.id as string;
      const overId = over.id as string;

      const fromCol = findColumn(columns, activeLeadId);
      const toCol = findColumn(columns, overId);

      if (!fromCol || !toCol || fromCol === toCol) return;

      // Move to the other column during drag (visual feedback)
      const toIndex = columns[toCol].findIndex((l) => l.id === overId);
      dispatch({
        type: "MOVE_LEAD",
        leadId: activeLeadId,
        from: fromCol,
        to: toCol,
        toIndex: toIndex >= 0 ? toIndex : columns[toCol].length,
      });
    },
    [columns]
  );

  const handleDragEnd = useCallback(
    async (event: DragEndEvent) => {
      const { active, over } = event;
      setActiveId(null);

      if (!over) return;

      const activeLeadId = active.id as string;
      const overId = over.id as string;

      const fromCol = findColumn(columns, activeLeadId);
      const toCol = findColumn(columns, overId);

      if (!fromCol || !toCol) return;

      if (fromCol === toCol) {
        // Reorder within column
        const oldIndex = columns[fromCol].findIndex((l) => l.id === activeLeadId);
        const newIndex = columns[toCol].findIndex((l) => l.id === overId);
        if (oldIndex !== newIndex && newIndex >= 0) {
          dispatch({
            type: "MOVE_LEAD",
            leadId: activeLeadId,
            from: fromCol,
            to: toCol,
            toIndex: newIndex,
          });
        }
        return;
      }

      // Column changed — persist to Supabase
      pendingUpdates.current.add(activeLeadId);

      const { error } = await supabaseRef.current
        .from("leads")
        .update({
          status: toCol,
          updated_at: new Date().toISOString(),
        })
        .eq("id", activeLeadId);

      pendingUpdates.current.delete(activeLeadId);

      if (error) {
        console.error("Failed to update lead status:", error);
        toast.error("Failed to update status");
        // Rollback
        dispatch({
          type: "MOVE_LEAD",
          leadId: activeLeadId,
          from: toCol,
          to: fromCol,
          toIndex: 0,
        });
      }
    },
    [columns]
  );

  const activeLead = activeId
    ? Object.values(columns)
        .flat()
        .find((l) => l.id === activeId) ?? null
    : null;

  return {
    columns,
    isLoading,
    selectedLead,
    setSelectedLead,
    activeId,
    activeLead,
    handleDragStart,
    handleDragOver,
    handleDragEnd,
    columnOrder: COLUMN_ORDER,
  };
}
