import type { Metadata } from "next";
import { KanbanBoard } from "@/components/crm/kanban-board";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Dashboard | Apex Strategy CRM",
};

export default function DashboardPage() {
  return <KanbanBoard />;
}
