export type LeadStatus =
  | "new"
  | "contacted"
  | "qualified"
  | "proposal"
  | "closed_won"
  | "closed_lost";

export type LeadPriority = "hot" | "warm" | "cold";

export type LeadTopic = "strategy" | "marketing" | "operations" | "other";

export interface Lead {
  id: string;
  name: string;
  email: string;
  phone?: string;
  topic: LeadTopic;
  message: string;
  status: LeadStatus;
  priority?: LeadPriority;
  created_at: string;
  updated_at: string;
}

export interface LeadFormData {
  name: string;
  email: string;
  phone?: string;
  topic: LeadTopic;
  message: string;
}
